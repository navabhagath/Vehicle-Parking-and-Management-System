import mongoose from "mongoose";
 
const transactionSchema = new mongoose.Schema({
   walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true,
    },
    type: {
        type: String,
        enum: ['RECHARGE', 'SENT', 'RECEIVE', 'DEDUCT', 'WITHDRAWAL'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED'],
        required: true,
    },
}, {
    timestamps: true
});
 
const Transaction = mongoose.model("Transaction", transactionSchema);
 
export default Transaction;
 