"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redis = void 0;
const redis_1 = require("redis");
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const isRedisRequired = process.env.REDIS_REQUIRED === "true";
exports.redis = (0, redis_1.createClient)({ url: redisUrl });
exports.redis.on("error", (err) => console.error("Redis Client Error", err));
exports.redis.on("connect", () => console.log("Redis connected successfully"));
const connectRedis = async () => {
    if (!exports.redis.isOpen) {
        try {
            await exports.redis.connect();
        }
        catch (error) {
            if (isRedisRequired) {
                throw error;
            }
            console.warn("Redis unavailable, continuing without cache");
        }
    }
};
exports.connectRedis = connectRedis;
//# sourceMappingURL=redis.js.map