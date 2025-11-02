import express from 'express';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { createBusScheduleController, getScheduledTripsController, updateBusScheduleController } from '../controller/bustripController';


const router = express.Router();

router.post("/schedule-trip", isAuth, isAdmin, createBusScheduleController);
router.put("/update-trip-schedule/:id", isAuth, isAdmin, updateBusScheduleController)
router.get("/scheduled-trips/:scheduledId", isAuth, isAdmin, getScheduledTripsController) ;         

export default router;