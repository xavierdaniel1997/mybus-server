import mongoose, {Schema} from "mongoose";
import { IBus, IBusSeat } from "../types/bus";

const seatSchema = new Schema<IBusSeat>({
  id: { type: String, required: true },
  type: { type: String, enum: ["seater", "sleeper", "Aisle"], required: true },
  seatNumber: { type: String, required: true },
  price: { type: Number, default: 0 },
  priority: { type: String, enum: ["general", "ladies", "reserved"], default: "general" },
  isAvailable: { type: Boolean, default: true },
});

const busSchema = new Schema<IBus>({
  name: { type: String, required: true },
  registrationNo: { type: String, required: true },
  brand: { type: String, required: true },
  busType: { type: String, enum: ["seater", "sleeper", "seater+sleeper"], required: true },
  layoutName: { type: String, required: true },
  information: { type: String },
  features: { type: Object, required: true },
  images: [{ type: String }],
  leftCols: { type: Number, required: true },
  leftRows: { type: Number, required: true },
  rightCols: { type: Number, required: true },
  rightRows: { type: Number, required: true },
  extraRows: { type: Number, default: 0 },
  lowerDeck: {
    seats: [[seatSchema]],
  },
  upperDeck: {
    seats: [[seatSchema]],
  },
  createdAt: { type: Date, default: Date.now },
});

const BusModel = mongoose.model<IBus>("Bus", busSchema);
export default BusModel;