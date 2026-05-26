import express from "express";
import Booking from "../../models/bookingModel.js";
import ParkingLocation from "../../models/parkingLocationModel.js";
import mongoose from "mongoose";

export const getVehiclePie = async (req, res) => {
  const { locationId } = req.params;
  const { period } = req.query;
  const vendorId = req.user.userId;

  if(!mongoose.Types.ObjectId.isValid(locationId)){
    return res.status(400).json({message : "Invalid Location Id"})
  }

  const valid = ['today','last7','last15','last30'];
  if(!period || !valid.includes(period)){
    return res.status(400).json({
        message : "Invalid Query Parameter"
    })
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
    let cutoff;
    if(period === 'today'){
        cutoff = new Date(now.getFullYear(),now.getMonth(),now.getDate());
    }else{
        const days = { last7: 7, last15: 15, last30: 30 };
        cutoff = new Date(now.getFullYear(),now.getMonth(),now.getDate() - days[period]);
    }
    const result = await Booking.aggregate([
        {
          $match : {
            locationId : location,
            status : "COMPLETED",
            actualCheckOut : {$gte : cutoff},
          }
        },
        {
          $group : {
            _id : "$type",
            revenue : {$sum : "$finalDeductedAmount"},
            count : {$sum : 1}
          }
        }
    ]);
    const twoWheeler = result.find((v) => v._id === '2-WHEELER');
    const fourWheeler = result.find((v) => v._id === '4-WHEELER');

    return res.status(200).json({
      twoWheelerRev : twoWheeler?.revenue ?? 0,
      twoWheelerCount : twoWheeler?.count ?? 0,
      fourWheelerRev : fourWheeler?.revenue ?? 0,
      fourWheelerCount : fourWheeler?.count ?? 0
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message : "Internal Server error"
    })
  }
};
