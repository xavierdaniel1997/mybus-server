import {Request, Response} from "express";
import { createBusSchedule } from "../service/busScheduleService";
import { getScheduledTrip } from "../service/bustripService";


const createBusScheduleController = async (req: Request, res: Response) => {
  try {
     const data = req.body;
    const result = await createBusSchedule(data);
    res.status(201).json({
      success: true,
      message: `Bus schedule created and ${result.tripsCreated} trips generated.`,
      schedule: result.schedule,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating trip" , error});
  }
};



const getScheduledTripsController = async (req: Request, res: Response) => {
  try{
    const {scheduledId} = req.params;
    if(!scheduledId){
      throw new Error("scheduled _id is not found")
    }
    const scheduledTrip = await getScheduledTrip(scheduledId)
    res.status(200).json({message: "successfully fetch the trip scheduled", data: scheduledTrip})
  }catch(error){
    res.status(500).json({ message: "Failed to fetch the trip scheduled", error });
  }
}

export {createBusScheduleController, getScheduledTripsController}