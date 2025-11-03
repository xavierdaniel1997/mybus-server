import mongoose from "mongoose";
import dayjs from "dayjs";
import { getBusDetail } from "./busService";
import { getBusRouteById } from "./routeService";
import BusTripModel from "../models/bustripModel";
import BusScheduleModel from "../models/busScheduleModel";


/** Create a single trip */
export const createBusTrip = async (data: {
  busId: string;
  routeId: string;
  scheduleId?: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
}) => {
  const { busId, routeId, scheduleId, travelDate, departureTime, arrivalTime, basePrice } = data;

  const bus = await getBusDetail(busId);
  if (!bus) throw new Error("Bus not found");

  const route = await getBusRouteById(routeId);
  if (!route) throw new Error("Route not found");

  // flatten lower + upper deck seats
  const allSeats = [
    ...(bus.lowerDeck?.seats?.flat() || []),
    ...(bus.upperDeck?.seats?.flat() || []),
  ];

  const seatPricing = allSeats.map((seat) => ({
    seatId: seat.id,
    price: seat.price || basePrice,
    isAvailable: seat.isAvailable,
  }));

  return await BusTripModel.create({
    bus: busId,
    route: routeId,
    schedule: scheduleId,
    travelDate,
    departureTime,
    arrivalTime,
    basePrice,
    seatPricing,
  });
};


export const getScheduledTrip = async (scheduledId: string) => {
  return await BusScheduleModel.findById(scheduledId)
}

/** Create trips automatically between date range for a schedule */
export const generateTripsForSchedule = async (scheduleId: string) => {
  const schedule = await BusScheduleModel.findById(scheduleId);
  if (!schedule) throw new Error("Schedule not found");

  let currentDate = dayjs(schedule.startDate);
  const endDate = schedule.endDate ? dayjs(schedule.endDate) : dayjs().add(30, "day"); // default next 30 days
  const tripsToCreate = [];

  // while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
  //   const dayOfWeek = currentDate.day();

  //   if (
  //     schedule.frequency === "daily" ||
  //     (schedule.frequency === "weekdays" && dayOfWeek >= 1 && dayOfWeek <= 5)
  //   ) {
  //     tripsToCreate.push(
  //       createBusTrip({
  //         busId: schedule.bus.toString(),
  //         routeId: schedule.route.toString(),
  //         scheduleId: schedule._id.toString(),
  //         travelDate: currentDate.toISOString(),
  //         departureTime: schedule.departureTime,
  //         arrivalTime: schedule.arrivalTime,
  //         basePrice: schedule.basePrice,
  //       })
  //     );
  //   }

  //   currentDate = currentDate.add(1, "day");
  // }

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
  const dayOfWeek = currentDate.day();
  let shouldCreate = false;

  if (schedule.frequency === "daily") {
    shouldCreate = true;
  } else if (schedule.frequency === "weekdays" && dayOfWeek >= 1 && dayOfWeek <= 5) {
    shouldCreate = true;
  } else if (schedule.frequency === "custom" && schedule.customInterval) {
    shouldCreate = true;
  }

  if (shouldCreate) {
    tripsToCreate.push(
      createBusTrip({
        busId: schedule.bus.toString(),
        routeId: schedule.route.toString(),
        scheduleId: schedule._id.toString(),
        travelDate: currentDate.toISOString(),
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        basePrice: schedule.basePrice,
      })
    );
  }

  // advance based on frequency
  if (schedule.frequency === "custom" && schedule.customInterval) {
    currentDate = currentDate.add(schedule.customInterval, "day");
  } else {
    currentDate = currentDate.add(1, "day");
  }
}


  return await Promise.all(tripsToCreate);
};



/** Fetch trips by route/date/status */
export const getTrips = async (filters: {
  date?: string;
  routeId?: string;
  busId?: string;
  status?: string;
}) => {
  const query: any = {};

  if (filters.date) {
    const start = new Date(filters.date);
    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);
    query.travelDate = { $gte: start, $lte: end };
  }
  if (filters.routeId) query.route = new mongoose.Types.ObjectId(filters.routeId);
  if (filters.busId) query.bus = new mongoose.Types.ObjectId(filters.busId);
  if (filters.status) query.status = filters.status;

  return await BusTripModel.find(query)
    .populate("bus", "name brand busType layoutName")
    .populate("route", "routeName source destination distance duration");
};
