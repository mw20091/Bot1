import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

let redisClient;

export async function initializeRedis() {
  const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

  redisClient = createClient({
    url: redisUrl,
  });

  redisClient.on('error', (err) => logger.error('Redis error', err));
  redisClient.on('connect', () => logger.info('Redis connected'));

  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection failed', error);
    throw error;
  }
}

export function getRedis() {
  return redisClient;
}

export async function cacheSet(key, data, ttl = 3600) {
  if (!redisClient) return null;
  await redisClient.set(key, JSON.stringify(data), { EX: ttl });
}

export async function cacheGet(key) {
  if (!redisClient) return null;
  const value = await redisClient.get(key);
  return value ? JSON.parse(value) : null;
}
