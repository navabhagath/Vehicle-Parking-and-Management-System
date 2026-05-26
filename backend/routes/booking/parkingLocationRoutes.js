import { Router } from "express";
import {
  getAllLocations,
  getLocationById,
} from "../../controllers/customer/parkingLocationController.js";

const router = Router();

router.get("", getAllLocations);
router.get("/getLocationById/:id", getLocationById);

export default router;
