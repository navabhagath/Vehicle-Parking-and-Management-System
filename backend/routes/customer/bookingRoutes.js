import { Router } from "express";
import {
  getBookings,
  getBookingsByUser,
  getRecentBookings,
  getBookingById,
  getBookingsByStatus
} from "../../controllers/customer/bookingController.js";

const router = Router();

router.get("/recent", getRecentBookings);
router.get("/getBookingsByStatus", getBookingsByStatus);
router.get("/getBookingsByStatus", getBookings);
router.get("/:id", getBookingById);
router.get("", getBookingsByUser);
export default router;