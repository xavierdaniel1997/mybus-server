import { Request, Response } from "express";
import { findByEmail } from "../service/userService";
import { generateOtp } from "../utils/generateOtp";
import { EmailType, sendEmail } from "../utils/emailService";
import { createOtp } from "../service/otpService";

const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const existingUser = await findByEmail(email);
    if (existingUser) {
      throw new Error("User already existing");
    }
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
    await createOtp({ email, otp: otpCode, expiresAt });
    await sendEmail(email, EmailType.OTP, { otp: otpCode });
    res.status(200).json({ message: "Otp send successfully to your email" });
  } catch (error: any) {
    res
      .status(401)
      .json({ message: "Failed to register the user", error: error.message });
    console.log("error", error);
  }
};

export {registerUser}