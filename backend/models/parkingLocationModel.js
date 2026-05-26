// import mongoose from 'mongoose';

// const parkingLocationSchema = new mongoose.Schema(
//   {
//     vendorId: { type: String, required: true, index: true },
//     locationName: { type: String, required: true },
//     isActive: { type: Boolean, required: true, default: false },
//     geo: {
//       type: { type: String, enum: ['Point'], required: true, default: 'Point' },
//       coordinates: {
//         type: [Number], 
//         required: true,
//         validate: {
//           validator: (coords) => coords.length === 2,
//           message: 'Coordinates must be [longitude, latitude]',
//         },
//       },
//     },
//     operationalDays: {
//       type: [String],
//       enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
//       required: true,
//     },
//     operationalHours: {
//       start: { type: String, required: true }, // e.g. "08:00"
//       end: { type: String, required: true },   // e.g. "22:00"
//     },
//     capacity: {
//       twoWheeler: { type: Number, required: true, min: 0 },
//       fourWheeler: { type: Number, required: true, min: 0 },
//     },
//     bikePrice: { type: Number, required: true, min: 0 },
//     carPrice: { type: Number, required: true, min: 0 },
//     amenities: { type: [String], default: [] },
//     documents: {
//       type: Map,
//       of: String,
//       default: {},
//     },
//     approvalStatus: {
//       type: String,
//       enum: ['PENDING', 'APPROVED', 'REJECTED'],
//       required: true,
//       default: 'PENDING',
//       index: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// parkingLocationSchema.index({ vendorId: 1, approvalStatus: 1 });
// parkingLocationSchema.index({ isActive: 1, approvalStatus: 1 });

// const ParkingLocation = mongoose.model('ParkingLocation', parkingLocationSchema);

// export default ParkingLocation;


import mongoose from "mongoose";

const parkingLocationSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    locationName: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: false },
    geo: {
      type: { type: String, enum: ["Point"], required: true, default: "Point" },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coords) => coords.length === 2,
          message: "Coordinates must be [longitude, latitude]",
        },
      },
    },
    operationalDays: {
      type: [String],
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      required: true,
    },
    operationalHours: {
      start: { type: String, required: true }, // e.g. "08:00"
      end: { type: String, required: true }, // e.g. "22:00"
    },
    capacity: {
      twoWheeler: { type: Number, required: true, min: 0 },
      fourWheeler: { type: Number, required: true, min: 0 },
    },
    bikePrice: { type: Number, required: true, min: 0 },
    carPrice: { type: Number, required: true, min: 0 },
    amenities: { type: [String], default: [] },
    documents: {
      type: Map,
      of: String,
      default: {},
    },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      required: true,
      default: "PENDING",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

parkingLocationSchema.index({ vendorId: 1, approvalStatus: 1 });
parkingLocationSchema.index({ isActive: 1, approvalStatus: 1 });

parkingLocationSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

const ParkingLocation = mongoose.model(
  "ParkingLocation",
  parkingLocationSchema,
  "parkinglocations"
);

export default ParkingLocation;
