import { Router } from "express";
import { registerUser } from "../controllers/User.controller.js";

const router = Router();

// Define the route for registration
router.route("/register").post(registerUser);

export default router;
