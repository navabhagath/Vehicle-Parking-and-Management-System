import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["SUPER_ADMIN", "VENDOR", "CUSTOMER"],
        message: "{VALUE} is not a valid role",
      },
      uppercase: true,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^\+91[6-9]\d{9}$/, "Please provide a valid phone number"],
    },
    password_hash: {
      type: String,
      default: null,
      select: false,
    },
    accountStatus: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "QUIT"],
      default: "ACTIVE",
      uppercase: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    hasPaidSubscription: {
      type: Boolean,
      default: false,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    // virtuals: true exposes Mongoose's built-in `id` virtual (string form of
    // _id) in JSON output. We then strip _id and __v so the frontend sees a
    // clean { id, name, email, ... } shape matching its User model.
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        delete ret.password_hash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        delete ret.password_hash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Partial unique index on email — only enforces uniqueness for documents
// where email is a string (vendors/admins). Customers with email: null
// are excluded from the index, so they don't collide with each other.
userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $type: "string" } },
  },
);

const User = mongoose.model("User", userSchema);

export default User;
