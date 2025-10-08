import { Request, Response } from "express";

const registerUser = (req: Request, res: Response) => {
    try{
        res.status(200).json({message: "Successfully register the user"})
    }catch(error){
        res.status(400).json({message: "Failed to register the user"})
    }
}

export {registerUser}