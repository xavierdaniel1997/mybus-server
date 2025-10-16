import SeatLayoutModel from "../models/seatLayoutModel";
import { ISeatLayout } from "../types/seatLayout";


export const existingSeatLayout = async (name: string) => {
  const existing = await SeatLayoutModel.findOne({name})
  return existing;
}

export const createSeatLayout = async (data: ISeatLayout) => {
  // const existing = await SeatLayoutModel.findOne({ name: data.name });
  // if (existing) {
  //   throw new Error("Seat layout with this name already exists.");
  // }
  const layout = await SeatLayoutModel.create({
    ...data,
    createdAt: new Date(),
  });

  return layout;
};

export const getAllSeatLayoutNames = async () => {
  return await SeatLayoutModel.find({}, {name: 1, _id: 0})
}

