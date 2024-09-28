import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { User } from "../models/User.js";
import { uploadOnCloudinary } from "../utilities/Cloudinary.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import fs from "fs";
import { verifyJwt } from "../middlewares/auth.middileware.js";
const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        // Await the user query
        const user = await User.findById(userId);
        
        // Check if user exists
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Generate tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        // Log the error for debugging
        console.error("Token generation error:", error);
        throw new ApiError(500, "Something went wrong, tokens not generated");
    }
};

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

const logoutUser = asyncHandler(async (req, res) => {
   

    // Remove the refresh token from the user
    await User.findByIdAndUpdate(
        req.user._id, {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true, // This option returns the modified document
            runValidators: true // Optionally enforce validation rules
        }
    ).catch(err => {
        console.error("Error updating user:", err);
        throw new ApiError(500, "Failed to log out, please try again");
    });

    // Define cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Ensure secure in production
        sameSite: 'Strict' // Adjust based on your needs
    };

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options) // Ensure you include options
        .json({ message: "Logged out successfully" }); // Respond with a success message
});

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingrefreshToken=req.cookies.refreshToken||req.body.refreshToken;
    if(!incomingrefreshToken){
        throw new ApiError(401,"unauthorizes request");
    }
    try{
        const decodedToken=jwt.verify( 
            incomingrefreshToken,
            process.env.REFRESH_TOKEN_SECRET
    )
    
    const user=User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401,"invalid refresh token");
    }
    if(incomingrefreshToken!==user?.refreshToken){
        throw new ApiError(401,"refresh token is expired or used");
    }
    
         const options={
            httpOnly:true,
            secure:true
         }
        const {accessToken,newrefreshToken}=await generateAccessTokenAndRefreshToken(user._id)
        .status(200)
        .cookie("accesstoken",accessToken,options)
        .cookie("refreshtoken",newrefreshToken,options)
        .json(
            new ApiResponse(200,{
                accessToken,
                newrefreshToken,
                message:"Access token refreshed successfully"
            })
        )
    }
    catch(error){
        throw new ApiError(401,"invalid refreh token");
    }
});


export { registerUser,loginUser,logoutUser,refreshAccessToken};
