import mongoose from "mongoose";
 
const ticketSchema = new mongoose.Schema({
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    handlerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        enum: ['CLAIM_MONEY', 'SUPPORT', 'DISPUTE'],
        required: true,
    },
    status: {
        type: String,
        enum: ['OPEN', 'IN_PROGRESS', 'APPROVED', 'REJECTED'],
        required: true,
        default: 'OPEN',
    },
    emailId: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true
});
 
const Ticket = mongoose.model("Ticket", ticketSchema);
 
export default Ticket;
 