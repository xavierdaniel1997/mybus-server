import express from 'express';
import { getBookingController, reserveBooking, verifyPaymentAndConifrmSeat } from '../controller/bookingController';
import { isAdmin, isAuth } from '../middleware/isAuth';

const router = express.Router();

router.post("/reserve", isAuth, reserveBooking);
router.post("/verify-payment", isAuth, verifyPaymentAndConifrmSeat);
router.get("/my-bookings", isAuth, getBookingController);
             


export default router;