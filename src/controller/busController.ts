import {Request, Response} from "express";
import { uploadMultipleToCloudinary } from "../utils/uploadAssets";

const createBusController = async (req: Request, res: Response) => {
  try {
    console.log("req.body form the createBusController", req.body);

    let busImages: string[] = []
    if (req.files && Array.isArray(req.files)) {
      console.log("Uploaded files:", req.files);
      req.files.forEach((file, index) => {
        console.log(`File ${index + 1}:`, {
          originalname: file.originalname,
          mimetype: file.mimetype,      
          size: file.size,
        });
      });

    const uploadedImageUrls = await uploadMultipleToCloudinary(req.files, {
            folder: "Mybus/mybusimages",
            resource_type: "image",
          });
          console.log("files uploaded!!!!!!!!!!!!!!!!!!!", uploadedImageUrls);
           busImages = uploadedImageUrls;
    } else {
      console.log("⚠️ No files uploaded!");
    }
    console.log("check the image that uploaded in cloudianry", busImages)
    res.status(200).json({message: "Successfully create the bus"});
  } catch (error: any) {
    res
      .status(400)
      .json({message: "Failed to create the bus", error: error.message});
  }
};

export {createBusController};
