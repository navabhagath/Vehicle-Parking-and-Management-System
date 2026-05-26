import { Router } from "express";
import { createBooking, getBookings, getBookingsByStatus, getRecentBookings, updateBooking } from "../../controllers/customer/bookingController.js";


const router = Router();

router.post("/", createBooking); // POST   /api/customer/bookings
router.get("/", getBookings); // GET    /api/customer/bookings?customerId=&_page=&_limit=
router.get("/getBookingsByStatus", getBookingsByStatus); // GET    /api/customer/bookings/getBookingsByStatus?customerId=&status=
router.get("/recent", getRecentBookings); // GET    /api/customer/bookings/recent?customerId=&_page=&_limit=
router.patch("/:id", updateBooking); // PATCH  /api/customer/bookings/:id

export default router;
