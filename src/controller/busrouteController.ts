import { Request, Response } from "express";
import { createBusRouteService } from "../service/routeService";

const createRouteController  = async (req: Request, res: Response) => {
    try{
         const route = await createBusRouteService(req.body);
    res.status(200).json({
      success: true,    
      message: "Bus route created successfully",
      data: route,
    });
    }catch(error){
        res.status(400).json({message: "Failed to create a new route", error})
    }
}

export {createRouteController} 