import { cloudinary, configureCloudinary } from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";

interface UploadOptions {
  folder: string;
  width?: number;
  height?: number;
  quality?: string | number;
  crop?: string;
  resource_type?: "image" | "raw" | "auto";
}

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  options: UploadOptions
): Promise<string> => {
  try {
    configureCloudinary(); 

    const {
      folder,
      width,
      height,
      quality = "90",
      crop = "scale",
      resource_type = "auto",
    } = options;

    const uploadOptions: any = {
      folder,
      resource_type,
      fetch_format: "auto",
    };

    if (width || height || quality || crop) {
      uploadOptions.transformation = [
        {
          ...(width && { width }),
          ...(height && { height }),
          ...(quality && { quality }),
          ...(crop && { crop }),
        },
      ];
    }

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          if (result) return resolve(result);
          reject(new Error("UploadApiResponse is undefined"));
        }
      );

      stream.end(file.buffer);
    });

    return result.secure_url;
  } catch (error) {
    console.error(
      `Error uploading to Cloudinary (folder: ${options.folder}):`,
      error
    );
    throw new Error("Failed to upload file to Cloudinary");
  }
};


export const uploadMultipleToCloudinary = async (
  files: Express.Multer.File[],
  options: UploadOptions
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file, options)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error(
      `Error uploading multiple files to Cloudinary (folder: ${options.folder}):`,
      error
    );
    throw new Error("Failed to upload multiple files to Cloudinary");
  }
};


export const deleteFromCloudinary = async (url: string): Promise<void> => {
  try {
    configureCloudinary();

    const publicId = url.split("/").pop()?.split(".")[0];
    if (!publicId) throw new Error("Invalid image URL");

    const folder = url.includes("avatars")
      ? "Mybus/avatars"
      : "Mybus/mybusimages";

    await cloudinary.uploader.destroy(`${folder}/${publicId}`, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete file from Cloudinary");
  }
};
