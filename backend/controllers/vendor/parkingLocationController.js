import express from "express";
import ParkingLocation from "../../models/parkingLocationModel.js";
import mongoose from "mongoose";

export const uploadGstDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/gst/${req.file.filename}`;

    return res.status(200).json({
      message: "File uploaded successfully",
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (err) {
    console.error("uploadGstDocument error:", err);
    return res.status(500).json({
      message: "File upload failed",
      error: err.message,
    });
  }
};


export const createLocation = async (req, res) => {
  try {
    const vendorId = req.user.userId;


    const existing = await ParkingLocation.findOne({
      vendorId: vendorId,
      locationName: { $regex: `^${req.body.locationName}$`, $options: "i" },
    });

    if (existing) {
      return res.status(409).json({
        message: "You already have a location with this name",
      });
    }

    const newLocation = await ParkingLocation.create({
      vendorId: vendorId,
      locationName: req.body.locationName.trim(),
      geo: req.body.geo,
      operationalDays: req.body.operationalDays,
      operationalHours: req.body.operationalHours,
      capacity: req.body.capacity,
      bikePrice: req.body.bikePrice,
      carPrice: req.body.carPrice,
      amenities: req.body.amenities || [],
      documents: req.body.documents,
      isActive: true,
      approvalStatus: "PENDING",
    });

    return res.status(201).json({
      message: "Location created successfully",
      data: newLocation,
    });
  } catch (err) {
    console.error("createLocation error:", err);
    return res.status(500).json({
      message: "Failed to create location",
      error: err.message,
    });
  }
};

export const checkLocationName = async (req, res) => {
  try {
    const name = req.query.locationName.trim();
    const vendorId = req.user.userId;

    const matches = await ParkingLocation.find({
      vendorId: vendorId,
      locationName: { $regex: `^${name}$`, $options: "i" },
    })

    return res.status(200).json(matches);
  } catch (err) {
    console.error("checkLocationName error:", err);
    return res.status(500).json({
      message: "Failed to check location name",
      error: err.message,
    });
  }
};

export const getParkingLocationsById = async (req, res) => {
  const locationId = req.params.id;
  const vendorId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(locationId)) {
    return res.status(400).json({ message: "Invalid location ID" });
  }

  try{
    const location = await ParkingLocation.findOne({
      _id: locationId,
      vendorId: vendorId,
    });
    
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    return res.status(200).json(location);
  } catch (err) {
    console.error("getParkingLocationsById error:", err);
    return res.status(500).json({
      message: "Failed to get location",
      error: err.message,
    });
  }
}