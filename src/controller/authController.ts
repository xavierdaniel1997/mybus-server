import {Request, Response} from "express";
import {createUser, findByEmail, updateUser} from "../service/userService";
import {generateOtp} from "../utils/generateOtp";
import {EmailType, sendEmail} from "../utils/emailService";
import {createOtp, deleteOtp, findOtp} from "../service/otpService";
import bcrypt from "bcryptjs";
import {IUser, IUserRole} from "../types/user";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";

const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {email} = req.body;
    const existingUser = await findByEmail(email);
    if (existingUser) {
      throw new Error("User already existing");
    }
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
    await createOtp({email, otp: otpCode, expiresAt});
    await sendEmail(email, EmailType.OTP, {otp: otpCode});
    res.status(200).json({message: "Otp send successfully to your email"});
  } catch (error: any) {
    res
      .status(401)
      .json({message: "Failed to register the user", error: error.message});
    console.log("error", error);
  }
};


const verifyOtpAndUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const validOtp = await findOtp(email, otp);
    if (!validOtp) {
      throw new Error("Invalid OTP");
    }
    if (otp !== validOtp.otp || email !== validOtp.email) {
      throw new Error("Invalid Otp");
    }

    const currentTime = new Date();
    if (otp.expiresAt < currentTime) {
      throw new Error("OTP has expired");
    }

    const user = {
      email,
      role: IUserRole.USER,
      isValidate: true,
    };
    await createUser(user);
    await deleteOtp(email);
    res.status(200).json({ message: "OTP verifyed successfully", email });
  } catch (error: any) {
    res.status(401).json({
      message: error.message || "Failed to verify the OTP",
      error: error.message,
    });
    console.log("error", error);
  }
};

const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
    await createOtp({ email, otp: otpCode, expiresAt });
    await sendEmail(email, EmailType.OTP, { otp: otpCode });
    res.status(200).json({ message: "Otp send successfully to your email" });
  } catch (error: any) {
    res.status(401).json({ message: error.message || "Failed to resend OTP" });
  }
};


const registerVerifiedUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("req body of registerVerified user", req.body);
  try {
    const { firstName, lastName, phone, email, password, confirmPassword } = req.body;
    const existingUser = await findByEmail(email);
    // console.log("existingUser..................", existingUser)  
    if (existingUser && existingUser.isRegComplet) {
      throw new Error("User already existing");    
    }           
    if (!existingUser || !existingUser.isValidate) {          
      throw new Error("User is not verified OTP verification required");
    }
    if (password !== confirmPassword) {
      throw new Error("Password dosen't match");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const registerNewUser: Partial<IUser> = {
      firstName,
      lastName,
      phone,
      password: hashPassword,
      isRegComplet: true,
    };
    const newUser = await updateUser(email, registerNewUser);
    console.log("user details after registred the new user", newUser);
    if (!newUser) {
      throw new Error("Failed to get th new user details");
    }
    if (
      !newUser._id ||
      !newUser.role ||
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.email
    ) {
      throw new Error("User detail missing required fields");
    }
    const accessToken = generateAccessToken(
      newUser._id,
      newUser.role,
      newUser.firstName,
      newUser.lastName,
      newUser.email
    );
    const refreshToken = generateRefreshToken(
      newUser._id,
      newUser.role,
      newUser.firstName,
      newUser.lastName,
      newUser.email
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.status(200).json({
      user: newUser,
      accessToken,
      mesage: "User registered successfully",
    });
  } catch (error: any) {
    res.status(401).json({
      message: error.message || "Failed to register the user",
      error: error.mesage,
    });
  }
};


const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const userData = await findByEmail(email);
    if (!userData) {
      throw new Error("User not fount");
    }
    if (!userData.isValidate) {
      throw new Error(
        "User is not verified. Please complete OTP verification."
      );
    }
    if (!userData.isRegComplet) {
      throw new Error("User registration is incomplete");
    }
    const matchPassword = await bcrypt.compare(password, userData.password!);
    if (!matchPassword) {
      throw new Error("Invalid credentials");
    }
    console.log("after successfull login userData", userData);
    if (
      !userData._id ||
      !userData.role ||
      !userData.firstName ||
      !userData.lastName ||
      !userData.email
    ) {
      throw new Error("User detail missing required fields");
    }
    const accessToken = generateAccessToken(
      userData._id,
      userData.role,
      userData.firstName,
      userData.lastName,
      userData.email
    );
    const refreshToken = generateRefreshToken(
      userData._id,
      userData.role,
      userData.firstName,
      userData.lastName,
      userData.email
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res
      .status(200)
      .json({ user: userData, accessToken, message: "Login successfully" });
  } catch (error: any) {
    res.status(401).json({
      message: error.message || "Failed to login",
      error: error.message,
    });
  }
};

const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("refrreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logout successfully" });
  } catch (error: any) {
    res.status(401).json({ message: error.message || "Failed to logout" });
  }
};


export {registerUser, verifyOtpAndUser, resendOtp, registerVerifiedUser};
