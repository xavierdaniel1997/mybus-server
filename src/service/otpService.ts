import OtpModel from "../models/otpModel"
import { IOtp } from "../types/otp"


export const createOtp = async (otp: IOtp) => {
    return await OtpModel.create(otp)
}

export const findOtp = async (email: string, otp: string) => {
    return await OtpModel.findOne({email, otp})
}      

export const deleteOtp = async (email: string) => {
    return await OtpModel.deleteOne({email})
}