import { Boom } from '@hapi/boom';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

const sessions = new Map();

export function getSessionSocket(sessionId) {
  return sessions.get(sessionId) || null;
}

export function getSessionMeta(sessionId) {
  return sessions.get(sessionId)?.meta || null;
}

export async function connectSession(sessionId) {
  const dir = path.join(process.cwd(), '.sessions', sessionId);
  fs.mkdirSync(dir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    browser: Browsers.ubuntu('Chrome'),
  });

  sessions.set(sessionId, { socket: sock, meta: { connected: false, qr: null } });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      const meta = sessions.get(sessionId);
      if (meta) meta.meta.qr = qr;
    }

    if (connection === 'open') {
      const meta = sessions.get(sessionId);
      if (meta) meta.meta.connected = true;
      logger.info(`Session connected: ${sessionId}`);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error || new Boom('Unknown')).output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        logger.warn(`Reconnect needed for session: ${sessionId}`);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (event) => {
    const { messages } = event;
    for (const message of messages) {
      if (!message.message || message.key.fromMe) continue;
      logger.info(`Incoming message from ${message.key.remoteJid}`);
    }
  });

  return { sessionId, qr: null, connected: false };
}

export async function getQRForSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return { qr: null, connected: false };
  return { qr: session.meta.qr, connected: session.meta.connected };
}

export async function sendTextMessage(sessionId, jid, text) {
  const session = sessions.get(sessionId);
  if (!session) throw new Error('Session not found');
  const { socket } = session;

  await socket.sendMessage(jid, { text });
  return { ok: true };
}

export async function fetchChats(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) throw new Error('Session not found');

  const { socket } = session;
  const chats = await socket.store?.chats?.all?.();
  return chats || [];
}

export async function fetchChatMessages(sessionId, jid) {
  const session = sessions.get(sessionId);
  if (!session) throw new Error('Session not found');

  const { socket } = session;
  const messages = await socket.store?.messages?.[jid]?.all?.() || [];
  return messages.map((m) => ({
    id: m.key.id,
    fromMe: m.key.fromMe,
    text: m.message?.conversation || m.message?.extendedTextMessage?.text || '',
    timestamp: m.messageTimestamp,
    sender: m.key.remoteJid,
  }));
}

export async function markMessageAsRead(sessionId, jid, ids) {
  const session = sessions.get(sessionId);
  if (!session) throw new Error('Session not found');
  const { socket } = session;

  for (const id of ids) {
    try {
      await socket.readMessages([ { remoteJid: jid, id, participant: jid } ]);
    } catch (error) {
      logger.warn(`Failed to read message ${id}: ${error.message}`);
    }
  }

  return { ok: true };
}

export async function addReaction(sessionId, jid, messageId, emoji = '👍') {
  const session = sessions.get(sessionId);
  if (!session) throw new Error('Session not found');
  const { socket } = session;

  await socket.sendMessage(jid, {
    react: {
      text: emoji,
      key: { remoteJid: jid, id: messageId, fromMe: false }
    }
  });

  return { ok: true };
}

export async function setTypingIndicator(sessionId, jid, enabled = true) {
  const session = sessions.get(sessionId);
  if (!session) throw new Error('Session not found');
  const { socket } = session;

  if (enabled) {
    await socket.sendPresenceUpdate('composing', jid);
  } else {
    await socket.sendPresenceUpdate('paused', jid);
  }

  return { ok: true };
}

export async function getConnectionStatus(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return { connected: false, qr: null };
  return {
    connected: session.meta.connected,
    qr: session.meta.qr,
  };
}

export async function disconnectSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return { ok: true };
  session.socket.ws.close();
  sessions.delete(sessionId);
  return { ok: true };
}
