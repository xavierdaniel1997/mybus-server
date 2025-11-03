import mongoose, { Schema } from "mongoose";
import { IBusSchedule } from "../types/schedule";

const BusScheduleSchema = new Schema<IBusSchedule>(
  {
    bus: { type: Schema.Types.ObjectId, ref: "Bus", required: true },
    route: { type: Schema.Types.ObjectId, ref: "BusRoute", required: true },
    frequency: {
      type: String,
      enum: ["daily", "weekdays", "custom"],
      default: "daily",
    },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    basePrice: { type: Number, required: true },
    customInterval: {type: Number},
    startDate: { type: Date },
    endDate: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const BusScheduleModel = mongoose.model<IBusSchedule>("BusSchedule", BusScheduleSchema);
export default BusScheduleModel;