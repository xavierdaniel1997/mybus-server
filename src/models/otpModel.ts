import { IOtp } from "../types/otp";
import mongoose, {Schema} from "mongoose";

const otpSchema = new Schema<IOtp>({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 60
    }
})

const OtpModel = mongoose.model<IOtp>("Otp", otpSchema)
export default OtpModel;