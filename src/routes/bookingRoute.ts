import express from 'express';
import { reserveBooking } from '../controller/bookingController';
import { isAdmin, isAuth } from '../middleware/isAuth';

const router = express.Router();

router.post("/reserve", isAuth, reserveBooking);
             


export default router;