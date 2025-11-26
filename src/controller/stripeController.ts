// server/controllers/stripeController.ts
import { Request, Response } from "express";
import Stripe from "stripe";
import BookingModel from "../models/bookingModel";
import SeatReservationModal from "../models/seatReservationModel";
import mongoose from "mongoose";
import BusTripModel from "../models/bustripModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    // IMPORTANT: req.body must be the raw body (string or buffer)
    const body = (req as any).rawBody || req.body; // ensure middleware sets rawBody
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event types you care about
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      const tripId = session.metadata?.tripId;
      const seatIds = session.metadata?.seatIds ? session.metadata.seatIds.split(",") : [];

      // Mark booking & seats in DB in a transaction
      const sessionDB = await mongoose.startSession();
      sessionDB.startTransaction();
      try {
        await BookingModel.findByIdAndUpdate(bookingId, {
          $set: {
            "payment.status": "captured",
            "payment.gatewayPaymentId": session.payment_intent,
            "payment.raw": session,
            status: "confirmed",
          },
        }).session(sessionDB);

        await BusTripModel.updateOne(
          { _id: tripId },
          { $set: { "seatPricing.$[elem].isBooked": true } },
          { arrayFilters: [{ "elem.seatId": { $in: seatIds } }], session: sessionDB }
        );

        await SeatReservationModal.deleteMany({ tripId, seatId: { $in: seatIds } }).session(sessionDB);

        await sessionDB.commitTransaction();
      } catch (e) {
        await sessionDB.abortTransaction();
        console.error("Error updating booking after stripe webhook:", e);
        throw e;
      } finally {
        sessionDB.endSession();
      }
    }

    // Also handle payment_intent.succeeded optionally
    if (event.type === "payment_intent.succeeded") {
      // handle if you want to reconcile payments directly
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handling error:", err);
    res.status(500).send();
  }
};
