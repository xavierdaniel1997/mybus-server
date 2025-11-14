// services/bookingService.ts
import mongoose from "mongoose";
import BusTripModel from "../models/bustripModel";
import BookingModel from "../models/bookingModel";
import { createRazorpayOrder } from "./paymentService";
import { Types } from "mongoose";

const RESERVATION_MINUTES = 10;

export const initiateBooking = async ({
  tripId,
  seatIds,
  userId
}: {
  tripId: string;
  seatIds: string[];
  userId: string;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reservationUntil = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

    // 1) Re-check availability atomically and mark seats reserved using arrayFilters
    const updateResult = await BusTripModel.updateOne(
      {
        _id: tripId,
        // ensure all requested seats exist AND are currently available
        "seatPricing.seatId": { $in: seatIds }
      },
      {
        $set: {
          "seatPricing.$[elem].isAvailable": false,
          "seatPricing.$[elem].reservedBy": new Types.ObjectId(userId),
          "seatPricing.$[elem].reservedUntil": reservationUntil
        }
      },
      {
        arrayFilters: [{ "elem.seatId": { $in: seatIds }, "elem.isAvailable": true }],
        session
      }
    );

    // Note: updateResult.nModified does not necessarily equal number of seats updated when arrayFilters sets multiple elements.
    // Safer approach: re-read the document in the transaction and verify reserved seats count.

    const tripAfter = await BusTripModel.findById(tripId).session(session);
    if (!tripAfter) throw new Error("Trip not found after update");

    // Count how many of seatIds are now marked reserved by this user
    const reservedCount = tripAfter.seatPricing.filter(
      s => seatIds.includes(s.seatId) && !s.isAvailable && s.reservedBy?.toString() === userId
    ).length;

    if (reservedCount !== seatIds.length) {
      // some seats were not reserved (someone else got them). rollback.
      throw new Error("Some seats are no longer available");
    }

    // 2) Create pending booking
    const totalAmount = seatIds.reduce((acc, seat) => {
      const seatObj = tripAfter.seatPricing.find(s => s.seatId === seat);
      return acc + (seatObj ? seatObj.price ?? tripAfter.basePrice : tripAfter.basePrice);
    }, 0);

    const [booking] = await BookingModel.create(
      [
        {
          trip: tripId,
          user: userId,
          seatIds,
          totalAmount,
          status: "pending",
          reservationExpiresAt: reservationUntil,
          payment: {
            gateway: "razorpay",
            status: "initiated"
          }
        }
      ],
      { session }
    );
    if(!booking){
        throw new Error("Booking from the initiale booking is not found")
    }

    // 3) Create razorpay order
    const razorpayOrder = await createRazorpayOrder({
      bookingId: booking._id.toString(),
      amount: totalAmount
    });

    // attach order to booking (store raw order)
    booking.payment.gatewayOrderId = razorpayOrder.id;
    booking.payment.raw = razorpayOrder;
    await booking.save({ session });

    await session.commitTransaction();

    // Ideally push a delayed job to release seats at reservationUntil
    return { booking, razorpayOrder };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
