import mongoose, { Schema } from "mongoose";
import { IBusTrip, ISeatPricing } from "../types/bustrip";

const SeatPricingSchema = new Schema<ISeatPricing>({
  seatId: { type: String, required: true },
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  reservedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  reservedUntil: { type: Date, default: null },
});

const BusTripSchema = new Schema<IBusTrip>(
  {
    bus: { type: Schema.Types.ObjectId, ref: "Bus", required: true },
    route: { type: Schema.Types.ObjectId, ref: "BusRoute", required: true },
    schedule: { type: Schema.Types.ObjectId, ref: "BusSchedule" },
    travelDate: { type: Date, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    basePrice: { type: Number, required: true },
    seatPricing: [SeatPricingSchema],
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
    },
    verifiedTrip: {type: Boolean, default: false}
  },
  { timestamps: true }
);

const BusTripModel = mongoose.model<IBusTrip>("BusTrip", BusTripSchema);
export default BusTripModel;