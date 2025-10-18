import {Request, Response} from "express";
import {uploadMultipleToCloudinary} from "../utils/uploadAssets";
import {getSeatLayoutById} from "../service/seatLayoutService";
import {createBusService, getBusDetail} from "../service/busRouteService";

const createBusController = async (req: Request, res: Response) => {
  try {
    // console.log("req.body form the createBusController", req.body);
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


const getBusDetailController = async (req: Request, res: Response) => {
  try{
    const {busId} = req.params;
    if(!busId){
      throw new Error("busId is not found")
    }
    console.log("bus id...........", busId)
    const busDetail = await getBusDetail(busId);
    res.status(200).json({message: "Successfully fetch the bus detail", data: busDetail})
  }catch(error: any){
    res.status(400).json({message: "Failed to fetch the bus datails", error: error.message})
  }
}

export {createBusController, getBusDetailController};
