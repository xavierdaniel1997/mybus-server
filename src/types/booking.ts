import { Types } from "mongoose";
import { IGeoPoint } from "./busroute";

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

export interface IContactDetails {
  phoneCode: string;
  phone: string;
  email: string;
  state: string;
  whatsappEnabled: boolean;
}


export interface IBooking {
  trip: Types.ObjectId;
  user: Types.ObjectId;
  seatIds: string[];
  passengers: IPassenger[];
  contact: IContactDetails;
  totalAmount: number;

  status: "pending" | "confirmed" | "cancelled" | "expired";

  reservationUntil: Date;

  payment: IPayment;

  boardingPoint: IGeoPoint;
  droppingPoint: IGeoPoint;
}
