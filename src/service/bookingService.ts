// services/bookingService.ts
import mongoose from "mongoose";
import BusTripModel from "../models/bustripModel";
import BookingModel from "../models/bookingModel";
import { createRazorpayOrder } from "./paymentService";
import { Types } from "mongoose";
import SeatReservationModal from "../models/seatReservationModel";
import { IGeoPoint } from "../types/busroute";


export const holdSeats = async (tripId: string, seatIds: string[], userId: string): Promise<{ expiresAt: Date }> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const trip = await BusTripModel.findById(tripId).session(session);
    if (!trip) throw new Error("Trip not found");

    const seatMap: Record<string, any> = {};
    trip.seatPricing.forEach((s: any) => {
      seatMap[s.seatId] = s;
    });



    // 1. Check permanently booked seats
    for (const seat of seatIds) {
      if (!seatMap[seat]) throw new Error(`Invalid seat ${seat}`);
      if (seatMap[seat].isBooked) throw new Error(`Seat already booked ${seat}`);
    }

    // 2. Check active reservations
    const existingHolds = await SeatReservationModal.find({
      tripId,
      seatId: { $in: seatIds },
      expiresAt: { $gt: new Date() }
    }).session(session);

    if (existingHolds.length > 0) {
      throw new Error("Some seats already reserved");
    }

    // 3. Create TTL reservation
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await SeatReservationModal.insertMany(
      seatIds.map(seat => ({
        tripId,
        seatId: seat,   
        userId,
        expiresAt
      })),
      { session }
    );

    await session.commitTransaction();
    return { expiresAt };

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};





export type InitiateBookingParams = {
  tripId: string;
  seatIds: string[];
  userId: string;
  passengers: Array<{ price?: number; [key: string]: any }>;
  contact?: { [key: string]: any } | null;
  boardingPoint: IGeoPoint;
  droppingPoint: IGeoPoint;
};

export const initiateBooking = async ({
  tripId,
  seatIds,   
  userId,
  passengers,
  contact,
  boardingPoint,
  droppingPoint,
}: InitiateBookingParams) => {  
  // 1) Create seat hold (TTL)
  const { expiresAt } = await holdSeats(tripId, seatIds, userId);


    const trip = await BusTripModel.findById(tripId);
  if (!trip) throw new Error("Trip not found");

  const seatMap: Record<string, number> = {};
  trip.seatPricing.forEach((s) => {
    seatMap[s.seatId] = s.price;
  });

  // 3. Compute amount ONLY from backend pricing
  const totalAmount = seatIds.reduce((acc, seatId) => {
    return acc + (seatMap[seatId] || 0);
  }, 0);

  if (totalAmount <= 0) {
    throw new Error("Invalid seat pricing – total amount is zero");
  }


  // 3) Create booking in pending state
  const booking = await BookingModel.create({
    trip: tripId,
    user: userId,
    seatIds,
    passengers,
    contact,
    totalAmount,
    status: "pending",
    reservationUntil: expiresAt,
    payment: { status: "initiated" },
    boardingPoint,
  droppingPoint,
  });

  // 4) Create Razorpay order
  const razorpayOrder = await createRazorpayOrder({
    bookingId: booking._id.toString(),
    amount: totalAmount * 100,
  });

  booking.payment.gatewayOrderId = razorpayOrder.id;
  booking.payment.raw = razorpayOrder;
  await booking.save();

  return { booking, razorpayOrder };
};



export const getMyBookings = async (userId: string) => {
  const bookings = await BookingModel.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        status: { $in: ["confirmed"] },
      },
    },

    // Trip Lookup
    {
      $lookup: {
        from: "bustrips",
        localField: "trip",
        foreignField: "_id",
        as: "trip",
      },
    },
    { $unwind: "$trip" },

    // Bus Lookup
    {
      $lookup: {
        from: "buses",
        localField: "trip.bus",
        foreignField: "_id",
        as: "trip.bus",
      },
    },
    { $unwind: "$trip.bus" },

    // Route Lookup
    {
      $lookup: {
        from: "busroutes",
        localField: "trip.route",
        foreignField: "_id",
        as: "trip.route",
      },
    },
    { $unwind: "$trip.route" },

    // One passenger = one row
    { $unwind: "$passengers" },

    // Add normalized dates
    {
      $addFields: {
        bookingDateOnly: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        travelDateOnly: {
          $dateToString: { format: "%Y-%m-%d", date: "$trip.travelDate" },
        },
      },
    },

    // FIX: keep travelDateOnly in projection
    {
      $project: {
        _id: 0,

        passenger: "$passengers",
        seatId: "$passengers.seatId",

        bookingId: "$_id",
        boardingPoint: "$boardingPoint",
        droppingPoint: "$droppingPoint",
        contact: 1,
        totalAmount: 1,
        status: 1,
        createdAt: 1,
        reservationUntil: 1,
        payment: 1,

        // FIXED: Keep this field so group works
        travelDateOnly: 1,

        travelDate: "$travelDateOnly",
        bookingDateOnly: 1,

        trip: {
          travelDate: "$trip.travelDate",
          departureTime: "$trip.departureTime",
          arrivalTime: "$trip.arrivalTime",
          bus: {
            name: "$trip.bus.name",
            registrationNo: "$trip.bus.registrationNo",
            brand: "$trip.bus.brand",
            layoutName: "$trip.bus.layoutName",
          },
          route: {
            routeName: "$trip.route.routeName",
            source: "$trip.route.source",
            destination: "$trip.route.destination",
          },
        },
      },
    },

    // GROUP BY TRAVEL DATE (now works)
    {
      $group: {
        _id: "$travelDateOnly", // now this field exists
        tickets: { $push: "$$ROOT" },
      },
    },

    // Sort desc
    { $sort: { travelDateObj: 1  } },

    // Final shape
    {
      $project: {
        date: "$_id",
        tickets: 1,
        _id: 0,
      },
    },
  ]);

  return bookings;
};


