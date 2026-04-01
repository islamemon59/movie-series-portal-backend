import type { Request, Response, NextFunction } from "express";
import { paymentService } from "./payment.service.js";
import type { AuthenticatedRequest } from "../../types/index.js";
import { stripe } from "../../lib/stripe.js";
import { env } from "../../config/env.js";

export const paymentController = {
  async createCheckout(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { plan } = req.body;
      if (!plan || !["MONTHLY", "YEARLY"].includes(plan)) {
        res
          .status(400)
          .json({
            success: false,
            message: "Invalid plan. Choose MONTHLY or YEARLY.",
          });
        return;
      }
      const result = await paymentService.createCheckoutSession(
        req.user.id,
        plan,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const sig = req.headers["stripe-signature"] as string;
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.STRIPE_WEBHOOK_SECRET,
      );
      await paymentService.handleWebhook(event);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  },

  async getSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const subscription = await paymentService.getUserSubscription(
        req.user.id,
      );
      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  },

  async cancelSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const subscription = await paymentService.cancelSubscription(req.user.id);
      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  },
};
