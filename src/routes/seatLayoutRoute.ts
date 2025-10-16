import express from 'express';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { createSeatingLayout, fetchAllSeatLayoutNames } from '../controller/seatLayoutController';

const router = express.Router();

router.post("/create-layout", isAuth, isAdmin, createSeatingLayout)
router.get("/get-layout-names", fetchAllSeatLayoutNames)

export default router;