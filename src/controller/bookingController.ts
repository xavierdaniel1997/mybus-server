import { Request, Response } from "express";
import { initiateBooking } from "../service/bookingService";

const reserveBooking = async (req: Request, res: Response) => {
  try {
    const {
      tripId,
      seatIds,
      passengers,
      contact,
      boardingPoint,
      droppingPoint,
    } = req.body;

    const userId = req.user._id;

    console.log("checking the data of booking", req.body, "and user", userId);

    if (!tripId || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "tripId and seatIds[] are required",
      });
    }

    if (!contact) {
      return res.status(400).json({
        success: false,
        message: "contact information is required",
      });
    }

    if (!Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "passengers[] is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const processedPassengers = passengers.map((p, i) => ({
      ...p,
      age: Number(p.age),
      seatId: seatIds[i],
    }));

    const { booking, razorpayOrder } = await initiateBooking({
      tripId,
      seatIds,
      userId,
      passengers: processedPassengers,
      contact,
      // boardingPoint,
      // droppingPoint,
    });

    console.log(
      "checking the booking and razorpayOrder....",
      booking,
      razorpayOrder
    );

    return res.status(200).json({
      success: true,
      booking,
      razorpayOrder,
      message: "Successfully reserve the ticket",
    });
  } catch (err: any) {
    console.error("Reserve Booking Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to reserve booking",
    });
  }
};

export { reserveBooking };
