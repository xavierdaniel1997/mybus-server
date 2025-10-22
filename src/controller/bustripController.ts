import {Request, Response} from "express";
import { createBusSchedule } from "../service/busScheduleService";


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
    res.status(500).json({ message: "Error creating trip" });
  }
};

export {createBusScheduleController}