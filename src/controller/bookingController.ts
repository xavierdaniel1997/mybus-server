import { Request, Response } from "express";
import { getMyBookings, initiateBooking } from "../service/bookingService";
import crypto from "crypto";
import BookingModel from "../models/bookingModel";
import BusTripModel from "../models/bustripModel";
import SeatReservationModal from "../models/seatReservationModel";
import mongoose from "mongoose";
import { cancelSeatFromBookingService } from "../service/cancelBookingService";

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
      boardingPoint,
      droppingPoint,
    });


    return res.status(200).json({
      success: true,
      booking,
      bookingId: booking._id,
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




const verifyPaymentAndConifrmSeat = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      tripId,
      seatIds
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // 1. Update booking
    await BookingModel.findByIdAndUpdate(bookingId, {
      $set: {
        "payment.status": "captured",
        "payment.gatewayPaymentId": razorpay_payment_id,
        "payment.raw.payment_id": razorpay_payment_id,
        status: "confirmed",
      },
    });

    // 2. Mark seats as booked
    await BusTripModel.updateOne(
      { _id: tripId },
      {
        $set: {
          "seatPricing.$[elem].isBooked": true,
        },
      },
      {
        arrayFilters: [{ "elem.seatId": { $in: seatIds } }],
      }
    );

    // 3. Remove hold reservations
    await SeatReservationModal.deleteMany({
      tripId,
      seatId: { $in: seatIds },
    });

    return res.status(200).json({ success: true, message: "Payment verified, booking confirmed" });
  } catch (err: any) {
    console.error("Payment Verification Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


const getBookingController = async (req: Request, res: Response) => {
  try{
    const userId = req.user._id;
    const mybookings = await getMyBookings(userId);
    res.status(200).json({message: "Successfully fetch the booking details", data: mybookings})
  }catch(error: any){
    res.status(400).json({message: "Failed to fetch the booking details"})
  }
}




const cancelSeatFromBookingController = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { seatId } = req.body;

    if(!bookingId){
      throw new Error("bookingId is not found")
    }

    if (!seatId) {
      return res.status(400).json({ message: "seatId is required" });
    }

    const result = await cancelSeatFromBookingService(bookingId, seatId);

    return res.status(200).json({message: "Successfully canceled the booking", result});
  } catch (error) {
    console.error("CANCEL ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { reserveBooking, verifyPaymentAndConifrmSeat, getBookingController, cancelSeatFromBookingController};
