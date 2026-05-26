import express from "express";
import mongoose from "mongoose";
import Booking from "../../models/bookingModel.js";
import ParkingLocation from "../../models/parkingLocationModel.js";

export const getRevenueStats = async (req, res) => {
    const { locationId } = req.params;
    const vendorId = req.user.userId;

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
      // console.log(location);
      
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(),0,1);
        
      const result = await Booking.aggregate([
        {
          $match : {
            status : "COMPLETED",
            locationId : location,
            actualCheckOut : { $ne : null}
          }
        },
        {
          $facet : {
            today : [
              { $match : {actualCheckOut : {$gte : startOfToday}} },
              {$group : {_id : null, total : {$sum : "$finalDeductedAmount"}}}
            ],
            month : [
              {$match : {actualCheckOut : {$gte : startOfMonth}}},
              {$group : {_id : null, total : {$sum : "$finalDeductedAmount"}}}
            ],
            year : [
              {$match : {actualCheckOut : {$gte : startOfYear}}},
              {$group : {_id : null, total : {$sum : "$finalDeductedAmount"}}},
            ],
            total : [
              {$group : {_id : null, total : {$sum : "$finalDeductedAmount"}}}
            ]
          }
        }
      ]);
      const facets = result[0] || {};
      const pick = (stats) => ((stats && stats[0]) ? stats[0].total : 0 );
      return res.status(200).json({
        today : pick(facets.today),
        month : pick(facets.month),
        year : pick(facets.year),
        total : pick(facets.total)
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({message : "Failed to fetch Analytics. Internal Server Error"});
    }
}
