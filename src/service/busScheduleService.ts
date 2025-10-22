import BusScheduleModel from "../models/busScheduleModel";
import { generateTripsForSchedule } from "./bustripService";


export const createBusSchedule = async (data: {
  bus: string;
  route: string;
  frequency: "daily" | "weekdays" | "custom";
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  startDate: string;
  endDate?: string;
}) => {
  // ✅ Create the schedule record
  const schedule = await BusScheduleModel.create({
    bus: data.bus,
    route: data.route,
    frequency: data.frequency,
    departureTime: data.departureTime,
    arrivalTime: data.arrivalTime,
    basePrice: data.basePrice,
    startDate: data.startDate,
    endDate: data.endDate,
  });

  // ✅ Automatically generate trips for this schedule
  const trips = await generateTripsForSchedule(schedule._id.toString());

  return { schedule, tripsCreated: trips.length };
};
