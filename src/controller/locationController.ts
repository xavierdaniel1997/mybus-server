import express, {Request, Response} from "express";
import { uploadToCloudinary } from "../utils/uploadAssets";
import { ILocationStatus } from "../types/location";
import { createLocation, findStation } from "../service/locationService";

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

export {addLocationController};
