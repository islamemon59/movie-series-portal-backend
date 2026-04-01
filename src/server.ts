import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`🚀 MovieHub API running on http://localhost:${env.PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log("\n🛑 Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
