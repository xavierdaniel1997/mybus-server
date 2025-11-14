import Razorpay from "razorpay";
import BookingModel from "../models/bookingModel";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY!,
  key_secret: process.env.RAZORPAY_SECRET!
});

type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  [key: string]: any;
};

export const createRazorpayOrder = async ({
  bookingId,
  amount
}: {
  bookingId: string;
  amount: number;
}): Promise<RazorpayOrderResponse> => {
  const order = (await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: bookingId,
    payment_capture: true
  })) as unknown as RazorpayOrderResponse;

  if (!order?.id) {
    throw new Error("Failed to create Razorpay order");
  }

  // Attach order details to booking
  await BookingModel.findByIdAndUpdate(
    bookingId,
    {
      $set: {
        "payment.gatewayOrderId": order.id,
        "payment.status": "initiated",
        "payment.raw": order
      }
    },
    { new: true }
  );

  return order;
};
