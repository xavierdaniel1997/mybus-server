import mongoose, { Schema } from "mongoose";
import { ISeatLayout } from "../types/seatLayout";

const seatLayoutSchema = new Schema<ISeatLayout>({
  name: {
    type: String,
    required: true,
    unique: true, 
  },
  busType: {
    type: String,
    enum: ['seater', 'sleeper', 'seater+sleeper'],
    required: true,
  },
  leftCols: {
    type: Number,
    required: true,
    min: 1,
  },
  leftRows: {
    type: Number,
    required: true,
    min: 1,
  },
  rightCols: {
    type: Number,
    required: true,
    min: 1,
  },
  rightRows: {
    type: Number,
    required: true,
    min: 1,
  },
  extraRows: {
    type: Number,
    default: 0,
    min: 0,
  },
  lowerDeck: [
    [
      {
        id: { type: String, required: true },
        type: { type: String, enum: ['seater', 'sleeper', 'Aisle'], required: true },
        seatNumber: { type: String, required: true }
      },
    ],
  ], 
  upperDeck: [
    [
      {
        id: { type: String, required: true },
        type: { type: String, enum: ['seater', 'sleeper', 'Aisle'], required: true },
        seatNumber: { type: String, required: true }
      },
    ],
  ], 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SeatLayoutModel = mongoose.model<ISeatLayout>("seatLayout",  seatLayoutSchema)
export default SeatLayoutModel