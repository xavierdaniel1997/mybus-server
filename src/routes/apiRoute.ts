import express from "express";
import authRoute from "./authRoute";
import locationRoute from "./locationRoute";
import seatLayoutRoute from "./seatLayoutRoute";
import busRoute from "./busRoute";
import busrouteRoute from './busrouteRoute';
import bustripScheduleRoute from './busTripScheduleRoute';
import userRoute from "./userRoutes";
import confirmBusRoute from "./confirmBusRoute";
import bookingRoute from "./bookingRoute";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/location", locationRoute);
router.use("/bustype", seatLayoutRoute);
router.use("/mybus", busRoute);
router.use("/myroute", busrouteRoute);
router.use("/mytrips", bustripScheduleRoute);
router.use("/users", userRoute);
router.use("/admin-mybus", confirmBusRoute);
router.use("/booking", bookingRoute);

export default router;
