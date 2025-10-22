import { Types } from "mongoose";

export interface IBusSchedule {
  bus: Types.ObjectId;
  route: Types.ObjectId;
  frequency: "daily" | "weekdays" | "custom";
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  startDate: Date;
  endDate?: Date;
  active: boolean;
}