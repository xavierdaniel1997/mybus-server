import express from 'express';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { createSeatingLayout, fetchAllLayoutController, fetchAllSeatLayoutNames } from '../controller/seatLayoutController';

const router = express.Router();

router.post("/create-layout", isAuth, isAdmin, createSeatingLayout)
router.get("/get-layout-names",isAuth, isAdmin, fetchAllSeatLayoutNames)
router.get("/get-all-layouts", fetchAllLayoutController)


export default router;