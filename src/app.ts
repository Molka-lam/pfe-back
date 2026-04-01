import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./modules/auth/auth.router";
import licenseRoutes from "./modules/licenses/licenses.router";
import tenantRoutes from "./modules/tenants/tenants.router";
import userRoutes from "./modules/users/users.router";
import usageRoutes from "./modules/usage/usage.router";

const app = express();

const normalizeOrigin = (value: string): string => value.trim().replace(/\/$/, "");

const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URLS,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
]
  .filter(Boolean)
  .flatMap((entry) => (entry as string).split(","))
  .map(normalizeOrigin);

const allowedOrigins = new Set(configuredOrigins);

const isDevLocalOrigin = (origin: string): boolean => {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  try {
    const parsed = new URL(origin);
    return (
      parsed.protocol === "http:" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
};

// Middlewares
app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);
      if (allowedOrigins.has(normalizedOrigin) || isDevLocalOrigin(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
  })
);
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/licenses", licenseRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/usage", usageRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Error Handler
app.use(errorHandler);

export default app;
