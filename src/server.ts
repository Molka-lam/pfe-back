import "dotenv/config";
import app from "./app";
import { prisma } from "./config/database";
import { connectRedis } from "./config/redis";

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // 1. Database connection check
    await prisma.$connect();
    console.log("🚀 Database connected successfully");

    // 2. Redis connection check
    await connectRedis();

    // 3. Start Express server
    const server = app.listen(PORT, () => {
      console.log(`📡 Server running at http://localhost:${PORT}`);
      console.log(`✅ POST endpoint:  http://localhost:${PORT}/api/licenses`);
      console.log(`✅ VALIDATE endpoint: http://localhost:${PORT}/api/licenses/validate`);
    });

    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use. Please try:
          1. Killing the process on port ${PORT}
          2. Changing the PORT in your .env file
          3. Or running 'npm run dev' on a different port.`);
        process.exit(1);
      } else {
        console.error("❌ Unexpected server error:", error);
      }
    });

  } catch (error) {
    console.error("❌ Critical failure during startup:", error);
    process.exit(1);
  }
}

startServer();
