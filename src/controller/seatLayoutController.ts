import {Request, Response} from "express";
import {ISeatLayout} from "../types/seatLayout";
import {createSeatLayout} from "../service/seatLayoutService";

const createSeatingLayout = async (req: Request, res: Response) => {
  try {
    console.log("req.body form the creat seating layout", req.body);
    const data: ISeatLayout = req.body;

    const layout = await createSeatLayout(data);
    res
      .status(200)
      .json({message: "Successfully create seating Layout", layout});
  } catch (error: any) {
    res
      .status(401)
      .json({
        message: "Failed to create the seating Layout",
        error: error.message,
      });
      console.log("error form creating the seatLayout", error)
  }
};

export {createSeatingLayout};
