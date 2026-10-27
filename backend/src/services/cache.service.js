// In-memory cache implementation (runs without Redis)
const memoryCache = new Map();

console.log("⚡ Using In-Memory Cache (Redis disabled)");

export const getCache = async (key) => {
  const item = memoryCache.get(key);
  if (!item) return null;

  // Check TTL expiration
  if (item.expiry && Date.now() > item.expiry) {
    memoryCache.delete(key);
    return null;
  }

  return item.value;
};

export const setCache = async (key, value, ttlSeconds = 3600) => {
  memoryCache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });
};