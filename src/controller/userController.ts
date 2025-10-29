import { Request, Response } from "express";


const getUsersController = async (req: Request, res: Response) => {
    try{
        res.status(200).json({message: "Successfully fetch users details"})
    }catch(error){
        res.status(400).json({message: "Failed to fetch all users"})
    }
}

export {getUsersController}