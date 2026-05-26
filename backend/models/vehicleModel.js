import mongoose from 'mongoose';
 
const vehicleSchema = new mongoose.Schema(
  {
 userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: {
        values: ['2-WHEELER', '4-WHEELER'],
        message: '{VALUE} is not a supported vehicle type',
      },
      uppercase: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
 
// Remove 'next' from the arguments list
vehicleSchema.pre('save', async function () {
  if (this.isPrimary && (this.isNew || this.isModified('isPrimary'))) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isPrimary: false } }
    );
  }
  // When using an async function, you do NOT call next().
  // Mongoose proceeds when the function finishes execution.
});
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
 
export default Vehicle;
 