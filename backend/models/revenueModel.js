// import mongoose from "mongoose";

// const revenueSchema = new mongoose.Schema({
//     vendor_id:{
//         type:String,
//         required:true,
//         index:true
//     },
//     credited_on:{
//         type:Date,
//         index:true,
//         required:true
//     },
//     amount:{
//         type:Number,
//         required:true,
//         default:150000
//     }
// },{
//     timestamps:true
// })

// const Revenue = mongoose.model("Revenue",revenueSchema);

// export default Revenue;

import mongoose from "mongoose";
 
const revenueSchema = new mongoose.Schema({
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lastReminderSentAt: { type: Date, default: null },
    credited_on:{
        type:Date,
        index:true,
        required:true
    },
    amount:{
        type:Number,
        required:true,
        default:150000
    }
},{
    timestamps:true
})
 
const Revenue = mongoose.model("Revenue",revenueSchema,"revenues");
 
export default Revenue;