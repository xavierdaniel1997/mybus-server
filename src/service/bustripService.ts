import mongoose, { Types } from "mongoose";
import dayjs from "dayjs";
import { getBusDetail } from "./busService";
import { getBusRouteById } from "./routeService";
import BusTripModel from "../models/bustripModel";
import BusScheduleModel from "../models/busScheduleModel";
import BusRouteModel from "../models/busrouteModel";


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


  const allSeats = [
  ...(bus.lowerDeck?.seats?.flat() || []),
  ...(bus.upperDeck?.seats?.flat() || []),
];

const seatPricing = allSeats.map((seat) => {
  let finalPrice = basePrice;

  if (seat.price && typeof seat.price === "number") {
    finalPrice = seat.price;
  }

  return {
    seatId: seat.id,
    seatNumber: seat.seatNumber || seat.id, 
    price: finalPrice,
    isAvailable: true,
  };
});

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


   const todayStart = dayjs().startOf("day").toDate();
  await BusTripModel.deleteMany({
    schedule: schedule._id,
    travelDate: { $lt: todayStart },
  });

  // let currentDate = dayjs(schedule.startDate);

   let currentDate = dayjs(schedule.startDate);
  if (currentDate.isBefore(dayjs(), "day")) currentDate = dayjs();

  const endDate = schedule.endDate ? dayjs(schedule.endDate) : dayjs().add(30, "day"); // default next 30 days
  const tripsToCreate = [];


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


export const verifyTripScheduled = async (scheduleId: string) => {
 return await BusTripModel.updateMany(
      { schedule: scheduleId },
      { $set: { verifiedTrip: true } }
    );
}



export const searchTrips = async (from: string, to: string, date: string, seatType?: string) => {

  const travelDate = new Date(date);

  const routes = await BusRouteModel.find(
    {
      $and: [
        { "source.name": { $regex: new RegExp(from, "i") } },
        { "destination.name": { $regex: new RegExp(to, "i") } },
      ],
    },
    { _id: 1 } // only fetch IDs
  ).lean();

  if (!routes.length) return [];

  const routeIds = routes.map((r) => new Types.ObjectId(r._id));

  // ✅ Step 3: Build efficient match query
  const tripMatch: any = {
    route: { $in: routeIds },
    travelDate,
    status: "scheduled",
    verifiedTrip: true,
  };

  // ✅ Step 4: Aggregation pipeline for efficiency
  const pipeline: any[] = [
    { $match: tripMatch },

    // Join with Bus collection
    {
      $lookup: {
        from: "buses",
        localField: "bus",
        foreignField: "_id",
        as: "bus",
      },
    },
    { $unwind: "$bus" },

    // Optional seat type filter (filtering after join)
    ...(seatType
      ? [{ $match: { "bus.busType": seatType } }]
      : []),

    // Join with BusRoute
    {
      $lookup: {
        from: "busroutes",
        localField: "route",
        foreignField: "_id",
        as: "route",
      },
    },
    { $unwind: "$route" },

    // Join with BusSchedule
    {
      $lookup: {
        from: "busschedules",
        localField: "schedule",
        foreignField: "_id",
        as: "schedule",
      },
    },
    { $unwind: { path: "$schedule", preserveNullAndEmptyArrays: true } },

    // Select only needed fields
    {
      $project: {
        _id: 1,
        travelDate: 1,
        departureTime: 1,
        arrivalTime: 1,
        basePrice: 1,
        seatPricing: 1,
        "bus._id": 1,
        "bus.name": 1,
        "bus.brand": 1,
        "bus.busType": 1,
        "bus.features": 1,
        "bus.images": 1,
        "route._id": 1,
        "route.routeName": 1,
        "route.routeDescription": 1,
        "route.source": 1,
        "route.destination": 1,
        "route.distance": 1,
        "route.duration": 1,
        "schedule._id": 1,
        "schedule.departureTime": 1,
        "schedule.arrivalTime": 1,
        "schedule.basePrice": 1,
      },
    },
    { $sort: { "schedule.departureTime": 1 } },
  ];

  // ✅ Step 5: Execute aggregation (optimized)
  const trips = await BusTripModel.aggregate(pipeline).allowDiskUse(true);

  return trips;
};
