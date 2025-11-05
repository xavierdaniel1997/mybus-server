import { Request, Response } from "express";
import { getBusDetailComplete } from "../service/busScheduleService";


const completBusDetailsController = async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;

    if (!scheduleId) throw new Error("scheduleId is missing");

    const data = await getBusDetailComplete(scheduleId);

    res.status(200).json({
      success: true,
      message: "Successfully fetched bus details",
      data,
    });
  } catch (error: any) {
    console.error("Error fetching bus details:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch bus details",
    });
  }
};

export {completBusDetailsController}