import "dotenv/config";

import Fastify from "fastify";
import cors from "@fastify/cors";
import sqlRoutes from "./routes/sql.route.js";

const app = Fastify({ logger: true });

// CORS
await app.register(cors, {
  origin: [
    "http://localhost:5173",
    "https://ai-sql-optimizer-node-1.onrender.com/",
  ],
});

// SQL Optimizer routes
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

// Dynamic port for Vercel
const PORT = Number(process.env.PORT || 5000);

await app.listen({
  port: PORT,
  host: "0.0.0.0",
});
