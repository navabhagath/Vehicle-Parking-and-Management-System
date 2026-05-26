import Router from "express";

// 1. Core Auth Logic
import {
  vendorRegistration,
  vendorLogin,
  adminLogin,
  customerVerifyAndLogin,
  verifyPasswordResetOtp,
  resetUserPassword,
} from "../../controllers/auth/authController.js";

// 2. OTP Delivery Logic
import {
  customerRequestOtp,
  requestPasswordResetOtp,
} from "../../controllers/auth/otpController.js";

//availability checks
import {
  checkEmailAvailability,
  checkPhoneAvailability,
} from "../../controllers/auth/availabilityController.js";

const router = Router();

// --- Vendor & Admin Routes ---
router.post("/vendor/register", vendorRegistration);
router.post("/vendor/login", vendorLogin);
router.post("/forgot-password", requestPasswordResetOtp);
router.post("/verify-reset-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetUserPassword);

router.post("/super_admin/login", adminLogin);

// --- Customer Routes ---
router.post("/customer/request-otp", customerRequestOtp);
router.post("/customer/verify-otp", customerVerifyAndLogin);

// --- Public availability checks (used by registration forms) ---
router.get("/check-email", checkEmailAvailability);
router.get("/check-phone", checkPhoneAvailability);

export default router;