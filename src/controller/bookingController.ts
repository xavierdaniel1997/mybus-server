
import { Request, Response } from "express";
import { initiateBooking } from "../service/bookingService";


const reserveBooking = async (req: Request, res: Response) => {
  try {
    const { tripId, seatIds } = req.body;
    const userId = req.user?.id; 

    if (!tripId || !Array.isArray(seatIds) || !seatIds.length) {
      return res.status(400).json({
        success: false,
        message: "tripId and seatIds[] are required"
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { booking, razorpayOrder } = await initiateBooking({
      tripId,
      seatIds,
      userId
    });

    return res.status(200).json({
      success: true,
      booking,
      razorpayOrder
    });

  } catch (err: any) {
    console.error("Reserve Booking Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to reserve booking"
    });
  }
};



export {reserveBooking}