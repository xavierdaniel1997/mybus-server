
import { Types } from "mongoose";

export interface ISeatReservation {
  _id?: Types.ObjectId;
  tripId: Types.ObjectId;
  seatId: string;
  userId: Types.ObjectId;
  expiresAt: Date;
}
