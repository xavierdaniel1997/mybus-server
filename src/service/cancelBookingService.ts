import BookingModel from "../models/bookingModel";
import BusTripModel from "../models/bustripModel";

export const cancelSeatFromBookingService = async (bookingId: string, seatId: string) => {
  const booking = await BookingModel.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== "confirmed") {
    throw new Error("Booking is not confirmed");
  }

  if (!booking.seatIds.includes(seatId)) {
    throw new Error("This seat is not part of the booking");
  }

  const tripId = booking.trip;

  // 1. FREE seat in BusTrip.seatPricing
  await BusTripModel.updateOne(
    { _id: tripId },
    {
      $set: { "seatPricing.$[elem].isBooked": false },
    },
    {
      arrayFilters: [{ "elem.seatId": seatId }],
    }
  );

  // 2. REMOVE seatId from booking.seatIds
  booking.seatIds = booking.seatIds.filter((s) => s !== seatId);

  // 3. REMOVE passenger entry
  booking.passengers = booking.passengers.filter((p) => p.seatId !== seatId);

  // 4. Calculate seat-level refund
  const trip = await BusTripModel.findById(tripId, { seatPricing: 1 });

  if (!trip) {
    throw new Error("Trip not found");
  }

  const seatPricing = trip.seatPricing.find((s) => s.seatId === seatId);

  if (!seatPricing) throw new Error("Seat pricing not found");

  const refundAmount = seatPricing.price * 0.65;

  // 5. If no seats left → cancel booking fully
  if (booking.seatIds.length === 0) {
    booking.status = "cancelled";
  }

  await booking.save();

  return {
    message: "Seat cancelled successfully",
    cancelledSeat: seatId,
    refundAmount,
    bookingStatus: booking.status,
  };
};