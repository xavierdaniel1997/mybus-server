import { Types} from "mongoose";

export interface ISeatPricing {
  seatId: string; 
  price: number;
  isAvailable: boolean;
}

export interface IBusTrip {
  bus: Types.ObjectId;
  route: Types.ObjectId;
  schedule: Types.ObjectId;
  travelDate: Date;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  seatPricing: ISeatPricing[];
  status: "scheduled" | "cancelled" | "completed";
  verifiedTrip: boolean;
}