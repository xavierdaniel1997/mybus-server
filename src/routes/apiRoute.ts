import express from 'express';
import authRoute from './authRoute';
import locationRoute from './locationRoute';

const router = express.Router();

router.use("/auth", authRoute);
router.use("/location", locationRoute)

export default router;