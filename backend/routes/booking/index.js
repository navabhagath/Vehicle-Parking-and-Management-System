import { Router } from "express";
import bookingRoutes from "./bookingRoutes.js";
import gatepassRoutes from "./gatepassRoutes.js";
import parkingLocationRoutes from "./parkingLocationRoutes.js";
import vehicleRoutes from "./vehicleRoutes.js";
import walletRoutes from "./walletRoutes.js";

const router = Router();

router.use("", bookingRoutes);
router.use("/gatepass", gatepassRoutes);
router.use("/locations", parkingLocationRoutes);
router.use("/vehicle", vehicleRoutes);
router.use("/wallet", walletRoutes);

export default router;
