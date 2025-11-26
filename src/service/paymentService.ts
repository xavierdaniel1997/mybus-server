import Razorpay from "razorpay";
import BookingModel from "../models/bookingModel";



export const createRazorpayOrder = async ({
  bookingId,
  amount,
}: {
  bookingId: string;
  amount: number; 
}) => {
  if (!amount || amount <= 0) throw new Error("Invalid Razorpay amount");

  const options = {
    amount,        
    currency: "INR",
    receipt: bookingId,
  };

  const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY as string,
  key_secret: process.env.RAZORPAY_SECRET as string,
});

  console.log("process.env.RAZORPAY_KEY", process.env.RAZORPAY_KEY)

  console.log("Creating Razorpay Order with:", options);
  
  try {
    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order);

    await BookingModel.findByIdAndUpdate(bookingId, {
      $set: {
        "payment.gatewayOrderId": order.id,
        "payment.status": "initiated",
        "payment.raw": order,
      },
    });

    return order;
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    throw err;
  }
};
