import mongoose from 'mongoose';
 
const bookingSchema = new mongoose.Schema(
  {
   customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLocation',
      required: true,
      index: true,
    },
    customerName: { type: String, required: true },
    plateNumber: { type: String, required: true },
    type: {
      type: String,
      enum: ['2-WHEELER', '4-WHEELER'],
      required: true,
    },
    scheduledStartTime: { type: Date, required: true },
    scheduledEndTime: { type: Date, required: true },
    actualCheckIn: { type: Date, default: null },
    actualCheckOut: { type: Date, default: null },
    finalDeductedAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      required: true,
      default: 'CONFIRMED',
      index: true,
    },
    qrData: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);
 
// Compound indexes for common query patterns
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ locationId: 1, status: 1 });
bookingSchema.index({ scheduledStartTime: 1, scheduledEndTime: 1 });
bookingSchema.index({ plateNumber: 1, status: 1 });
 
const Booking = mongoose.model('Booking', bookingSchema);
 
export default Booking;
 