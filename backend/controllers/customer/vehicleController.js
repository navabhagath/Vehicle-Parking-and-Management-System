import mongoose from "mongoose";
import Vehicle from "../../models/vehicleModel.js";
import { updateId } from "../../middlewares/idMiddleware.js";

// all vehicles of user
export const getVehicleController = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: false,
        message: "Valid userId is required",
      });
    }

    const vehicles = await Vehicle.find({ userId }).lean();

    const updatedVehicle  = await updateId(vehicles);

    // console.log(updatedVehicle,"res")

    if(updatedVehicle==null){
      return res.status(500).json({
         status: false,
        message: "Internally Id updating process break",
        data: [],
      })
    }

    if (updatedVehicle.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Vehicles not found",
        data: [],
      });
    }

    return res.status(200).send(updatedVehicle)
  } catch (error) {
    console.error("getVehicleController error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getVehicleById = async(req,res) =>{
     try {
    const { vehicleId } = req.params;
    if (!vehicleId || !mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({
        status: false,
        message: "Valid vehicleId is required",
      });
    }

    const vehicles = await Vehicle.findOne({_id:vehicleId})
    if (!vehicles) {
      return res.status(404).json({
        status: false,
        message: "Vehicle not found",
        data: [],
      });
    }

    return res.status(200).send(vehicles)
  } catch (error) {
    console.error("getVehicleController error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
}
export const addVehicle = async (req, res) => {
  try {
    const { userId, plateNumber, model, type, isPrimary, name } = req.body;
 
    if (!userId || !plateNumber || !model || !name) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: userId,plateNumber,model and name are mandatory.",
      });
    }
 
    const result = await Vehicle.create({
      userId,
      plateNumber,
      model,
      type,
      isPrimary: isPrimary || false, 
      name,
      createdAt: new Date(),
    });
 
    const vehicle = result.toObject();
 
    return res.status(201).json({
      id: vehicle._id.toString(),
      userId: vehicle.userId.toString(),
      name: vehicle.name,
      plateNumber: vehicle.plateNumber,
      model: vehicle.model,
      type: vehicle.type,
      isPrimary: vehicle.isPrimary,
    });
  } catch (error) {
    console.error("Error in addVehicle controller:", error);
 
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while adding the vehicle.",
      error: error.message,
    });
  }
};
 
 
 
// seting primary
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID is required."
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided."
      });
    }

    const result = await Vehicle.findByIdAndUpdate(
      {_id:id},
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result
    });

  } catch (error) {
    console.error("Error in updateVehicle controller:", error);

    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while updating the vehicle.",
      error: error.message
    });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID is required."
      });
    }

    const result = await Vehicle.findByIdAndDelete({_id:id});

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: result
    });

  } catch (error) {
    console.error("Error in deleteVehicle controller:", error);

    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while deleting the vehicle.",
      error: error.message
    });
  }
};