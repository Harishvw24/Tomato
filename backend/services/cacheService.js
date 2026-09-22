import redisClient from "../config/redis.js";

export const getCache = async (key) => {
  try {
    if (!redisClient.isOpen) {
      return null;
    }

    const value = await redisClient.get(key);

    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Redis read failed for ${key}:`, error);
    return null;
  }
};

export const setCache = async (key, value, ttlSeconds = 300) => {
  try {
    if (!redisClient.isOpen) {
      return;
    }

    await redisClient.set(key, JSON.stringify(value), {
      EX: ttlSeconds
    });
  } catch (error) {
    console.error(`Redis write failed for ${key}:`, error);
  }
};

export const deleteCache = async (key) => {
  try {
    if (!redisClient.isOpen) {
      return;
    }

    await redisClient.del(key);
  } catch (error) {
    console.error(`Redis delete failed for ${key}:`, error);
  }
};

export const deleteCachePattern = async (pattern) => {
  try {
    if (!redisClient.isOpen) {
      return;
    }

    for await (const scannedKeys of redisClient.scanIterator({ MATCH: pattern })) {
      const keys = (Array.isArray(scannedKeys) ? scannedKeys.flat(Infinity) : [scannedKeys])
        .filter((key) => typeof key === "string" && key.length > 0);

      for (const key of keys) {
        await redisClient.del(key);
      }
    }
  } catch (error) {
    console.error(`Redis pattern delete failed for ${pattern}:`, error);
  }
};