import {Request, Response} from "express";
import { createBusSchedule, updateBusSchedule } from "../service/busScheduleService";
import { getScheduledTrip, getTripByIdService, searchTrips, verifyTripScheduled } from "../service/bustripService";


const createBusScheduleController = async (req: Request, res: Response) => {
  try {
     const data = req.body;
    const result = await createBusSchedule(data);
    res.status(200).json({
      success: true,
      message: `Bus schedule created and ${result.tripsCreated} trips generated.`,
      schedule: result.schedule,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating trip" , error});
  }
};



const updateBusScheduleController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const data = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Missing schedule ID" });
    }

    const updatedSchedule = await updateBusSchedule(id, data);

    res.status(200).json({
      success: true,
      message: "Bus schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Error updating schedule",
    });
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


const verifyTripsForSchedule = async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;
    if (!scheduleId) return res.status(400).json({ message: "scheduleId required" });


    const result = await verifyTripScheduled(scheduleId)

    return res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount || 0} trips as verified.`,
      result,
    });
  } catch (error) {
    console.error("verifyTripsForSchedule error:", error);
    res.status(500).json({ message: "Failed to update the trip" });
  }
};


const searchTripController = async (req: Request, res: Response) => {
  try{
const { from, to, date, seatType } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ message: "Missing required fields: from, to, or date" });
    }
      const trips = await searchTrips(
      from as string,
      to as string,
      date as string,
      seatType as string
    );

    if (!trips.length) {
      return res.status(404).json({ message: "No trips found for this search." });
    }

    res.status(200).json({
      message: "Trips fetched successfully",
      count: trips.length,
      data: trips,
    });
  }catch(error: any){
    res.status(400).json({message: "Failed to fetch the trip details", error})
  }
}


const getBusTripById = async (req: Request, res: Response) => {
   try {
    const { tripId } = req.params;
    if(!tripId){
      throw new Error("tripId not found")
    }
    const trip = await getTripByIdService(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json(trip);
  } catch (error: any) {
    console.error("Error fetching trip details:", error);
    res.status(500).json({
      message: "Failed to fetch trip details",
      error: error.message,
    });
  }
}

export {createBusScheduleController, getScheduledTripsController, updateBusScheduleController, verifyTripsForSchedule, searchTripController, getBusTripById}