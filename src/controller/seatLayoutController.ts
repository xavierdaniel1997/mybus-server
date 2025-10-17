import {Request, Response} from "express";
import {ISeatLayout} from "../types/seatLayout";
import {createSeatLayout, existingSeatLayout, getAllSeatingLayout, getAllSeatLayoutNames} from "../service/seatLayoutService";

const createSeatingLayout = async (req: Request, res: Response) => {
  try {
    console.log("req.body form the creat seating layout", req.body);
    const data: ISeatLayout = req.body;

    const existing = await existingSeatLayout(data.name);
  if (existing) {
    throw new Error("Seat layout with this name already exists.");
  }

    const layout = await createSeatLayout(data);
    res
      .status(200)
      .json({message: "Successfully create seating Layout", layout});
  } catch (error: any) {
    res
      .status(400)
      .json({
        message: "Failed to create the seating Layout",
        error: error.message,
      });
      console.log("error form creating the seatLayout", error)
  }
};

const fetchAllSeatLayoutNames = async (req: Request, res: Response) => {
  try{
    const layoutNames = await getAllSeatLayoutNames()
    res.status(200).json({message : "Successfully fetch the layout",  bustypeLayout: layoutNames})
  }catch(error: any){
    res.status(400).json({message: "Failed to fetch the layout names", error: error.message})
  }
}

const fetchAllLayoutController = async (req: Request, res: Response) => {
  try{
    const layouts = await getAllSeatingLayout()
    res.status(200).json({message : "Successfully fetch the layouts",  bustypeLayout: layouts})
  }catch(error: any){
     res.status(400).json({message: "Failed to fetch the layout", error: error.message})
  }
}

export {createSeatingLayout, fetchAllSeatLayoutNames, fetchAllLayoutController};
