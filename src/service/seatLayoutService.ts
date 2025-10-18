import SeatLayoutModel from "../models/seatLayoutModel";
import { ISeatLayout } from "../types/seatLayout";


export const existingSeatLayout = async (name: string) => {
  const existing = await SeatLayoutModel.findOne({name})
  return existing;
}

export const createSeatLayout = async (data: ISeatLayout) => {
  const layout = await SeatLayoutModel.create({
    ...data,
    createdAt: new Date(),
  });

  return layout;
};

export const getAllSeatLayoutNames = async () => {
  return await SeatLayoutModel.find({}, {name: 1})
}

export const getSeatLayoutById = async (id: string) => {
  return await SeatLayoutModel.findById(id)
}

export const getAllSeatingLayout = async () => {
  return await SeatLayoutModel.find()
}

