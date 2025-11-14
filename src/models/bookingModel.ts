import mongoose, { Schema } from "mongoose";
import { IBooking } from "../types/booking";

const PassengerSchema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["M", "F", "O"], required: true },
  seatId: { type: String, required: true }
});

const PaymentSchema = new Schema({
  gateway: { type: String, default: "razorpay" },
  gatewayOrderId: String,
  gatewayPaymentId: String,
  status: {
    type: String,
    enum: ["initiated", "authorized", "captured", "failed", "refunded"],
    default: "initiated"
  },
  raw: Schema.Types.Mixed
});

const BookingSchema = new Schema<IBooking>(
  {
    trip: { type: Schema.Types.ObjectId, ref: "BusTrip", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    seatIds: [{ type: String, required: true }],

    passengers: { type: [PassengerSchema], default: [] },

    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "expired"],
      default: "pending"
    },

    reservationExpiresAt: { type: Date, required: true },

    payment: { type: PaymentSchema, required: true }
  },
  { timestamps: true }
);



const BookingModel = mongoose.model<IBooking>("booking", BookingSchema);
export default BookingModel;