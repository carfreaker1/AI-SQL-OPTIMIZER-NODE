import "dotenv/config";

import Fastify from "fastify";
import cors from "@fastify/cors";
import sqlRoutes from "./routes/sql.route.js";

const app = Fastify({
  logger: true,
});

// CORS configuration
await app.register(cors, {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://ai-sql-optimizer-node-1.onrender.com",
    "https://ai-sql-optimizer-node.onrender.com",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Register routes
await app.register(sqlRoutes, {
  prefix: "/api/sql",
});

// Health check
app.get("/", async () => {
  return {
    message: "AI SQL Optimizer Running",
    status: "success",
  };
});

// Start server
const PORT = Number(process.env.PORT || 5000);

try {
  await app.listen({
    port: PORT,
    host: "0.0.0.0",
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
