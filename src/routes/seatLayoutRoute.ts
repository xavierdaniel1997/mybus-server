import express from 'express';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { createSeatingLayout } from '../controller/seatLayoutController';

const router = express.Router();

router.post("/create-layout", isAuth, isAdmin, createSeatingLayout)

export default router;