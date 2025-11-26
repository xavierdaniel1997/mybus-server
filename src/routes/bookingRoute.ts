import express from 'express';
import { cancelSeatFromBookingController, getBookingController, getBookingDetailsByBus, reserveBooking, verifyPaymentAndConfirmSeat } from '../controller/bookingController';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { stripeWebhookHandler } from '../controller/stripeController';

const router = express.Router();

router.post("/reserve", isAuth, reserveBooking);
router.post("/verify-payment", isAuth, verifyPaymentAndConfirmSeat);
router.get("/my-bookings", isAuth, getBookingController);
router.patch("/cancel/:bookingId", isAuth, cancelSeatFromBookingController);

router.get("/booking-by-bus/:busId", isAuth, isAdmin, getBookingDetailsByBus)

router.post("/stripe/webhook", stripeWebhookHandler);

export default router;