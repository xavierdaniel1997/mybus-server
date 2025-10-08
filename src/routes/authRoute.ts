import express from 'express';
import { registerUser } from '../controller/authController';

const router = express.Router();

router.post("/register", registerUser);

export default router;