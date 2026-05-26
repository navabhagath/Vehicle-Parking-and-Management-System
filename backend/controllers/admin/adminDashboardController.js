import User from "../../models/userModel.js";
import Revenue from "../../models/revenueModel.js";

export const getDashboardStats = async (req, res) => {
    try {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // 1. Basic Totals (Excluding Admin from vendor count)
        const totalVendors = await User.countDocuments({ role: "VENDOR" });

        // 2. Monthly Revenue Analysis
        const revenueStats = await Revenue.aggregate([
            {
                $group: {
                    _id: { 
                        month: { $month: { $toDate: "$credited_on" } }, 
                        year: { $year: { $toDate: "$credited_on" } } 
                    },
                    monthlyTotal: { $sum: { $toDouble: "$amount" } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);


        const totalRevenue = revenueStats.reduce((acc, curr) => acc + curr.monthlyTotal, 0);
        const monthlyAnalysis = revenueStats.map(stat => ({
            month: `${monthNames[stat._id.month - 1]} ${stat._id.year}`,
            amount: stat.monthlyTotal
        }));

        // 3. Growth Velocity (Vendor-only cumulative growth)
        const growthStats = await User.aggregate([
            { $match: { role: "VENDOR" } },
            {
                $group: {
                    _id: {
                        month: { $month: { $toDate: "$createdAt" } },
                        year: { $year: { $toDate: "$createdAt" } }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        let cumulativeCount = 0;
        const growthVelocity = growthStats.map(stat => {
            cumulativeCount += stat.count;
            return {
                month: `${monthNames[stat._id.month - 1]} ${stat._id.year}`,
                totalVendors: cumulativeCount
            };
        });

        // 4. UPDATED: Revenue by Vendor (Strict Top 5, Excluding Admin)
        const topVendorsRevenue = await Revenue.aggregate([
            {
                // Group by vendor_id to sum up their individual earnings
                $group: {
                    _id: "$vendorId",
                    totalGenerated: { $sum: { $toDouble: "$amount" } }
                }
            },
            {
                // Join with User collection to get names and verify roles
                $lookup: {
                    from: "users", 
                    localField: "_id",
                    foreignField: "_id", // Use "id" or "_id" based on your schema
                    as: "vendorDetails"
                }
            },
            { $unwind: "$vendorDetails" },
            {
                // Filter out ADMINS to ensure only VENDORS are shown
                $match: {
                    "vendorDetails.role": { $ne: "ADMIN" }
                }
            },
            { $sort: { totalGenerated: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    name: "$vendorDetails.name",
                    value: "$totalGenerated"
                }
            }
        ]);

        res.status(200).json({
            totalVendors,
            totalRevenue,
            monthlyAnalysis,
            growthVelocity,
            topVendorsRevenue 
        });

    } catch (error) {
        res.status(500).json({ message: "Dashboard Error", error: error.message });
    }
};