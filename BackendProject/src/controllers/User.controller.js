import { asyncHandler } from "../utilities/asyncHandler.js";
import {ApiError} from "../utilities/ApiError.js";
import {User} from "../models/User.js";
import {uploadOnCloudinary} from "../utilities/uploadOnCloudinary.js"
import {ApiResponse} from "../utilities/ApiResponse.js"
const registerUser = asyncHandler(async (req, res) => {
    //get user details from forntend
    //validation-not empty
    //check if user is already exist(check using email/username)
    //avatar check and images
    //upload to cloudinary,avatr
    //create user object - create entry in db
    //remove pass and refresh token field from response
    //Check for user creation
    //return res

    const {fullName,email,username,password}=req.body;
    console.log("email",email);

    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError("400,all fields are required")
    }
   const existedUser= User.findOne({
        $or: [{email}, {username}]
    })
    if(existedUser){
        throw new ApiError(409,"username or email already exist")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverimage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar is required")
    }

  const avatar=await uploadOnCloudinary(avatarLocalPath)
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)
 if(!avatar){
throw new ApiError(409,"avatar is required");
 }

 const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
    email,
    password,
    username:username.toLowerCase()
 })

const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
)

if(!createdUser){
    throw new ApiError(500,"user creation failed")
}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User registerred succesfully")
);
});

export { registerUser };
