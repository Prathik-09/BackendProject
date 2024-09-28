import { Router } from "express";
import { loginUser, registerUser,logoutUser, refreshAccessToken} from "../controllers/User.controller.js";
import {upload} from "../middlewares/Multer.js";
import { verifyJwt } from "../middlewares/auth.middileware.js";
const router = Router();;

// Define the route for registration
router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxcount:1
    },{
        name:"coverimage",
        maxcount:1
    }
]),registerUser);
router.post("/login",loginUser)
router.post("/logout", verifyJwt, logoutUser);
router.post("/refreshtoken",refreshAccessToken)
export default router;
