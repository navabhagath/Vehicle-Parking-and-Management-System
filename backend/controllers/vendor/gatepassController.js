import mongoose from "mongoose";
import Booking from "../../models/bookingModel.js";
import Wallet from "../../models/walletModel.js";
import Transaction from "../../models/transactionModel.js";
import ParkingLocation from "../../models/parkingLocationModel.js";

const formatBooking = (b) => {
  if (!b) return null;
  const obj = b.toObject ? b.toObject() : b;
  return {
    id: obj._id.toString(),
    customerId: obj.customerId.toString(),
    vehicleId: obj.vehicleId.toString(),
    locationId: obj.locationId.toString(),
    customerName: obj.customerName,
    plateNumber: obj.plateNumber,
    type: obj.type,
    scheduledStartTime: obj.scheduledStartTime
      ? new Date(obj.scheduledStartTime).toISOString()
      : null,
    scheduledEndTime: obj.scheduledEndTime
      ? new Date(obj.scheduledEndTime).toISOString()
      : null,
    actualCheckIn: obj.actualCheckIn
      ? new Date(obj.actualCheckIn).toISOString()
      : null,
    actualCheckOut: obj.actualCheckOut
      ? new Date(obj.actualCheckOut).toISOString()
      : null,
    finalDeductedAmount: obj.finalDeductedAmount ?? 0,
    status: obj.status,
    qrData: obj.qrData,
  };
};

/**
 * Helper — confirms the location belongs to the logged-in vendor.
 * Returns the location document, or null if not owned / not found.
 */
const verifyLocationOwnership = async (locationId, vendorId) => {
  if (!mongoose.Types.ObjectId.isValid(locationId)) return null;
  return ParkingLocation.findOne({ _id: locationId, vendorId }).exec();
};

/**
 * GET /api/vendor/gatepass/booking/:bookingId/:locationId
 */
export const getBookingById = async (req, res) => {
  try {
    const { bookingId, locationId } = req.params;
    const vendorId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const location = await verifyLocationOwnership(locationId, vendorId);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      locationId: location._id,
    }).exec();

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found for this location" });
    }

    return res.status(200).json(formatBooking(booking));
  } catch (err) {
    console.error("getBookingById error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PATCH /api/vendor/gatepass/checkin/:bookingId/:locationId
 */
export const checkIn = async (req, res) => {
  try {
    const { bookingId, locationId } = req.params;
    const vendorId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const location = await verifyLocationOwnership(locationId, vendorId);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      locationId: location._id,
    }).exec();

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found for this location" });
    }

    if (booking.status !== "CONFIRMED") {
      return res.status(400).json({
        message: `Cannot check in a booking with status: ${booking.status}`,
      });
    }

    booking.status = "ACTIVE";
    booking.actualCheckIn = new Date();
    await booking.save();

    return res.status(200).json(formatBooking(booking));
  } catch (err) {
    console.error("checkIn error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/vendor/gatepass/checkout
 * Body: { bookingId, locationId }
 *
 * Backend recalculates finalAmount itself — never trusts the client.
 * Without a replica set we can't use a real DB transaction, so this
 * runs the writes in order of declining risk and rolls back if a
 * later step fails.
 */
export const checkOut = async (req, res) => {
  const { bookingId, locationId } = req.body;
  const vendorId = req.user.userId;

  if (!bookingId || !locationId) {
    return res.status(400).json({
      message: "bookingId and locationId are required",
    });
  }
  if (
    !mongoose.Types.ObjectId.isValid(bookingId) ||
    !mongoose.Types.ObjectId.isValid(locationId)
  ) {
    return res.status(400).json({ message: "Invalid bookingId or locationId" });
  }

  try {
    // 1. Ownership check
    const location = await verifyLocationOwnership(locationId, vendorId);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // 2. Load booking and validate state
    const booking = await Booking.findOne({
      _id: bookingId,
      locationId: location._id,
    }).exec();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status !== "ACTIVE") {
      return res.status(400).json({
        message: `Cannot check out a booking with status: ${booking.status}`,
      });
    }
    if (!booking.actualCheckIn) {
      return res.status(400).json({ message: "Booking has no check-in time" });
    }

    // 3. Compute finalAmount on the server (never trust the client)
    const pricePerHour =
      booking.type === "4-WHEELER" ? location.carPrice : location.bikePrice;
    const now = new Date();
    const hoursParked = Math.ceil(
      (now.getTime() - booking.actualCheckIn.getTime()) / (1000 * 60 * 60),
    );
    const finalAmount = Math.max(1, hoursParked) * pricePerHour;

    // 4. Load wallets
    const customerWallet = await Wallet.findOne({
      userId: booking.customerId,
    }).exec();
    if (!customerWallet) {
      return res.status(404).json({ message: "Customer wallet not found" });
    }
    const vendorWallet = await Wallet.findOne({
      userId: location.vendorId,
    }).exec();
    if (!vendorWallet) {
      return res.status(404).json({ message: "Vendor wallet not found" });
    }

    // 5. Apply writes in order, rolling back manually if anything fails.
    //    No replica set means no real DB transaction — this is the next best.
    //    Order: booking update first (cheapest to revert), then wallet moves,
    //    then transaction records.

    // 5a. Update booking
    const previousBookingState = {
      status: booking.status,
      actualCheckOut: booking.actualCheckOut,
      finalDeductedAmount: booking.finalDeductedAmount,
    };
    booking.status = "COMPLETED";
    booking.actualCheckOut = now;
    booking.finalDeductedAmount = finalAmount;
    await booking.save();

    // 5b. Deduct from customer wallet (allowed to go negative)
    try {
      customerWallet.balance -= finalAmount;
      await customerWallet.save();
    } catch (err) {
      // Roll back booking
      booking.status = previousBookingState.status;
      booking.actualCheckOut = previousBookingState.actualCheckOut;
      booking.finalDeductedAmount = previousBookingState.finalDeductedAmount;
      await booking.save();
      throw new Error("Failed to update customer wallet: " + err.message);
    }

    // 5c. Credit vendor wallet
    try {
      vendorWallet.balance += finalAmount;
      await vendorWallet.save();
    } catch (err) {
      // Roll back booking and customer wallet
      booking.status = previousBookingState.status;
      booking.actualCheckOut = previousBookingState.actualCheckOut;
      booking.finalDeductedAmount = previousBookingState.finalDeductedAmount;
      await booking.save();
      customerWallet.balance += finalAmount;
      await customerWallet.save();
      throw new Error("Failed to update vendor wallet: " + err.message);
    }

    // 5d. Create transaction records (least critical; missing rows can be
    //     reconstructed later from booking state if it ever comes to that)
    try {
      await Transaction.create({
        walletId: customerWallet._id,
        bookingId: booking._id,
        type: "DEDUCT",
        amount: finalAmount,
        status: "SUCCESS",
      });
      await Transaction.create({
        walletId: vendorWallet._id,
        bookingId: booking._id,
        type: "RECEIVE",
        amount: finalAmount,
        status: "SUCCESS",
      });
    } catch (err) {
      // Don't roll back wallets here — money has moved correctly.
      // Just log the inconsistency so we can patch the transaction log later.
      console.error(
        "Wallets updated but transaction records failed for booking",
        booking._id.toString(),
        err,
      );
    }

    return res.status(200).json({
      message: "Checkout successful",
      booking: formatBooking(booking),
      finalAmount,
    });
  } catch (err) {
    console.error("checkOut error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};
