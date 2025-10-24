
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
 * Update an existing bus route by ID
 */
export const updateBusRouteService = async (id: string, data: Partial<IBusRoute>) => {
  const updatedRoute = await BusRouteModel.findByIdAndUpdate(id, data, {
    new: true, // return updated document
    runValidators: true, // validate schema before update
  }).populate("bus");

  return updatedRoute;
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
export const getBusRouteById = async (id: string) => {
  return await BusRouteModel.findById(id).populate("bus", "name registrationNo busType");
};
