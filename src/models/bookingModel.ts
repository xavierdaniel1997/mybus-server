import mongoose, { Schema } from "mongoose";
import { IBooking } from "../types/booking";

const BookingSchema = new Schema<IBooking>({
  trip: { type: Schema.Types.ObjectId, ref: "BusTrip", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  seatIds: [String],
  totalAmount: Number,
  payment: {
    gateway: String,
    paymentIntentId: String,
    status: String,
    raw: Schema.Types.Mixed,
  },
  status: { type: String, enum: ["confirmed","cancelled","refunded"], default: "confirmed" },
}, { timestamps: true });


const BookingModel = mongoose.model<IBooking>("booking", BookingSchema);
export default BookingModel;