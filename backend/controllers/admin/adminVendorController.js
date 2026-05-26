import User from "../../models/userModel.js";
import ParkingLocation from "../../models/parkingLocationModel.js";

export const getVendorManagementDetails = async (req, res) => {
    try {
        const vendorDetails = await User.aggregate([
            { $match: { role: "VENDOR" } },
            {
                $lookup: {
                    from: "parkinglocations",
                    localField: "_id",
                    foreignField: "vendorId",
                    as: "locations"
                }
            },
            {
                $project: {
                    _id: 0,
                    vendorId: "$_id",
                    name: 1,
                    email: 1,
                    phone: 1,
                    status: "$accountStatus",
                    isVerified: 1,
                    createdAt: 1,
                    locationDetails: {
                        $map: {
                            input: "$locations",
                            as: "loc",
                            in: {
                                locationName: "$$loc.locationName",
                                locationId: "$$loc._id",          
                                approvalStatus: "$$loc.approvalStatus",
                                bikePrice: "$$loc.bikePrice",
                                carPrice: "$$loc.carPrice",
                                capacity: "$$loc.capacity",
                                amenities: "$$loc.amenities",
                                operationalHours: "$$loc.operationalHours",
                                documents: "$$loc.documents",
                                isActive: "$$loc.isActive"
                            }
                        }
                    }
                }
            }
        ]);

        res.status(200).json(vendorDetails);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching vendor management data",
            error: error.message
        });
    }
};

export const updateVendorStatus = async (req, res) => {
    const { locationId } = req.params;
    const { status } = req.body;

    try {
        const updatedLocation = await ParkingLocation.findByIdAndUpdate(
            locationId,
            { $set: { approvalStatus: status } },
            { new: true }
        );

        if (!updatedLocation) {
            return res.status(404).json({ message: "Parking location not found" });
        }

        res.status(200).json(updatedLocation);
    } catch (error) {
        console.error("Patch Error:", error);
        res.status(500).json({ message: "Error updating status", error: error.message });
    }
};