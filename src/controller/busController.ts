import {Request, Response} from "express";
import {deleteFromCloudinary, uploadMultipleToCloudinary} from "../utils/uploadAssets";
import {getSeatLayoutById} from "../service/seatLayoutService";
import {createBusService, getAllBusesService, getBusDetail, getFullBusDetails, updateBusService} from "../service/busService";

const createBusController = async (req: Request, res: Response) => {
  try {
    const {
      name,
      registrationNo,
      brand,
      busType,
      layoutId,
      information,
      features,
    } = req.body;

    let images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      images = await uploadMultipleToCloudinary(req.files, {
        folder: "Mybus/mybusimages",
        resource_type: "image",
      });
    }

    const newBus = await createBusService({
      name,
      registrationNo,
      brand,
      busType,
      layoutId,
      information,
      features: JSON.parse(features),
      images,
    });

    res
      .status(200)
      .json({message: "Successfully create the bus", data: newBus});
  } catch (error: any) {
    res
      .status(400)
      .json({message: "Failed to create the bus", error: error.message});
  }
};


const updateBusController = async (req: Request, res: Response) => {
  try {
    const { busId } = req.params;
    const {
      name,
      registrationNo,
      brand,
      busType,
      layoutId,
      information,
      features,
    } = req.body;

    if(!busId){
      throw new Error("busId is not found")
    }
    const existingBus = await getBusDetail(busId);
    if (!existingBus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    // Step Prepare new image list
    let updatedImages = existingBus.images; // default: keep old ones

    // Step If new files are uploaded
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Delete old images from Cloudinary
      if (existingBus.images && existingBus.images.length > 0) {
        await Promise.all(
          existingBus.images.map(async (imgUrl) => {
            try {
              await deleteFromCloudinary(imgUrl);
            } catch (err) {
              console.warn("Failed to delete old image:", imgUrl);
            }
          })
        );
      }

      updatedImages = await uploadMultipleToCloudinary(req.files, {
        folder: "Mybus/mybusimages",
        resource_type: "image",
      });
    }

    let parsedFeatures = features;
    if (typeof features === "string") {
      try {
        parsedFeatures = JSON.parse(features);
      } catch {
        return res.status(400).json({ message: "Invalid features format" });
      }
    }

    const updateData = {
      name,
      registrationNo,
      brand,
      busType,
      layoutId,
      information,
      features: parsedFeatures,
      images: updatedImages,
    };

    const updatedBus = await updateBusService(busId, updateData);

    res
      .status(200)
      .json({ message: "Bus updated successfully", data: updatedBus });
  } catch (error: any) {
    console.error("Error updating bus:", error);
    res.status(400).json({
      message: "Failed to update bus",
      error: error.message,
    });
  }
};



const getBusDetailController = async (req: Request, res: Response) => {
  try{
    const {busId} = req.params;
    if(!busId){
      throw new Error("busId is not found")
    }
    const busDetail = await getFullBusDetails(busId);
    res.status(200).json({message: "Successfully fetch the bus detail", data: busDetail})
  }catch(error: any){
    res.status(400).json({message: "Failed to fetch the bus datails", error: error.message})
  }
}

const getAllBuses = async (req: Request, res: Response) => {
  try{
    const { search } = req.query;
    const buses = await getAllBusesService(search as string);
    res.status(200).json({message: "Successfully fetch the buses", buses})
  }catch(error: any){
    console.log(error)
    res.status(400).json({message: "Failed to fetch the buses", error: error.message})
  }
}

export {createBusController, updateBusController, getBusDetailController, getAllBuses};
