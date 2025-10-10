import mongoose, {Schema} from "mongoose";
import { IUser, IUserRole } from "../types/user";


const userSchema = new Schema<IUser>({
    firstName: {
        type: String,
        // required: true,
    },
    lastName: {
        type: String,
        // required: true
    },
    phone: {
        type: Number,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        // required: true
    },
    role: {
        type: String,
        enum: Object.values(IUserRole),
        required: true,
        default: IUserRole.USER,
    },
    avatar: {
        type: String,
    },
    isValidate: {
        type: Boolean,
        default: false,
    },
     isRegComplet: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true})

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;