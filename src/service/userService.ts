import UserModel from "../models/userModel"
import { IUser, IUserRole } from "../types/user"

export const findByEmail = async (email: string) : Promise<IUser | null> => {
    return await UserModel.findOne({ email })
}

export const createUser = async (data: IUser): Promise<IUser> => {
    return await UserModel.create(data)
}

export const updateUser = async (email: string, data: Partial<IUser>) : Promise<IUser | null> => {
    const user = await UserModel.findOneAndUpdate({email}, data, {new: true}).select("-password")
    return user;
}  

export const findUserById = async (userId: string) : Promise<IUser | null> => {
    console.log("userId", userId)
    return await UserModel.findById(userId)
}

export const getAllUsers = async (skip: number, limit: number) => {
    const filter = { role: IUserRole.USER }; 
    const users = await UserModel.find(filter).select("-password").skip(skip).limit(limit).sort({createdAt: -1})
    const totalCount = await UserModel.countDocuments();
    return {users, totalCount}
}

 