import Revenue from '../../models/revenueModel.js';
import User from '../../models/userModel.js';

// GET 
export const getSubscriptionStatus = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const revenue = await Revenue.findOne({ vendorId: vendorId }).lean().exec();
    if (!revenue) {
      await User.updateOne({ _id: vendorId }, { hasPaidSubscription: false }).exec();
      return res.status(200).json({
        success: true,
        data: {
          daysLeft: 0,
          isExpired: true,
          showWarning: true,
        },
      });
    }

    //expires after 1 year
    const creditedOn = new Date(revenue.credited_on);
    const expiresOn = new Date(creditedOn);
    expiresOn.setFullYear(expiresOn.getFullYear() + 1);

    // No.of days left
    const now = new Date();
    const msInDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.ceil((expiresOn.getTime() - now.getTime()) / msInDay);

    const isExpired = daysLeft <= 0;
    const showWarning = daysLeft <= 7;

    // flip to false when expired
    if (isExpired) {
      await User.updateOne({ _id: vendorId }, { hasPaidSubscription: false }).exec();
    }

    return res.status(200).json({
      success: true,
      data: {
        daysLeft: isExpired ? 0 : daysLeft,
        isExpired,
        showWarning,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const renewSubscription = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    const revenue = await Revenue.findOne({ vendorId: vendorId }).exec();

    if (!revenue) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this vendor',
      });
    }

    // checking whether expired or not
    const oldExpiresOn = new Date(revenue.credited_on);
    oldExpiresOn.setFullYear(oldExpiresOn.getFullYear() + 1);
    const isCurrentlyExpired = oldExpiresOn.getTime() <= Date.now();

    // Expired -> credited_on becomes today (so expiry = today + 1 year)
    // Not expired -> credited_on extends by 1 year from existing
    let newCreditedOn;
    if (isCurrentlyExpired) {
      newCreditedOn = new Date();
    } else {
      newCreditedOn = new Date(revenue.credited_on);
      newCreditedOn.setFullYear(newCreditedOn.getFullYear() + 1);
    }

    revenue.credited_on = newCreditedOn;
    revenue.amount = revenue.amount + 150000;
    await revenue.save();
    await User.updateOne({ _id: vendorId }, { hasPaidSubscription: true }).exec();

    // Compute the real daysLeft
    const newExpiresOn = new Date(newCreditedOn);
    newExpiresOn.setFullYear(newExpiresOn.getFullYear() + 1);
    const msInDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.ceil((newExpiresOn.getTime() - Date.now()) / msInDay);

    return res.status(200).json({
      success: true,
      message: 'Subscription renewed successfully',
      data: {
        daysLeft,
        isExpired: false,
        showWarning: daysLeft <= 7,
      },
    });
  } catch (error) {
    next(error);
  }
};