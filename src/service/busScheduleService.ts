import { scheduler } from "timers/promises";
import BusScheduleModel from "../models/busScheduleModel";
import { generateTripsForSchedule } from "./bustripService";
import BusTripModel from "../models/bustripModel";


export const createBusSchedule = async (data: {
  bus: string;
  route: string;
  frequency: "daily" | "weekdays" | "custom";
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  customInterval: number;
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
    customInterval: data.customInterval,
    startDate: data.startDate,
    endDate: data.endDate,
  });

  // ✅ Automatically generate trips for this schedule
  const trips = await generateTripsForSchedule(schedule._id.toString());

  return { schedule, tripsCreated: trips.length };
};


export const updateBusSchedule = async (
  scheduleId: string,
  data: Partial<{
    bus: string;
    route: string;
    frequency: "daily" | "weekdays" | "custom";
    departureTime: string;
    arrivalTime: string;
    basePrice: number;
    customInterval: number;
    startDate: string;
    endDate?: string;
    active: boolean;
  }>
) => {
  const existingSchedule = await BusScheduleModel.findById(scheduleId);
  if (!existingSchedule) {
    throw new Error("Schedule not found");
  }

  Object.assign(existingSchedule, data);
  await existingSchedule.save();

  return existingSchedule;
};



export const getBusDetailComplete = async (scheduleId: string) => {

  const schedule = await BusScheduleModel.findById(scheduleId)
    .populate({
      path: "bus",
      select: "name registrationNo brand busType layoutName lowerDeck upperDeck features images",
    })
    .populate({
      path: "route",
      select: "routeName source destination boardingPoints droppingPoints distance duration",
    })
    .lean(); 

  if (!schedule) {
    throw new Error("Schedule not found");
  }

  const trips = await BusTripModel.find({ schedule: scheduleId })
    .select("travelDate seatPricing status basePrice departureTime arrivalTime")
    .lean();

  return {
    bus: schedule.bus,
    route: schedule.route,
    schedule,
    trips,
  };
};