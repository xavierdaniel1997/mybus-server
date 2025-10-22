import express from 'express';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { createBusScheduleController } from '../controller/bustripController';


const router = express.Router();

router.post("/schedule-trip", isAuth, isAdmin, createBusScheduleController)             

export default router;