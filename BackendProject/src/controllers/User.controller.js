import { asyncHandler } from "../utilities/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    console.log('Register user route hit');
    res.status(200).json({
        message: "ok"
    });
});

export { registerUser };
