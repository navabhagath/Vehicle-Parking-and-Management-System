import { Router } from "express";
import {
  getBookingById,
  checkIn,
  checkOut,
} from "../../controllers/vendor/gatepassController.js";

const router = Router();

router.get("/:bookingId/:locationId", getBookingById);
router.patch("/checkin/:bookingId/:locationId", checkIn);
router.post("/checkout", checkOut);

export default router;