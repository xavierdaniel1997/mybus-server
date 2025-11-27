import BookingModel from "../models/bookingModel";
import BusRouteModel from "../models/busrouteModel";
import BusTripModel from "../models/bustripModel";
import UserModel from "../models/userModel";
import { IUserRole } from "../types/user";
import { getRangeDates, Range } from "../utils/date";


type RevenueGranularity = "daily" | "weekly" | "monthly" | "yearly";

export async function getDashboardStats(range: Range) {
  const { start, end } = getRangeDates(range);

  const [
    revenueAgg,
    bookingsCount,
    activeBusesCount,
    avgOccupancy,
    revenueOverview,
    busCountByRoutes,
    recentBookings,
    newUsers,
  ] = await Promise.all([
    getTotalRevenue(start, end),
    getTotalBookings(start, end),
    getActiveBusesCount(),
    getAvgOccupancy(),
    getRevenueOverview(rangeToGranularity(range), start, end),
    getBusCountByRoutes(),
    getRecentBookings(),
    getNewUsers(),
  ]);

  return {
    cards: {
      totalRevenue: revenueAgg.totalRevenue || 0,
      totalBookings: bookingsCount,
      activeBuses: activeBusesCount,
      avgOccupancy: avgOccupancy,
    },
    revenueOverview,
    busCountByRoutes,
    recentBookings,
    newUsers,
  };
}

function rangeToGranularity(range: Range): RevenueGranularity {
  switch (range) {
    case "today":
      return "daily";
    case "week":
      return "daily";
    case "month":
      return "weekly";
    case "year":
      return "monthly";
  }
}



async function getTotalRevenue(start: Date, end: Date) {
  const [res] = await BookingModel.aggregate([
    {
      $match: {
        status: "confirmed",
        "payment.status": "captured",
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalBookings: { $sum: 1 },
      },
    },
  ]);

  return res || { totalRevenue: 0, totalBookings: 0 };
}

async function getTotalBookings(start: Date, end: Date) {
  return BookingModel.countDocuments({
    status: "confirmed",
    createdAt: { $gte: start, $lte: end },
  });
}



async function getActiveBusesCount() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buses = await BusTripModel.distinct("bus", {
    status: "scheduled",
    travelDate: { $gte: today },
  });

  return buses.length;
}


async function getAvgOccupancy() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [res] = await BusTripModel.aggregate([
    {
      $match: {
        status: "scheduled",
        travelDate: { $gte: today },
      },
    },
    {
      $project: {
        totalSeats: { $size: "$seatPricing" },
        bookedSeats: {
          $size: {
            $filter: {
              input: "$seatPricing",
              as: "seat",
              cond: { $eq: ["$$seat.isBooked", true] },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSeats: { $sum: "$totalSeats" },
        bookedSeats: { $sum: "$bookedSeats" },
      },
    },
    {
      $project: {
        _id: 0,
        avgOccupancy: {
          $cond: [
            { $eq: ["$totalSeats", 0] },
            0,
            { $multiply: [{ $divide: ["$bookedSeats", "$totalSeats"] }, 100] },
          ],
        },
      },
    },
  ]);

  return res?.avgOccupancy || 0;
}


async function getRevenueOverview(
  granularity: RevenueGranularity,
  start: Date,
  end: Date
) {
  const unitMap: Record<RevenueGranularity, string> = {
    daily: "day",
    weekly: "week",
    monthly: "month",
    yearly: "year",
  };

  const unit = unitMap[granularity];

  const data = await BookingModel.aggregate([
    {
      $match: {
        status: "confirmed",
        "payment.status": "captured",
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: {
          $dateTrunc: {
            date: "$createdAt",
            unit,
          },
        },
        revenue: { $sum: "$totalAmount" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        bucket: "$_id",
        revenue: 1,
        bookings: 1,
      },
    },
  ]);

  return data;
}


async function getBusCountByRoutes() {
  const data = await BusRouteModel.aggregate([
    {
      $group: {
        _id: "$routeName",
        buses: { $addToSet: "$bus" }, 
      },
    },
    {
      $project: {
        _id: 0,
        routeName: "$_id",
        busCount: { $size: "$buses" },
      },
    },
  ]);

  const totalBuses = data.reduce((acc, r) => acc + r.busCount, 0);

  return {
    totalBuses,
    routes: data, 
  };
}


async function getRecentBookings(limit = 5) {
  return BookingModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({
      path: "trip", select: "-seatPricing",
      populate: [{ path: "bus", select: "name registrationNo brand busType layoutName" }, { path: "route", select: "routeName" }],
    })
    .populate("user", "firstName lastName email phone");
}
  


async function getNewUsers(limit = 5) {
    const filter = { role: IUserRole.USER }
  return UserModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("firstName lastName email phone status createdAt");
}
