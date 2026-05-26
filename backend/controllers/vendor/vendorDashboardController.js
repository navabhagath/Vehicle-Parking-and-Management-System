import mongoose from "mongoose";
import ParkingLocation from '../../models/parkingLocationModel.js'
import Booking from "../../models/bookingModel.js";

export const getVendorDashboard = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    // console.log(vendorId);
    const locations = await ParkingLocation.find({ vendorId }).lean().exec();
    // console.log(locations);
    if (locations.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          locations: [],
          occupancyMap: {},
          activeCount: 0,
          totalSlots: 0,
          totalOccupied: 0,
        },
      });
    }
    const locationIds = locations.map((loc) => loc._id);
    // console.log(locationIds);
    
    const occupancyAgg = await Booking.aggregate([
      {
        $match: {
          locationId: { $in: locationIds },
          status : "ACTIVE"
        },
      },
      {
        $group: {
          _id: "$locationId",
          count: { $sum: 1 },
        },
      },
    ]).exec();
    
    
    const occupancyMap = {};
    for (const entry of occupancyAgg) {
      occupancyMap[entry._id.toString()] = entry.count;
    }

    // console.log(occupancyMap);
    

    const activeCount = locations.filter(
      (l) => l.isActive && l.approvalStatus === "APPROVED",
    ).length;

    const totalSlots = locations.reduce(
      (sum, l) => sum + (l.capacity?.twoWheeler || 0) + (l.capacity?.fourWheeler || 0),0);

    const totalOccupied = Object.values(occupancyMap).reduce( (sum, v) => sum + v, 0);

    const cleanedLocations = locations.map((loc) => ({ 
      ...loc,
      id: loc._id.toString(),
    }));

    return res.status(200).json({
      success: true,
      data: {
        locations: cleanedLocations,
        occupancyMap,
        activeCount,
        totalSlots,
        totalOccupied,
      },
    });
  } catch (error) {
    next(error);
  }
};
