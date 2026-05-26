import User from "../../models/userModel.js";
import Otp from "../../models/otpModel.js";
import otpgenerator from "otp-generator";
import { sendOtpSms } from "../../services/smsService.js";
import { sendOtpEmail } from "../../services/emailService.js";

const generateOtp = () => {
  return otpgenerator.generate(4, {
    specialChars: false,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
  });
};

const isProd = () => process.env.NODE_ENV === "production";

/**
* Helper: tries to send via the given dispatch function. In production,
* a failure means we must abort (user got no OTP, telling them "OTP sent"
* would be a lie). In non-production we log the failure and continue,
* because the devCode in the response is enough for local testing.
*/
const dispatchOrFail = async (sendFn, label) => {
  try {
    await sendFn();
    return { delivered: true };
  } catch (error) {
    console.error(`[${label}] delivery failed:`, error.message);
    if (isProd()) throw error;
    return { delivered: false, devError: error.message };
  }
};

// CUSTOMER REQUEST OTP (SMS via Twilio)
export const customerRequestOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone.replace("+91", ""))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid phone number" });
    }

    const fullPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

    await Otp.deleteMany({ identifier: fullPhone });
    const otp = generateOtp();

    await Otp.create({
      identifier: fullPhone,
      otp: otp,
    });

    await dispatchOrFail(() => sendOtpSms(fullPhone, otp), "SMS");

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      ...(!isProd() && { devCode: otp }),
    });
  } catch (error) {
    next(error);
  }
};

// VENDOR/ADMIN: REQUEST PASSWORD RESET (Email via Nodemailer)
export const requestPasswordResetOtp = async (req, res, next) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res
        .status(400)
        .json({ success: false, message: "Email and role are required" });
    }

    if (!["VENDOR", "SUPER_ADMIN"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role" });
    }

    const normalisedEmail = email.toLowerCase().trim();

    // Strict role-scoped lookup — a vendor cannot trigger a reset against
    // a super-admin email and vice versa.
    const user = await User.findOne({
      email: normalisedEmail,
      role: role,
    });

    // Strict mode: surface a clear error when no matching account exists
    // for this role. This intentionally trades enumeration resistance for
    // a clearer UX, per product decision.
    if (!user) {
      const label = role === "VENDOR" ? "vendor" : "admin";
      return res.status(404).json({
        success: false,
        message: `No ${label} account found with this email.`,
      });
    }

    // Encode role into the identifier so the verify step is scoped to the
    // same role this OTP was issued for.
    const identifier = `${role}:${normalisedEmail}`;

    await Otp.deleteMany({ identifier });
    const otp = generateOtp();

    await Otp.create({
      identifier: identifier,
      otp: otp,
    });

    await dispatchOrFail(() => sendOtpEmail(normalisedEmail, otp), "EMAIL");

    return res.status(200).json({
      success: true,
      message: "OTP sent to registered email.",
      ...(!isProd() && { devCode: otp }),
    });
  } catch (error) {
    next(error);
  }
};