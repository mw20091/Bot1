import redis from 'redis';
import { logger } from '../utils/logger.js';

let redisClient;

export async function initializeRedis() {
  const redisUrl = process.env.REDIS_URL || (
    `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
  );

  redisClient = redis.createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
  });

  redisClient.on('error', (err) => logger.error('Redis error:', err));
  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('reconnecting', () => logger.info('Redis reconnecting...'));

  try {
    await redisClient.connect();
    logger.info('Redis connection successful');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
}

export function getRedis() {
  return redisClient;
}

export async function cacheSet(key, value, ttl = 3600) {
  try {
    if (ttl) {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } else {
      await redisClient.set(key, JSON.stringify(value));
    }
  } catch (error) {
    logger.error('Cache set error:', error);
  }
}

export async function cacheGet(key) {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

export async function cacheDel(key) {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
}

export async function cacheExists(key) {
  try {
    return await redisClient.exists(key);
  } catch (error) {
    logger.error('Cache exists error:', error);
    return false;
  }
}
