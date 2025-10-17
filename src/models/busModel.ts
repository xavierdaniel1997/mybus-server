import mongoose, { Schema, Document } from "mongoose";

export interface IBus extends Document {
  busName: string;
  registrationNumber: string;
  busType: string;
  seatLayout: mongoose.Types.ObjectId;
  amenities: string[];
  features: {
    wifi: boolean;
    chargingPort: boolean;
    blanket: boolean;
    waterBottle: boolean;
    readingLight: boolean;
    cctv: boolean;
    gps: boolean;
  };
  totalSeats: number;
  baseFare: number;
  status: "Active" | "Inactive" | "Maintenance";
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BusSchema = new Schema<IBus>(
  {
    busName: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    busType: {
      type: String,
      enum: ["seater", "sleeper", "seater+sleeper"],
      required: true,
    },
    seatLayout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seatLayout",
      required: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    features: {
      wifi: { type: Boolean, default: false },
      chargingPort: { type: Boolean, default: false },
      blanket: { type: Boolean, default: false },
      waterBottle: { type: Boolean, default: false },
      readingLight: { type: Boolean, default: false },
      cctv: { type: Boolean, default: false },
      gps: { type: Boolean, default: true },
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    baseFare: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Maintenance"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const BusModel = mongoose.model<IBus>("Bus", BusSchema);
export default BusModel;
