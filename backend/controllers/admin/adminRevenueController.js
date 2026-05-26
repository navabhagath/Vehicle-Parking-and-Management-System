import Revenue from "../../models/revenueModel.js";
import User from "../../models/userModel.js"; 
import ParkingLocation from "../../models/parkingLocationModel.js";
import { sendReminder } from "../../services/emailService.js"; // Import the utility

export const sendReminderEmail = async (req, res) => {
    const { vendorEmail, vendorName, expiryDate, status, vendorId} = req.body;
    console.log(`Email: ${vendorEmail}, Name: ${vendorName}, Expiry: ${expiryDate}, Status: ${status}`);    
    
    const html = `<h3>Subscription ${status}</h3><p>Hi ${vendorName}, your subscription expires on ${new Date(expiryDate).toLocaleDateString()}. Please renew soon.</p>`;
    
    try {
        await sendReminder(vendorEmail, `Subscription Alert: ${status}`, html);
        await Revenue.findOneAndUpdate(
            { vendorId: vendorId }, 
            { $set: { lastReminderSentAt: new Date() } }
        );
        res.status(200).json({ message: "Sent!" });
    } catch (error) {
        res.status(500).json({ message: "Failed", error: error.message });
    }
};

export const getRevenue = async (req, res) => {
    try {
        const today = new Date();

        const report = await Revenue.aggregate([
          
            {
                $lookup: {
                    from: "users", 
                    localField: "vendorId",
                    foreignField: "_id",
                    as: "vendorDetails"
                }
            },
          
            { $unwind: { path: "$vendorDetails" } },
            
            // 3. Project necessary fields and fix date types
            {
                $project: {
                    vendorId: 1,
                    amount: 1,
                    lastReminderSentAt: 1,
                    lastReminderSentAt: 1,
                    vendorName: "$vendorDetails.name",
                    vendorEmail: "$vendorDetails.email",
                    hasPaidSubscription: "$vendorDetails.hasPaidSubscription",
                    paymentDate: { $toDate: "$credited_on" }
                }
            },
            // 4. Add the calculated expiry date
            {
                $addFields: {
                    expiryDate: {
                        $dateAdd: {
                            startDate: "$paymentDate",
                            unit: "year",
                            amount: 1
                        }
                    }
                }
            }
        ]);

        // let totalRevenueSum = 0;
        
        const finalReport = await Promise.all(report.map(async (item) => {
           
            // const amountNum = parseFloat(item.amount) || 0;
            // totalRevenueSum += amountNum;

            const diffTime = item.expiryDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let status = "Active";
            if (diffDays < 0 ) {
                status = "Overdue";
                
                if (item.hasPaidSubscription === true) {
                    await User.findByIdAndUpdate(item.vendorId, { hasPaidSubscription: false });
                }
            } else if (diffDays <= 7 && item.hasPaidSubscription === false) {
                status = "Expiring Soon";
            }

            return { ...item, status };
        }));

        res.status(200).json({ 
            // totalRevenueAllVendors: totalRevenueSum, 
            vendorData: finalReport 
        });

    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};
