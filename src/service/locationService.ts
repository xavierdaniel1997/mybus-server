import LocationModel from "../models/locationModel";
import { ILocation } from "../types/location";


export const createLocation = async (data: ILocation) => {
    return await LocationModel.create(data)
}

export const findStation = async (stationCode: string) => {
    return await LocationModel.findOne({stationCode: stationCode.toUpperCase()})
}

// export const getAllLocations = async () => {
//     return await LocationModel.find()
// }

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