import pkg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pkg;
let pool;

export async function initializeDatabase() {
  const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

  pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  try {
    const client = await pool.connect();
    client.release();
    logger.info('Database connected');
  } catch (error) {
    logger.error('Database connection failed', error);
    throw error;
  }

  await createTables();
}

async function createTables() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_name VARCHAR(255) NOT NULL,
      whatsapp_jid VARCHAR(255),
      status VARCHAR(50) DEFAULT 'disconnected',
      device_info JSONB,
      auth_credentials JSONB,
      is_active BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS chats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      chat_jid VARCHAR(255) NOT NULL,
      chat_name VARCHAR(255),
      chat_type VARCHAR(20),
      last_message TEXT,
      last_message_timestamp BIGINT,
      unread_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(session_id, chat_jid)
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
      session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      sender_jid VARCHAR(255),
      receiver_jid VARCHAR(255),
      message_text TEXT,
      message_type VARCHAR(50),
      media_url TEXT,
      timestamp BIGINT,
      is_from_me BOOLEAN DEFAULT false,
      read_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS bot_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
      auto_read BOOLEAN DEFAULT true,
      auto_reactions BOOLEAN DEFAULT true,
      auto_status_like BOOLEAN DEFAULT true,
      auto_typing BOOLEAN DEFAULT true,
      reaction_emojis VARCHAR(255) DEFAULT '👍😂❤️😮😢',
      typing_delay_ms INTEGER DEFAULT 1000,
      auto_reply_enabled BOOLEAN DEFAULT false,
      auto_reply_template TEXT,
      excluded_chats JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS auto_reply_rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      trigger_keyword VARCHAR(255) NOT NULL,
      reply_message TEXT NOT NULL,
      is_regex BOOLEAN DEFAULT false,
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      action VARCHAR(255) NOT NULL,
      action_type VARCHAR(50),
      details JSONB,
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const query of queries) {
    await pool.query(query);
  }

  logger.info('Database tables initialized');
}

export function getPool() {
  return pool;
}

export async function query(text, params) {
  return pool.query(text, params);
}
