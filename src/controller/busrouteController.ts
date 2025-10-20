import { Request, Response } from "express";

const createRouteController  = async (req: Request, res: Response) => {
    try{
        res.status(200).json({message: "Successfully created new route"})
    }catch(error){
        res.status(400).json({message: "Failed to create a new route"})
    }
}

export {createRouteController}