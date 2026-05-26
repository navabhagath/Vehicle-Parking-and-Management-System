import express from 'express';
import mongoose from 'mongoose'
import Booking from "../../models/bookingModel.js";
import ParkingLocation from "../../models/parkingLocationModel.js";

export const getRevenueBar = async(req,res) => {
    const {locationId} = req.params;
    const {range} = req.query;
    const vendorId = req.user.userId;

    if(!mongoose.Types.ObjectId.isValid(locationId)){
        return res.status(400).json({message : "Invalid Location Id"});
    }
    const validRanges = ['week','month','year'];
    if(!range || !validRanges.includes(range)){
        return res.status(400).json({
            message : "Invalid Query Parameters"
        });
    }
    try {
        const ownsLocation = await ParkingLocation.exists({
            _id: locationId,
            vendorId: vendorId,
        });

        if (!ownsLocation) {
        return res.status(404).json({ message: "Location not found" });
        }
        const location = new mongoose.Types.ObjectId(locationId);
        const now = new Date();

        let startDate;
        if(range === 'week'){
            startDate = new Date(now.getFullYear(),now.getMonth(),now.getDate() - 6);
        }else if(range === 'month'){
            startDate = new Date(now.getFullYear(), now.getMonth()-11,1);
        }else{
            startDate = new Date(now.getFullYear()-2,0,1);
        }

        const unitMap = { week: "day", month: "month", year: "year" };
        const result = await Booking.aggregate([
            {
                $match: {
                locationId: location,
                status: "COMPLETED",
                actualCheckOut: { $gte: startDate },
                },
            },
            {
                $group: {
                _id: {
                    $dateTrunc: { date: "$actualCheckOut", unit: unitMap[range] },
                },
                total: { $sum: "$finalDeductedAmount" },
                },
            },
        ]);
 
        const labels = buildLabels(range, now);
        const data = new Array(labels.length).fill(0);
    
        for (const g of result) {
            const ind = findIndex(range, g._id, now);
            if (ind >= 0 && ind < data.length) {
                data[ind] = g.total;
            }
        }
 
        return res.status(200).json({ labels, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message : "Internal Server Error"
        });
    }

    
}

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildLabels(range,now){
    const labels = [];
    if(range === 'week'){
        for(let i=6;i>=0;i--){
            const d = new Date(now.getFullYear(),now.getMonth(),now.getDate() - i);
            labels.push(`${DAYS[d.getDay()]} ${d.getDate()}`);
        }
    }else if(range === 'month'){
        for(let i=11;i>=0;i--){
            const d = new Date(now.getFullYear(),now.getMonth()-i,1);
            labels.push(`${MONTHS[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`);
        }
    }else{
        for(let i=2;i>=0;i--){
            labels.push((now.getFullYear() - i).toString());
        }
    }
    return labels;
}

function findIndex(range, checkoutDate, now) {
  const d = new Date(checkoutDate);
//   console.log("d",d);
  
  if (range === "week") {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // console.log("today",today);
    
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    // console.log("day",day);
    
    const diffDays = Math.round((today - day) / (1000 * 60 * 60 * 24));
    return 6 - diffDays; 
  }
 
  if (range === "month") {
    const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    return 11 - diffMonths;
  }

  const diffYears = now.getFullYear() - d.getFullYear();
  return 2 - diffYears;
}