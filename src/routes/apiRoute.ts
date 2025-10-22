import express from "express";
import authRoute from "./authRoute";
import locationRoute from "./locationRoute";
import seatLayoutRoute from "./seatLayoutRoute";
import busRoute from "./busRoute";
import busrouteRoute from './busrouteRoute';
import bustripScheduleRoute from './busTripScheduleRoute';

const router = express.Router();

router.use("/auth", authRoute);
router.use("/location", locationRoute);
router.use("/bustype", seatLayoutRoute);
router.use("/mybus", busRoute);
router.use("/myroute", busrouteRoute);
router.use("/mytrips", bustripScheduleRoute);

export default router;
