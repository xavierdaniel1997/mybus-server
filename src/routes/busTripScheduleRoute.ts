import express from 'express';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { createBusScheduleController, getBusTripById, getScheduledTripsController, searchTripController, updateBusScheduleController, verifyTripsForSchedule } from '../controller/bustripController';


const router = express.Router();

router.post("/schedule-trip", isAuth, isAdmin, createBusScheduleController);
router.put("/update-trip-schedule/:id", isAuth, isAdmin, updateBusScheduleController)
router.get("/scheduled-trips/:scheduledId", isAuth, isAdmin, getScheduledTripsController) ; 
router.patch("/verify-trips/:scheduleId", isAuth, isAdmin, verifyTripsForSchedule);   
router.get("/search-trip", searchTripController) ;
// router.get("/get-trip-detail/:tripId", isAuth, isAdmin, getBusTripById);   
router.get("/get-trip-detail/:tripId", getBusTripById);

export default router;