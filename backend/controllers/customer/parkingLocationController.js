import mongoose from "mongoose";
import ParkingLocation from "../../models/parkingLocationModel.js";


const formatLocation = (loc) => {
  if (!loc) return null;
  const obj = loc.toObject ? loc.toObject() : loc;

  let documents = {};
  if (obj.documents instanceof Map) {
    documents = Object.fromEntries(obj.documents);
  } else if (obj.documents && typeof obj.documents === "object") {
    documents = obj.documents;
  }
  return {
    id: obj._id.toString(),
    vendorId: obj.vendorId.toString(),
    locationName: obj.locationName,
    isActive: obj.isActive,
    geo: {
      type: obj.geo?.type,
      coordinates: obj.geo?.coordinates ?? [],
    },
    operationalDays: obj.operationalDays ?? [],
    operationalHours: {
      start: obj.operationalHours?.start,
      end: obj.operationalHours?.end,
    },
    capacity: {
      twoWheeler: obj.capacity?.twoWheeler ?? 0,
      fourWheeler: obj.capacity?.fourWheeler ?? 0,
    },
    bikePrice: obj.bikePrice,
    carPrice: obj.carPrice,
    amenities: obj.amenities ?? [],
    documents,
    approvalStatus: obj.approvalStatus,
  };
};

export const getAllLocations = async (req, res) => {
  try {
    const locations = await ParkingLocation.find({
        approvalStatus:"APPROVED",
        isActive:true,
    }).sort({locationName : 1});
    return res.status(200).json(locations.map(formatLocation));
  } catch (err) {
    console.error("getAllLocations error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /parkinglocations/:id
 */
export const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("getLocationById called with id:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid location id" });
    }

    const location = await ParkingLocation.findById(id);
    if (!location) {
      return res.status(404).json({ message: "Parking location not found" });
    }

    console.log("Location found:", location);

    return res.status(200).json(formatLocation(location));
  } catch (err) {
    console.error("getLocationById error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};