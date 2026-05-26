import express from "express";
import ParkingLocation from "../../models/parkingLocationModel.js";
import Booking from "../../models/bookingModel.js";
import mongoose from "mongoose";

export const getOverviewData = async (req, res) => {
  try {
    const { locationId } = req.params; 
    const vendorId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      return res.status(400).json({ message: "Invalid location ID" });
    }

    const location = await ParkingLocation.findOne({
      _id: locationId,
      vendorId: vendorId,
    });
    
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    const total = location.capacity.twoWheeler + location.capacity.fourWheeler;

    const [aggregate] = await Booking.aggregate([
      {
        $match: {
          locationId: new mongoose.Types.ObjectId(locationId), 
          status: "ACTIVE",
        },
      },
      {
        $facet: {
          occupied: [{ $count: "count" }],
          recentParking: [
            {
              $match: {
                actualCheckIn: { $ne: null },
              },
            },
            {
              $sort: {
                actualCheckIn: -1,
              },
            },
            {
              $limit: 5,
            },
            {
              $project: {
                _id: 0,
                plateNumber: 1,
                customerName: 1,
                vehicleType: {
                  $cond: [{ $eq: ["$type", "2-WHEELER"] }, "Bike", "Car"],
                },
                checkInTime: {
                  $dateToString: {
                    format: "%H:%M",
                    date: "$actualCheckIn",
                    timezone: "Asia/Kolkata",
                  },
                },
              },
            },
          ],
        },
      },
    ]);
    const occupied = aggregate.occupied[0]?.count || 0;
    const slotSummary = { total, occupied, free: total - occupied }; 

    res.status(200).json({
      location,
      slotSummary,
      recentParking: aggregate.recentParking,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};