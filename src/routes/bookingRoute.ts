import express from 'express';
import { cancelSeatFromBookingController, getBookingController, reserveBooking, verifyPaymentAndConifrmSeat } from '../controller/bookingController';
import { isAdmin, isAuth } from '../middleware/isAuth';

const router = express.Router();

router.post("/reserve", isAuth, reserveBooking);
router.post("/verify-payment", isAuth, verifyPaymentAndConifrmSeat);
router.get("/my-bookings", isAuth, getBookingController);
router.patch("/cancel/:bookingId", isAuth, cancelSeatFromBookingController);
             


export default router;