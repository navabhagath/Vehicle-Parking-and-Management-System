import express from 'express';
import { getDashboardStats } from "../../controllers/admin/adminDashboardController.js";
import { getRevenue } from "../../controllers/admin/adminRevenueController.js";
import { sendReminderEmail } from "../../controllers/admin/adminRevenueController.js";
import { getVendorManagementDetails, updateVendorStatus } from "../../controllers/admin/adminVendorController.js";
import ParkingLocation from "../../models/parkingLocationModel.js"; 


const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/getRevenue",getRevenue)
router.post("/send-reminder", sendReminderEmail);
router.get("/vendor-management", getVendorManagementDetails);

router.patch('/update-status/:locationId', updateVendorStatus);

export default router;


