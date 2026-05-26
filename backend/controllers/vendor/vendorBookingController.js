import express from "express";
import Booking from "../../models/bookingModel.js";
import ParkingLocation from "../../models/parkingLocationModel.js";
import mongoose from "mongoose";

export const getBookings = async (req, res) => {
  const { locationId } = req.params;
  const { type } = req.query; 
  const vendorId = req.user.userId

  if (!mongoose.Types.ObjectId.isValid(locationId)) {
    return res.status(400).json({ message: "Invalid location ID" });
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
    let filter;
    if(type === "current") {
      filter = { 
        locationId: location,
        status : "ACTIVE"
      };
    }else if(type === "overstayed"){
      filter = {
        locationId: location,
        status : "ACTIVE",
        actualCheckIn: { $ne: null },
        actualCheckOut: null,
        scheduledEndTime: { $lt: new Date() },
      }
    }

    const bookings = await Booking.find(filter).sort({ actualCheckIn: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
