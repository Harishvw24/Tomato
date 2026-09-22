import { createClient } from "redis";

const redisClient = createClient(
  process.env.REDIS_URL ? { url: process.env.REDIS_URL } : undefined
);

redisClient.on("error", (error) => {
  console.error("Redis error:", error);
});

export const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL is not set. Continuing without cache.");
    return false;
  }

  if (redisClient.isOpen) {
    return true;
  }

  try {
    await redisClient.connect();
    console.log("Redis is connected");
    return true;
  } catch (error) {
    console.warn("Redis is unavailable. Continuing without cache.");
    return false;
  }
};

export const disconnectRedis = async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
};

export default redisClient;