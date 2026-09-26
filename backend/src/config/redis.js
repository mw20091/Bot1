import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

let redisClient;

export async function initializeRedis() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = createClient({ url: redisUrl });
  redisClient.on('error', (err) => logger.error('Redis error', err));
  await redisClient.connect();
  logger.info('Redis connected');
}

export function getRedis() { return redisClient; }
export async function cacheSet(key, data, ttl = 3600) { if (redisClient) await redisClient.setEx(key, ttl, JSON.stringify(data)); }
export async function cacheGet(key) { if (!redisClient) return null; const value = await redisClient.get(key); return value ? JSON.parse(value) : null; }
export async function cacheDel(key) { if (redisClient) await redisClient.del(key); }
