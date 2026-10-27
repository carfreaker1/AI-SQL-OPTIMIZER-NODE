import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export const getCache = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

export const setCache = async (key, value) => {
  await redis.set(key, JSON.stringify(value), "EX", 3600);
};