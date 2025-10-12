import express from 'express';
import { loginUser, logoutUser, refreshAccessToken, registerUser, registerVerifiedUser, resendOtp, verifyOtpAndUser } from '../controller/authController';

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtpAndUser);
router.post("/resend-otp", resendOtp);
router.put("/register-verified-user", registerVerifiedUser);
router.post("/login-user", loginUser),
router.post("/logout-user", logoutUser),
router.post("/new-accesstoken", refreshAccessToken)   

export default router;    