// routes/webhook.ts
import express from "express";
import crypto from "crypto";
import BookingModel from "../models/bookingModel";
import BusTripModel from "../models/bustripModel";
import SeatReservationModal from "../models/seatReservationModel";
import mongoose from "mongoose";

const router = express.Router();

router.post("/razorpay", express.raw({ type: "*/*" }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!; // set this in Razorpay webhook config
  const signature = req.header("x-razorpay-signature") || "";

  const generated = crypto.createHmac("sha256", secret).update(req.body).digest("hex");
  if (generated !== signature) {
    return res.status(400).send("Invalid webhook signature");
  }

  const payload = JSON.parse(req.body.toString());
  const event = payload.event;

  try {
    if (event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      // payment.order_id and payment.notes or payment.receipt (receipt set to bookingId in create order)
      const bookingId = payment.receipt || payment.notes?.bookingId;
      // proceed same as verify: open transaction and mark seats+booking

      // implement same logic as verify endpoint, but ensure idempotency
      // ...
    }
    // handle payment.failed -> mark booking failed/expired etc.
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook processing error", err);
    res.status(500).send("error");
  }
});

export default router;
