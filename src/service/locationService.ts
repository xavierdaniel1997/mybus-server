import LocationModel from "../models/locationModel";
import { ILocation } from "../types/location";


export const createLocation = async (data: ILocation) => {
    return await LocationModel.create(data)
}

export const findStation = async (stationCode: string) => {
    return await LocationModel.findOne({stationCode: stationCode.toUpperCase()})
}

export const getAllLocations = async (skip: number, limit: number) => {
  const locations = await LocationModel.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 }); 

  const totalCount = await LocationModel.countDocuments();

  return { locations, totalCount };
};

export const deleteLocationById = async (locationId: string) => {
    return LocationModel.findByIdAndDelete(locationId)
}

export const updateLocationById = async (
  locationId: string,
  updatedData: Partial<ILocation>
) => {
  if (updatedData.stationCode) {
    const duplicate = await LocationModel.findOne({
      stationCode: updatedData.stationCode.toUpperCase(),
      _id: { $ne: locationId },
    });

    if (duplicate) {
      throw new Error("Station code already exists");
    }

    updatedData.stationCode = updatedData.stationCode.toUpperCase();
  }

  const updatedLocation = await LocationModel.findByIdAndUpdate(
    locationId,
    { $set: updatedData },
    { new: true }
  );

  return updatedLocation;
};