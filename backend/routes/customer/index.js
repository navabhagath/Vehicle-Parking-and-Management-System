import { Router } from "express";
import VehicleRoutes from "./vehicleRoutes.js";
import walletRoutes from "./walletRoutes.js";
import parkingLocationRoutes from "./locationRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import ticketRoutes from "./ticketRoutes.js";
import userRoutes from "./userRoutes.js";
const router = Router();

router.use("/vehicle", VehicleRoutes);
router.use("/wallet", walletRoutes);
router.use("/locations", parkingLocationRoutes);
router.use("/bookings", bookingRoutes);
router.use("/transactions", transactionRoutes);
router.use("/tickets", ticketRoutes);
router.use("/users",userRoutes)
export default router;
