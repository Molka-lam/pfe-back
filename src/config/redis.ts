import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const isRedisRequired = process.env.REDIS_REQUIRED === "true";
export const redis = createClient({ url: redisUrl });

redis.on("error", (err) => console.error("Redis Client Error", err));
redis.on("connect", () => console.log("Redis connected successfully"));

export const connectRedis = async () => {
  if (!redis.isOpen) {
    try {
      await redis.connect();
    } catch (error) {
      if (isRedisRequired) {
        throw error;
      }

      console.warn("Redis unavailable, continuing without cache");
    }
  }
};
