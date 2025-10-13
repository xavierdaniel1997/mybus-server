import express, {Request, Response} from "express";
import { uploadToCloudinary } from "../utils/uploadAssets";
import { ILocationStatus } from "../types/location";
import { createLocation, deleteLocationById, findStation, getAllLocations } from "../service/locationService";

const addLocationController = async (req: Request, res: Response) => {
    console.log("from the addlocation controller", req.body);
  try {
    const {name, city, state, stationCode, latitude, longitude, status} =
      req.body;

    if (!name || !city || !state || !stationCode || !latitude || !longitude) {
      return res.status(400).json({message: "All fields are required"});
    }
    const existingLocation = await findStation(stationCode);
    if (existingLocation) {
      return res.status(400).json({ message: "Station code already exists" });
    }
    let locationImage = "";
    if (req.file) {
      console.log("checking file in the location controller", req.file)
      const uploadedImageUrl = await uploadToCloudinary(req.file, {
        folder: "Mybus/mybusimages",
        resource_type: "image",
      });
      locationImage = uploadedImageUrl;
    }
     const locationData = {
      name,
      city,
      state,
      stationCode,
      latitude,
      longitude,
      locationImage,
      status: status || ILocationStatus.ACTIVE,
    };
    const location = await createLocation(locationData);
    res.status(200).json({message: "New location is added successfully", data: location});
  } catch (error: any) {
    res
      .status(401)
      .json({message: "Failed to add new location", error: error.message});
  }
};

const getLocations = async (req: Request, res: Response) => {
  try{
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
       const { locations, totalCount } = await getAllLocations(skip, limit);

    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({message: "Successfully fetch locations", data: locations,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  }catch(error: any){
    res.status(401).json({message: "Failed to fetch the locations", error: error.message})
  }
}

const updateLocation = async (req: Request, res: Response) => {
  try{
    res.status(200).json({message: "Successfully updated the location details"})
  }catch(error: any){
    res.status(401).json({message: "Failed to update the location details", error: error.message})
  }
}

const deleteLocation = async (req: Request, res: Response) => {
  try{
    const {locationId} = req.params;
    if(!locationId){
      throw new Error("location id is not found")
    }
    await deleteLocationById(locationId)
    res.status(200).json({message: "Successfully deleted the location"})
  }catch(error: any){
    res.status(401).json({message: "Failed to delete the location", error: error.message})
  }
}


export {addLocationController, getLocations, deleteLocation};
