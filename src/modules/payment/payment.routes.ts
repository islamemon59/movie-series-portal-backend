import { Router } from "express";
import { paymentController } from "./payment.controller.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

router.post(
  "/create-checkout",
  requireAuth,
  paymentController.createCheckout as any,
);
router.get(
  "/subscription",
  requireAuth,
  paymentController.getSubscription as any,
);
router.post(
  "/cancel",
  requireAuth,
  paymentController.cancelSubscription as any,
);

// Webhook is mounted separately in app.ts with raw body parser

export { router as paymentRoutes };
