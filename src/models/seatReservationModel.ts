
import mongoose, { Schema } from "mongoose";
import { ISeatReservation } from "../types/seatReservation";

const SeatReservationSchema = new Schema<ISeatReservation>({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "BusTrip", required: true },
  seatId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } 
  }
});
const SeatReservationModal = mongoose.model("SeatReservation", SeatReservationSchema);
export default SeatReservationModal;
