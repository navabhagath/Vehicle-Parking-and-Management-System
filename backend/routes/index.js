import { Router } from "express";
import authUserRoutes from "./auth/index.js";
import adminRoutes from "./admin/adminDashboardRoutes.js";
import customerRoutes from "./customer/index.js"
import bookingRoutes from "./booking/index.js"
import { verifyToken } from "../middlewares/authMiddleware.js";
const router = Router();

router.use("/auth",authUserRoutes );
router.use("/admin",adminRoutes);
router.use("/customer",customerRoutes);
router.use("/bookings",bookingRoutes);

export default router;