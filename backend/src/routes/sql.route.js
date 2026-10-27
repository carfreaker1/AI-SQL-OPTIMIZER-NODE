import { analyzeSQL } from "../services/ai.service.js";
import { getCache, setCache } from "../services/cache.service.js";
import crypto from "crypto";

export default async function (fastify) {
  fastify.post("/optimize", async (req, reply) => {
    try {
      const { query, target = "sql" } = req.body;

      if (!query) {
        return reply.code(400).send({ error: "Query is required" });
      }

      // 🔥 FIX: include target in cache key
      const key = crypto
        .createHash("md5")
        .update(query + target)
        .digest("hex");

      // ✅ Check cache
      const cached = await getCache(key);
      if (cached) {
        return {
          source: "cache",
          ...cached,
        };
      }

      // ✅ AI call
      const result = await analyzeSQL(query, target);

      // ❌ Don't cache errors
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
      });
    }
  });
}