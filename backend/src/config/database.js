import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;
let pool;

export async function initializeDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  pool = new Pool({ connectionString });

  try {
    const client = await pool.connect();
    client.release();
    logger.info('PostgreSQL connected');
  } catch (error) {
    logger.error('PostgreSQL connection failed', error);
    throw error;
  }

  await createTables();
}

async function createTables() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_name VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'disconnected',
      whatsapp_jid VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_id, session_name)
    )`,
    `CREATE TABLE IF NOT EXISTS chats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      chat_jid VARCHAR(255) NOT NULL,
      chat_name VARCHAR(255),
      unread_count INTEGER DEFAULT 0,
      last_message TEXT,
      last_message_time BIGINT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (session_id, chat_jid)
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      chat_jid VARCHAR(255) NOT NULL,
      from_me BOOLEAN DEFAULT false,
      sender_jid VARCHAR(255),
      text TEXT,
      timestamp BIGINT,
      created_at TIMESTAMP DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS bot_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
      auto_read BOOLEAN DEFAULT true,
      auto_reactions BOOLEAN DEFAULT false,
      auto_typing BOOLEAN DEFAULT true,
      reaction_emojis VARCHAR(255) DEFAULT '👍,😂,❤️,😮',
      typing_delay_ms INTEGER DEFAULT 1000,
      created_at TIMESTAMP DEFAULT NOW()
    )`
  ];

  for (const sql of queries) {
    await pool.query(sql);
  }

  logger.info('Database tables initialized');
}

export function getPool() {
  return pool;
}

export async function query(sql, params = []) {
  return pool.query(sql, params);
}
