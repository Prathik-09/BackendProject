import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { User } from "../models/User.js";
import { uploadOnCloudinary } from "../utilities/Cloudinary.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import fs from "fs";
const generateAccessTokenAndRefreshToken=async(userId)=>{
try{
    const user=User.findById(userId)
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();

    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken}
}
catch{
    throw new ApiError(500,"Something went wrong not generated tokens")
}
}
const registerUser = asyncHandler(async (req, res) => {
    // Extract user details from request body
    const { fullName, email, username, password } = req.body;
    // Validate fields
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existedUser) {
        throw new ApiError(409, "Username or email already exists");
    }

    // Define file paths from uploaded files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverimage[0]?.path;
let coverImageLocalPath;
if(req.files&&Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0){
    coverImageLocalPath = req.files.coverImage[0].path;
}
    // Validate the avatar file path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath && fs.existsSync(coverImageLocalPath) 
        ? await uploadOnCloudinary(coverImageLocalPath) 
        : null;

    // Ensure avatar upload was successful
    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    // Create user
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // Retrieve the created user without sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    // Respond with the created user
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    
    if (!user) {
        throw new ApiError(400, "User does not exist");
    }

    const isPassWordValid = await user.isPasswordCorrect(password);
    
    if (!isPassWordValid) {
        throw new ApiError(401, "Password incorrect");
    }
    
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken,
            message: "User logged in successfully"
        }));
});

const logoutUser=asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",)
})

export { registerUser,loginUser,logoutUser };
