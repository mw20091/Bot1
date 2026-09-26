import makeWASocket, { Browsers, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../utils/logger.js';

const sessions = new Map();
const chatCache = new Map();
const messageCache = new Map();

function sessionDir(id) { const dir = path.join(process.cwd(), '.sessions', id); fs.mkdirSync(dir, { recursive: true }); return dir; }
function textOf(message) { return message?.conversation || message?.extendedTextMessage?.text || message?.imageMessage?.caption || ''; }
function ensureChat(id, jid, name = jid) { if (!chatCache.has(id)) chatCache.set(id, new Map()); const chats = chatCache.get(id); if (!chats.has(jid)) chats.set(jid, { jid, name, unreadCount: 0, lastMessage: '', lastMessageTime: 0 }); return chats.get(jid); }

export async function connectSession(id) {
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir(id));
  const { version } = await fetchLatestBaileysVersion();
  const socket = makeWASocket({ version, auth: state, browser: Browsers.ubuntu('Chrome'), printQRInTerminal: false, markOnlineOnConnect: false });
  const entry = { socket, connected: false, qr: null, reconnecting: false };
  sessions.set(id, entry);
  socket.ev.on('creds.update', saveCreds);
  socket.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) { entry.qr = qr; QRCode.toDataURL(qr).then((data) => { entry.qrDataUrl = data; }); }
    if (connection === 'open') { entry.connected = true; entry.qr = null; entry.qrDataUrl = null; logger.info({ id }, 'WhatsApp session connected'); }
    if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut && !entry.reconnecting) {
      entry.reconnecting = true;
      setTimeout(() => connectSession(id).catch((e) => logger.error(e)), 1500);
    }
  });
  socket.ev.on('messaging-history.set', ({ chats = [], messages = [] }) => {
    for (const chat of chats) { const c = ensureChat(id, chat.id, chat.name || chat.id); c.unreadCount = chat.unreadCount || 0; }
    for (const message of messages) cacheMessage(id, message);
  });
  socket.ev.on('chats.upsert', (chats) => chats.forEach((chat) => ensureChat(id, chat.id, chat.name || chat.id)));
  socket.ev.on('messages.upsert', ({ messages }) => messages.forEach((message) => cacheMessage(id, message)));
  return { id };
}

function cacheMessage(id, message) {
  const jid = message.key?.remoteJid; if (!jid) return;
  const chat = ensureChat(id, jid, jid); const value = { id: message.key.id, jid, fromMe: !!message.key.fromMe, sender: message.key.participant || jid, text: textOf(message.message), timestamp: Number(message.messageTimestamp || Date.now()) };
  if (!messageCache.has(id)) messageCache.set(id, new Map()); const byChat = messageCache.get(id); if (!byChat.has(jid)) byChat.set(jid, []); const list = byChat.get(jid); if (!list.some((m) => m.id === value.id)) list.push(value); chat.lastMessage = value.text; chat.lastMessageTime = value.timestamp; if (!value.fromMe) chat.unreadCount += 1;
}

export function status(id) { const s = sessions.get(id); return s ? { connected: s.connected, qr: s.qrDataUrl || null } : { connected: false, qr: null }; }
export function chats(id) { return [...(chatCache.get(id)?.values() || [])].sort((a, b) => b.lastMessageTime - a.lastMessageTime); }
export function messages(id, jid) { return messageCache.get(id)?.get(jid) || []; }
export async function sendText(id, jid, text) { const s = sessions.get(id); if (!s?.connected) throw new Error('WhatsApp session is not connected'); await s.socket.sendMessage(jid, { text }); }
export async function readMessages(id, jid, ids) { const s = sessions.get(id); if (!s?.connected) throw new Error('WhatsApp session is not connected'); await s.socket.readMessages(ids.map((messageId) => ({ remoteJid: jid, id: messageId }))); }
export async function react(id, jid, messageId, emoji) { const s = sessions.get(id); if (!s?.connected) throw new Error('WhatsApp session is not connected'); await s.socket.sendMessage(jid, { react: { text: emoji, key: { remoteJid: jid, id: messageId, fromMe: false } } }); }
export async function typing(id, jid, enabled) { const s = sessions.get(id); if (!s?.connected) throw new Error('WhatsApp session is not connected'); await s.socket.sendPresenceUpdate(enabled ? 'composing' : 'paused', jid); }
export async function disconnect(id) { const s = sessions.get(id); if (s) { s.socket.end(undefined); sessions.delete(id); } }
