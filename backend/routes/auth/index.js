import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();


router.use("/users",userRoutes)

export default router;