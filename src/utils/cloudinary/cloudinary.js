import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Upload an image
const uploadFileOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return "cannot find a path";

    //uplaod the file on cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //file has been uplaoded sucessfully
    console.log(
      "file on uploaded on cloudinary successfully",
      uploadResult.url
    );
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved tempoary file as the uplaod operation got  failed
  }
};

export {uploadFileOnCloudinary};
