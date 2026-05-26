import { Router } from "express";
import {
  addVehicle,
  deleteVehicle,
  getVehicleById,
  getVehicleController,
  updateVehicle,
} from "../../controllers/customer/vehicleController.js";

const router = Router();

router.get("/", getVehicleController); // GET /api/vehicle?userId=
router.get("/:vehicleId", getVehicleById); // GET /api/vehicle/:vehicleId

router.post("/", addVehicle);

router.patch("/:id", updateVehicle);

router.delete("/:id", deleteVehicle);

export default router;
