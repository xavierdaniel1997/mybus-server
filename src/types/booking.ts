import { Types } from "mongoose";

export interface IPassenger {
  name: string;
  age: number;
  gender: "M" | "F" | "O";
  seatId: string;
}

export interface IPayment {
  gateway: "razorpay";
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  status: "initiated" | "authorized" | "captured" | "failed" | "refunded";
  raw?: any;
}

export interface IBooking {
  trip: Types.ObjectId;
  user: Types.ObjectId;
  seatIds: string[];
  passengers: IPassenger[];
  totalAmount: number;

  status: "pending" | "confirmed" | "cancelled" | "expired";

  reservationExpiresAt: Date;

  payment: IPayment;
}
