import { analyzeSQL } from "../services/ai.service.js";
import { getCache, setCache } from "../services/cache.service.js";
import crypto from "crypto";

export default async function (fastify) {
  fastify.post("/optimize", async (req, reply) => {
    try {
      const { query, target = "sql", dialect = "Generic SQL" } = req.body || {};

      if (!query || typeof query !== "string" || !query.trim()) {
        return reply.code(400).send({ error: "Query is required" });
      }

      // Hash query + target + dialect for unique caching
      const key = crypto
        .createHash("md5")
        .update(query.trim() + "::" + target + "::" + dialect)
        .digest("hex");

      // Check cache first
      const cached = await getCache(key);
      if (cached) {
        return {
          source: "cache",
          ...cached,
        };
      }

      // AI Call via Gemini 2.5 Flash Lite
      const result = await analyzeSQL(query.trim(), target, dialect);

      // Do not cache failures/errors
      if (!result.error) {
        await setCache(key, result);
      }

      return {
        source: "ai",
        ...result,
      };
    } catch (err) {
      console.error("Route Error:", err.message);

      return reply.code(500).send({
        error: "Internal Server Error",
        details: err.message,
      });
    }
  });

  // Health and status endpoint
  fastify.get("/status", async () => {
    return {
      status: "online",
      model: "gemini-2.5-flash",
      timestamp: new Date().toISOString(),
    };
  });
}