// routes/webhook.ts
import express from "express";
import crypto from "crypto";
import BookingModel from "../models/bookingModel";

const router = express.Router();

router.post("/razorpay", async (req, res) => {
  const sig = req.headers["x-razorpay-signature"] as string | undefined;
  const secret = process.env.RAZORPAY_SECRET!;
  const rawBody = (req as any).rawBody;

  if (!sig || !rawBody) {
    return res.status(400).send("Missing signature/body");
  }

  const generated = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (generated !== sig) {
    return res.status(400).send("Invalid signature");
  }

  let event: any;
  try {
    const raw = Buffer.isBuffer(rawBody) ? rawBody.toString() : rawBody;
    event = JSON.parse(raw);
  } catch (err) {
    console.error("Cannot parse webhook JSON", err);
    return res.status(400).send("Bad JSON");
  }

  try {
    const paymentEntity = event.payload?.payment?.entity || null;
    const orderEntity = event.payload?.order?.entity || null;

    const razorpayPaymentId = paymentEntity?.id || null;
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id || null;

    if (!razorpayOrderId) {
      console.warn("Webhook missing order id");
      return res.status(200).send("ignored");
    }

    const booking = await BookingModel.findOne({
      "payment.gatewayOrderId": razorpayOrderId
    });

    if (!booking) {
      console.warn("Booking not found for order:", razorpayOrderId);
      return res.status(200).send("no booking");
    }

    // idempotency
    if (booking.status === "confirmed") {
      return res.status(200).send("already processed");
    }

    booking.status = "confirmed";
    (booking.payment as any).status = "captured";
    booking.payment.gatewayPaymentId = razorpayPaymentId;
    booking.payment.raw = event;

    await booking.save();

    return res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    return res.status(500).send("error");
  }
});

export default router;
