import { Request, Response } from "express";
import { createBusRouteService, updateBusRouteService } from "../service/routeService";

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


const updateRouteController = async (req: Request, res: Response) => {
  try {
    const { routeId } = req.params;

    if(!routeId){
      throw new Error("busId is not found")
    }

    const updatedRoute = await updateBusRouteService(routeId, req.body);

    if (!updatedRoute) {
      return res.status(404).json({
        success: false,
        message: "Bus route not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bus route updated successfully",
      data: updatedRoute,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to update bus route",
      error: error.message || error,
    });
  }
};

export {createRouteController, updateRouteController} 