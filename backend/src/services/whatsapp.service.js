import fs from 'node:fs';
import path from 'node:path';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import { logger } from '../utils/logger.js';

const sessionMap = new Map();
const chatMap = new Map();
const messageMap = new Map();

function sessionDirectory(sessionId) {
  const dir = path.join(process.cwd(), '.sessions', sessionId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function normalizeText(message) {
  if (!message) return '';
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentWithCaptionMessage?.message?.documentMessage?.caption ||
    ''
  );
}

function ensureChat(sessionId, jid, name = jid) {
  if (!chatMap.has(sessionId)) chatMap.set(sessionId, new Map());
  const list = chatMap.get(sessionId);
  if (!list.has(jid)) {
    list.set(jid, { jid, name, unreadCount: 0, lastMessage: '', lastMessageTime: 0 });
  }
  return list.get(jid);
}

function cacheMessage(sessionId, incomingMessage) {
  const jid = incomingMessage.key?.remoteJid;
  if (!jid) return;

  const chat = ensureChat(sessionId, jid, jid);
  const text = normalizeText(incomingMessage.message);
  const payload = {
    id: incomingMessage.key.id,
    jid,
    fromMe: !!incomingMessage.key.fromMe,
    sender: incomingMessage.key.participant || jid,
    text,
    timestamp: Number(incomingMessage.messageTimestamp || Date.now())
  };

  if (!messageMap.has(sessionId)) messageMap.set(sessionId, new Map());
  const existing = messageMap.get(sessionId);
  if (!existing.has(jid)) existing.set(jid, []);

  const list = existing.get(jid);
  if (!list.some((item) => item.id === payload.id)) {
    list.push(payload);
  }

  chat.lastMessage = text;
  chat.lastMessageTime = payload.timestamp;
  if (!payload.fromMe) {
    chat.unreadCount = (chat.unreadCount || 0) + 1;
  }
}

export async function connectSession(sessionId) {
  const { state, saveCreds } = await useMultiFileAuthState(sessionDirectory(sessionId));
  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    auth: state,
    browser: Browsers.ubuntu('Chrome'),
    printQRInTerminal: false,
    markOnlineOnConnect: false
  });

  const entry = { socket, connected: false, qr: null, qrDataUrl: null, reconnecting: false };
  sessionMap.set(sessionId, entry);

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      entry.qr = qr;
      QRCode.toDataURL(qr).then((dataUrl) => {
        entry.qrDataUrl = dataUrl;
      }).catch((error) => logger.error('QR render error', error));
    }

    if (connection === 'open') {
      entry.connected = true;
      entry.qr = null;
      entry.qrDataUrl = null;
      logger.info({ sessionId }, 'WhatsApp session connected');
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect && !entry.reconnecting) {
        entry.reconnecting = true;
        logger.warn({ sessionId }, 'Session closed. Reconnection scheduled.');
        setTimeout(() => {
          entry.reconnecting = false;
          connectSession(sessionId).catch((error) => logger.error({ sessionId, error }, 'Reconnect failed'));
        }, 1500);
      }
    }
  });

  socket.ev.on('chats.upsert', (items = []) => {
    for (const chat of items) {
      ensureChat(sessionId, chat.id, chat.name || chat.id);
    }
  });

  socket.ev.on('messaging-history.set', ({ chats = [], messages = [] }) => {
    for (const chat of chats) {
      ensureChat(sessionId, chat.id, chat.name || chat.id);
    }
    for (const msg of messages) {
      cacheMessage(sessionId, msg);
    }
  });

  socket.ev.on('messages.upsert', ({ messages = [] }) => {
    for (const msg of messages) {
      if (!msg.key?.fromMe) {
        cacheMessage(sessionId, msg);
      }
    }
  });

  return socket;
}

export function status(sessionId) {
  const entry = sessionMap.get(sessionId);
  if (!entry) {
    return { connected: false, qr: null };
  }

  return {
    connected: entry.connected,
    qr: entry.qrDataUrl || null
  };
}

export function chats(sessionId) {
  const list = chatMap.get(sessionId);
  if (!list) return [];
  return [...list.values()].sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
}

export function messages(sessionId, jid) {
  const all = messageMap.get(sessionId);
  return all ? (all.get(jid) || []) : [];
}

export async function sendText(sessionId, jid, text) {
  const entry = sessionMap.get(sessionId);
  if (!entry || !entry.connected || !entry.socket) {
    throw new Error('WhatsApp session is not connected');
  }

  await entry.socket.sendMessage(jid, { text });
}

export async function readMessages(sessionId, jid, ids = []) {
  const entry = sessionMap.get(sessionId);
  if (!entry || !entry.connected || !entry.socket) {
    throw new Error('WhatsApp session is not connected');
  }

  for (const messageId of ids) {
    await entry.socket.readMessages([{ remoteJid: jid, id: messageId }]);
  }
}

export async function reactToMessage(sessionId, jid, messageId, emoji = '👍') {
  const entry = sessionMap.get(sessionId);
  if (!entry || !entry.connected || !entry.socket) {
    throw new Error('WhatsApp session is not connected');
  }

  await entry.socket.sendMessage(jid, {
    react: {
      text: emoji,
      key: {
        remoteJid: jid,
        id: messageId,
        fromMe: false
      }
    }
  });
}

export async function sendTypingState(sessionId, jid, enabled = true) {
  const entry = sessionMap.get(sessionId);
  if (!entry || !entry.connected || !entry.socket) {
    throw new Error('WhatsApp session is not connected');
  }

  await entry.socket.sendPresenceUpdate(enabled ? 'composing' : 'paused', jid);
}

export async function disconnectSession(sessionId) {
  const entry = sessionMap.get(sessionId);
  if (!entry) return;

  try {
    entry.socket?.ws?.close();
  } catch (error) {
    logger.warn({ error, sessionId }, 'Socket close warning');
  }

  sessionMap.delete(sessionId);
}
