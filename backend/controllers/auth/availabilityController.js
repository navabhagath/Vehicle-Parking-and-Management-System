import User from "../../models/userModel.js";

/**
 * GET /auth/check-email?email=foo@bar.com
 * Returns { available: boolean }. No user data leaks beyond the existence flag.
 */
export const checkEmailAvailability = async (req, res, next) => {
  try {
    const email = (req.query.email || "").toString().toLowerCase().trim();
    if (!email) {
      return res
        .status(400)
        .json({ available: false, message: "Email is required" });
    }

    const exists = await User.exists({ email });
    return res.status(200).json({ available: !exists });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /auth/check-phone?phone=9876543210
 * Accepts either raw 10-digit or +91-prefixed format.
 */
export const checkPhoneAvailability = async (req, res, next) => {
  try {
    const raw = (req.query.phone || "").toString().trim();
    if (!raw) {
      return res
        .status(400)
        .json({ available: false, message: "Phone is required" });
    }

    const fullPhone = raw.startsWith("+91") ? raw : `+91${raw}`;
    const exists = await User.exists({ phone: fullPhone });
    return res.status(200).json({ available: !exists });
  } catch (error) {
    next(error);
  }
};