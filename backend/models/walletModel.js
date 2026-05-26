import mongoose from "mongoose";
 
const walletSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    balance:{
        type:Number,
        required:true,
        default:0,
    }
},{
    timestamps:true
})
 
const Wallet = mongoose.model("Wallet",walletSchema)
 
export default Wallet;
 
 
 