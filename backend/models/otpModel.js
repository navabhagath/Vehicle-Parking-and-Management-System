import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  // 'identifier' holds either the phone number or the vendor email
  identifier: {
    type: String,
    required: [true, 'Identifier is required'],
    index: true, // Indexes this field for super-fast lookups during verification
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // MongoDB will automatically delete this document 300 seconds (5 minutes) after it's created.
    expires: 300 
  }
});

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;