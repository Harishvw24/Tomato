import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env")
});

// Load environment variables before importing modules that create external clients.
const { default: app } = await import("./app.js");
const { connectDB, disconnectDB } = await import("./config/db.js");
const { connectRedis, disconnectRedis } = await import("./config/redis.js");

const port = process.env.PORT || 4000;
const host = process.env.HOST || "0.0.0.0";

await connectDB();
await connectRedis();

const server = app.listen(port, host, () => {
  console.log(`Server started on ${host}:${port}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down.`);
  server.close(async () => {
    await disconnectRedis();
    await disconnectDB();
    process.exit(0);
  });
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
