import express from 'express';
import authRoute from './authRoute';
import locationRoute from './locationRoute';
import seatLayoutRoute from './seatLayoutRoute';

const router = express.Router();

router.use("/auth", authRoute);
router.use("/location", locationRoute)
router.use("/bustype", seatLayoutRoute)

export default router;