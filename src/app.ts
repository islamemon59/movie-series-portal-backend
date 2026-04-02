import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middleware/error-handler.js";
import { mediaRoutes } from "./modules/media/media.routes.js";
import { reviewRoutes } from "./modules/review/review.routes.js";
import { commentRoutes } from "./modules/comment/comment.routes.js";
import { watchlistRoutes } from "./modules/watchlist/watchlist.routes.js";
import { paymentRoutes } from "./modules/payment/payment.routes.js";
import { paymentController } from "./modules/payment/payment.controller.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";
import type { AuthenticatedRequest } from "./types/index.js";

const app = express();

// ─── Security & CORS ─────────────────────────────────────────
const allowedOrigins = env.FRONTEND_URL.split(",").map((u) => u.trim());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─── Stripe Webhook (needs raw body) ─────────────────────────
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.webhook as any,
);

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Better Auth Handler ──────────────────────────────────────
app.all("/api/auth/*", toNodeHandler(auth));

// ─── API Routes ───────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "MovieHub API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/media", mediaRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// ─── Error Handling ───────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

export { app };
