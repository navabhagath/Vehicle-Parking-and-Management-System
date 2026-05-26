import mongoose from "mongoose";
import User from "../../models/userModel.js";

const formatUser = (u) => {
  if (!u) return null;
  const obj = u.toObject ? u.toObject() : u;
  return {
    id: obj._id.toString(),
    name: obj.name,
    role: obj.role,
    email: obj.email,
    phone: obj.phone,
    accountStatus: obj.accountStatus,
    isVerified: obj.isVerified,
    hasPaidSubscription: obj.hasPaidSubscription,
    permissions: obj.permissions ?? [],
  };
};

/**
 * GET /user?role=SUPER_ADMIN
 * Returns users filtered by role as an array.
 */
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = {};
    if (role) {
      const validRoles = ["SUPER_ADMIN", "VENDOR", "CUSTOMER"];
      if (!validRoles.includes(role.toUpperCase())) {
        return res
          .status(400)
          .json({ message: `role must be one of: ${validRoles.join(", ")}` });
      }
      filter.role = role.toUpperCase();
    }

    const users = await User.find(filter).lean();

    return res.status(200).json(users.map((u) => formatUser(u)));
  } catch (err) {
    console.error("getUsersByRole error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
