import { Types } from "mongoose";

export interface IBooking {
  _id?: Types.ObjectId;
  trip: Types.ObjectId; 
  user: Types.ObjectId; 
  seatIds: string[];
  totalAmount: number;
  payment: {
    gateway: string;
    paymentIntentId?: string;
    status: string;
    raw?: any;
  };
  status: "confirmed" | "cancelled" | "refunded";
  createdAt?: Date;
  updatedAt?: Date;
}
