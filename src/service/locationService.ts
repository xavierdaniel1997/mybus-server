import LocationModel from "../models/locationModel";
import { ILocation } from "../types/location";


export const createLocation = async (data: ILocation) => {
    return await LocationModel.create(data)
}

export const findStation = async (stationCode: string) => {
    return await LocationModel.findOne({stationCode: stationCode.toUpperCase()})
}