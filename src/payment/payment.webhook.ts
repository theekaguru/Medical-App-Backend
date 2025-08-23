import { Request, Response } from "express";
import Stripe from "stripe";
import db from "../drizzle/db";
import { payments } from "../drizzle/schema";

// Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export const webhookHandler = async (req: Request, res: Response) => {

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const appointmentId = session.metadata?.appointmentId;
    const transactionId = session.payment_intent as string;
    const amount = session.amount_total;

    if (!appointmentId || !transactionId || !amount) {
      console.error("❌ Missing required metadata in Stripe session");
      res.status(400).json({ error: "Missing required metadata" });
      return
    }

    // ✅ Convert Stripe status to valid enum value
    let paymentStatus: "pending" | "completed" | "failed" = "pending";

    const stripeStatus = session.payment_status as string;

    if (stripeStatus === "paid") {
      paymentStatus = "completed";
    } else if (stripeStatus === "unpaid" || stripeStatus === "failed") {
      paymentStatus = "failed";
    }

    try {
      await db.insert(payments).values({
        appointmentId: parseInt(appointmentId),
        amount: (amount / 100).toFixed(2),
        paymentStatus,
        transactionId,
      });

      console.log(`✅ Payment recorded for appointment ${appointmentId}`);
    } catch (err) {
      console.error("❌ Failed to save payment in DB", err);
      res.status(500).json({ error: "Database insert failed" });
      return
    }
  }

  res.status(200).json({ received: true });
  return
};
