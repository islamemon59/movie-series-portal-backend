import { stripe } from "../../lib/stripe.js";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { sendEmail, subscriptionConfirmationEmail } from "../../lib/email.js";
import { AppError } from "../../types/index.js";
import type Stripe from "stripe";

export const paymentService = {
  async createCheckoutSession(userId: string, plan: "MONTHLY" | "YEARLY") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found");

    // Check if user already has an active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });
    if (activeSubscription)
      throw new AppError(400, "You already have an active subscription");

    const priceId =
      plan === "MONTHLY"
        ? env.STRIPE_MONTHLY_PRICE_ID
        : env.STRIPE_YEARLY_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      success_url: `${env.FRONTEND_URL}/pricing?success=true`,
      cancel_url: `${env.FRONTEND_URL}/pricing?cancelled=true`,
      metadata: { userId, plan },
    });

    return { url: session.url };
  },

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as "MONTHLY" | "YEARLY";

        if (!userId || !plan) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        await prisma.subscription.create({
          data: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            plan,
            status: "ACTIVE",
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000,
            ),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        // Send confirmation email
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          try {
            await sendEmail({
              to: user.email,
              subject: "Subscription Confirmed - MovieHub",
              html: subscriptionConfirmationEmail(user.name, plan),
            });
          } catch {
            console.error("Failed to send subscription confirmation email");
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status === "active" ? "ACTIVE" : "CANCELLED",
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000,
            ),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: "EXPIRED" },
        });
        break;
      }
    }
  },

  async getUserSubscription(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    return subscription;
  },

  async cancelSubscription(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });
    if (!subscription) throw new AppError(404, "No active subscription found");
    if (!subscription.stripeSubscriptionId)
      throw new AppError(400, "Invalid subscription");

    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    return prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "CANCELLED" },
    });
  },
};
