import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../models/userModel.js";
import Wallet from "../../models/walletModel.js";
import Revenue from "../../models/revenueModel.js";
import Otp from "../../models/otpModel.js";

const DEFAULT_VENDOR_PERMISSIONS = [
  "create_location",
  "view_analytics",
  "manage_bookings",
  "manage_tickets",
  "withdraw_wallet",
];

export const vendorRegistration = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .send({ message: "Name,email,phone,password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .send({ message: "Password must be alteast 8 characters long" });
    }

    const normalisedEmail = email.toLowerCase().trim();
    const fullPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

    const existing = await User.findOne({
      $or: [{ email: normalisedEmail }, { phone: fullPhone }],
    });

    if (existing) {
      if (existing.email === normalisedEmail)
        return res.status(409).send({ message: "email already exists" });
      else return res.status(409).send({ message: "Phone already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      name: name,
      email: normalisedEmail,
      phone: fullPhone,
      password_hash: passwordHash,
      role: "VENDOR",
      accountStatus: "ACTIVE",
      isVerified: true,
      hasPaidSubscription: true,
      permissions: DEFAULT_VENDOR_PERMISSIONS,
    });

    const createdWallet = await Wallet.create({
      userId: createdUser._id,
      balance: 0,
    });

    const createdRevenue = await Revenue.create({
      vendorId: createdUser._id,
      credited_on: new Date(),
      amount: 150000,
    });

    // toJSON transform on the schema strips password_hash automatically
    return res.status(201).json({
      success: true,
      message: "Vendor registration Successfull",
      data: {
        user: createdUser,
        wallet: createdWallet,
        revenue: createdRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginByRole = async (req, res, next, role) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: "Email and password required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: role,
    }).select("+password_hash");

    if (!user) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    
    if (user.accountStatus === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is suspended. Please check your email for details on how to reactivate.",
        code: "ACCOUNT_SUSPENDED",
      });
    }

    if (user.accountStatus === "QUIT") {
      return res.status(403).json({
        success: false,
        message: "This account is closed.",
        code: "ACCOUNT_CLOSED",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        permissions: user.permissions || [],
      },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );

    
    user.password_hash = undefined;

    return res.status(200).json({
      success: true,
      message: "Login Successfull",
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};

export const vendorLogin = (req, res, next) =>
  loginByRole(req, res, next, "VENDOR");
export const adminLogin = (req, res, next) =>
  loginByRole(req, res, next, "SUPER_ADMIN");

export const customerVerifyAndLogin = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP are required" });
    }

    const fullPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

    const validOtpRecord = await Otp.findOne({
      identifier: fullPhone,
      otp: otp,
    });

    if (!validOtpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    await Otp.deleteOne({ _id: validOtpRecord._id });

    let user = await User.findOne({
      phone: fullPhone,
      role: "CUSTOMER",
    });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;

      user = await User.create({
        phone: fullPhone,
        name: "New Customer",
        role: "CUSTOMER",
        isVerified: true,
        accountStatus: "ACTIVE",
      });

      await Wallet.create({
        userId: user._id,
        balance: 0,
      });
    } else {
      // Existing customer — make sure their account isn't suspended.
      if (user.accountStatus === "SUSPENDED") {
        return res.status(403).json({
          success: false,
          message:
            "Your account is suspended. Please check your email for details on how to reactivate.",
          code: "ACCOUNT_SUSPENDED",
        });
      }

      if (user.accountStatus === "QUIT") {
        return res.status(403).json({
          success: false,
          message: "This account is closed.",
          code: "ACCOUNT_CLOSED",
        });
      }
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        permissions: user.permissions || [],
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      success: true,
      message: "Verified successfully",
      data: { token, user, isNewUser },
    });
  } catch (error) {
    next(error);
  }
};


export const verifyPasswordResetOtp = async (req, res, next) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and role are required.",
      });
    }

    if (!["VENDOR", "SUPER_ADMIN"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role." });
    }

    const normalisedEmail = email.toLowerCase().trim();

    // Identifier is scoped by role — a vendor OTP can't satisfy an admin
    // reset and vice versa, even if both happen to share an email somehow.
    const identifier = `${role}:${normalisedEmail}`;

    const validOtpRecord = await Otp.findOne({
      identifier: identifier,
      otp: otp,
    });

    if (!validOtpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP." });
    }

    await Otp.deleteOne({ _id: validOtpRecord._id });

    // Bake the role into the reset token so the final reset step can't be
    // tricked into updating a user of a different role.
    const resetToken = jwt.sign(
      { email: normalisedEmail, role, purpose: "PASSWORD_RESET" },
      process.env.SECRET_KEY,
      { expiresIn: "15m" },
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. Proceed to reset password.",
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

export const resetUserPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    const incomingPassword = newPassword || req.body.password;

    if (!resetToken || !incomingPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please request a new OTP.",
      });
    }

    if (decoded.purpose !== "PASSWORD_RESET") {
      return res
        .status(403)
        .json({ success: false, message: "Invalid token type." });
    }

    // Token must carry a role; older tokens without one are no longer valid.
    if (!decoded.role || !["VENDOR", "SUPER_ADMIN"].includes(decoded.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid token." });
    }

    // Scope the user lookup by role — the token can ONLY reset a user of
    // the role it was issued for.
    const user = await User.findOne({
      email: decoded.email,
      role: decoded.role,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(incomingPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    next(error);
  }
};
 