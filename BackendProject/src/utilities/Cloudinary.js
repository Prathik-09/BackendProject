import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.Cloudinary_Cloud_Name, 
        api_key: process.env.Cloudinary_Api_Key, 
        api_secret: process.env.Cloudinary_Api_Secret
    });

    const uploadOnCloudinary=async (localFilePath)=>{
        try{
            if(!localFilePath)
                return null;
            const response=await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
            })
            console.log("file is uploaded",response.url);
            return response;
        }
        catch(err){
            fs.unlinkSync(localFilePath);//removes the file where upload got fails
            return null;
        }
    }

    export {uploadOnCloudinary}