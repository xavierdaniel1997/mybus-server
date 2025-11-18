import Razorpay from "razorpay";
import BookingModel from "../models/bookingModel";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY!,
  key_secret: process.env.RAZORPAY_SECRET!,
});

export const createRazorpayOrder = async ({
  bookingId,
  amount,
}: {
  bookingId: string;
  amount: number;
}) => {
  const options = {
    amount: Math.round(amount), 
    currency: "INR",
    receipt: bookingId,
  };

  const order = await razorpay.orders.create(options);

  if (!order?.id) {
    throw new Error("Failed to create Razorpay order");
  }

  await BookingModel.findByIdAndUpdate(bookingId, {
    $set: {
      "payment.gatewayOrderId": order.id,
      "payment.status": "initiated",
      "payment.raw": order,
    },
  });

  return order;
};
