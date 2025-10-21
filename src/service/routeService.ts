
import BusRouteModel from "../models/busrouteModel";
import { IBusRoute } from "../types/busroute";

/**
 * Create a new bus route
 */
export const createBusRouteService = async (data: IBusRoute) => {
  const route = new BusRouteModel(data);
  return await route.save();
};

/**
 * Get all bus routes
 */
export const getAllBusRoutesService = async () => {
  return await BusRouteModel.find().populate("bus", "name registrationNo busType");
};

/**
 * Get a single route by ID
 */
export const getBusRouteByIdService = async (id: string) => {
  return await BusRouteModel.findById(id).populate("bus", "name registrationNo busType");
};
