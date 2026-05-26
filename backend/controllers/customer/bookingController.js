import mongoose from "mongoose";
import Booking from "../../models/bookingModel.js";
import Vehicle from "../../models/vehicleModel.js";
import ParkingLocation from "../../models/parkingLocationModel.js";

/**
 * Transform mongoose doc -> frontend Booking shape.
 * Frontend Booking interface expects ISO string dates and `id`.
 *
 * Note: actualCheckIn / actualCheckOut are nullable in the frontend interface,
 * so we keep null when they aren't set.
 */
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
 * GET /bookings/:id
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json(formatBooking(booking));
  } catch (err) {
    console.error("getBookingById error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /bookings/recent?customerId=xxx&_page=1&_limit=10
 * Returns array of { booking, vehicle, location } — no forkJoin needed on frontend.
 */
export const getRecentBookings = async (req, res) => {
  try {
    // res.set("Cache-Control", "no-store"); // Ensure fresh data for recent bookings
    // res.set("ETag", "");
    // res.removeHeader("ETag");
    const { customerId, _page = 1, _limit = 10 } = req.query;

    // console.log(customerId);

    if (!customerId) {
      return res.status(400).json({ message: "customerId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customerId" });
    }

    const page = Math.max(parseInt(_page, 10) || 1, 1);
    const limit = Math.max(parseInt(_limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({
      customerId: new mongoose.Types.ObjectId(customerId),
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (bookings.length === 0) {
      return res.status(200).json([]);
    }

    // Collect unique IDs for batch fetching
    const vehicleIds = [
      ...new Set(bookings.map((b) => b.vehicleId.toString())),
    ];
    const locationIds = [
      ...new Set(bookings.map((b) => b.locationId.toString())),
    ];

    const [vehicles, locations] = await Promise.all([
      Vehicle.find({ _id: { $in: vehicleIds } }).lean(),
      ParkingLocation.find({ _id: { $in: locationIds } }).lean(),
    ]);

    // Build lookup maps
    const vehicleMap = Object.fromEntries(
      vehicles.map((v) => [v._id.toString(), v]),
    );

    const locationMap = Object.fromEntries(
      locations.map((l) => [l._id.toString(), l]),
    );

      const result = bookings.map((b) => {
      const bObj = formatBooking(b);
      const v = vehicleMap[b.vehicleId.toString()] ?? null;
      const l = locationMap[b.locationId.toString()] ?? null;

      return {
        booking: bObj,
        vehicle: v
          ? {
              id: v._id.toString(),
              userId: v.userId.toString(),
              name: v.name,
              plateNumber: v.plateNumber,
              model: v.model,
              type: v.type,
              isPrimary: v.isPrimary,
            }
          : null,
        location: l
          ? {
              id: l._id.toString(),
              vendorId: l.vendorId.toString(),
              locationName: l.locationName,
              isActive: l.isActive,
              geo: l.geo,
              operationalDays: l.operationalDays ?? [],
              operationalHours: l.operationalHours,
              capacity: l.capacity,
              bikePrice: l.bikePrice,
              carPrice: l.carPrice,
              amenities: l.amenities ?? [],
              approvalStatus: l.approvalStatus,
            }
          : null,
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("getRecentBookings error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /bookings?customerId=xxx&_page=1&_limit=10
 * Frontend uses json-server style query params (_page, _limit).
 * We respect that so the DAO doesn't have to change.
 */
export const getBookingsByUser = async (req, res) => {
  try {
    const { customerId, _page = 1, _limit = 10 } = req.query;

    if (!customerId) {
      return res.status(400).json({ message: "customerId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customerId" });
    }

    const page = Math.max(parseInt(_page, 10) || 1, 1);
    const limit = Math.max(parseInt(_limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ customerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (bookings.length === 0) {
      console.log(`No bookings found for customerId: ${customerId}`);
      return res.status(404).json({
        message: "No bookings found for this user",
      }); // Return empty array if no bookings found
    }

    // Frontend expects an array (Booking[])
    return res.status(200).json(bookings.map(formatBooking));
  } catch (err) {
    console.error("getBookingsByUser error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /bookings?customerId=xxx&status=ACTIVE
 * Frontend's getActiveBooking hits the same /bookings route with status=ACTIVE.
 * If you keep ONE route for both, you can merge logic. To avoid breaking
 * pagination semantics, we expose a dedicated handler that the route can use,
 * OR you can let getBookingsByUser handle status as a query param.
 *
 * Easiest: one route, one controller, use this combined handler.
 */
export const getBookings = async (req, res) => {
  try {
    const { customerId, status, _page, _limit } = req.query;

    if (!customerId) {
      return res.status(400).json({ message: "customerId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customerId" });
    }

    const filter = { customerId };
    if (status) filter.status = status;

    let query = Booking.find(filter).sort({ createdAt: -1 });

    // Apply pagination only when frontend asked for it
    if (_page || _limit) {
      const page = Math.max(parseInt(_page, 10) || 1, 1);
      const limit = Math.max(parseInt(_limit, 10) || 10, 1);
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const bookings = await query.exec();
    return res.status(200).json(bookings.map(formatBooking));
  } catch (err) {
    console.error("getBookings error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Specifically for getActiveBooking — if you'd rather keep it as a separate
 * controller for clarity, use this one and route it at /bookings/active.
 * NOTE: frontend currently calls /bookings?customerId=...&status=ACTIVE,
 * so prefer the combined `getBookings` above and don't change frontend.
 */
export const getActiveBooking = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ message: "customerId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customerId" });
    }

    const bookings = await Booking.find({ customerId, status: "ACTIVE" }).sort({
      createdAt: -1,
    });

    return res.status(200).json(bookings.map(formatBooking));
  } catch (err) {
    console.error("getActiveBooking error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookingsByStatus = async (req, res) => {
  try {
    const {  customerId, locationId, status } = req.query;

    const filter = {};
    if (customerId) filter.customerId = customerId;
    if (locationId) filter.locationId = locationId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter);
    return res.status(200).json(bookings.map(formatBooking));
  } catch (error) {
    console.error("getBookingsByStatus error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /bookings
 * Frontend sends Partial<Booking>. We trust the input shape here but you may
 * want to add stronger validation (overlapping times, capacity, wallet balance, etc).
 */
export const createBooking = async (req, res) => {
  try {
    const {
      customerId,
      vehicleId,
      locationId,
      customerName,
      plateNumber,
      type,
      scheduledStartTime,
      scheduledEndTime,
      finalDeductedAmount,
      status,
      qrData,
    } = req.body;

    // Required-field check
    const required = {
      customerId,
      vehicleId,
      locationId,
      customerName,
      plateNumber,
      type,
      scheduledStartTime,
      scheduledEndTime,
      qrData,
    };
    for (const [k, v] of Object.entries(required)) {
      if (v === undefined || v === null || v === "") {
        return res.status(400).json({ message: `${k} is required` });
      }
    }

    // ObjectId checks
    for (const [k, v] of Object.entries({
      customerId,
      vehicleId,
      locationId,
    })) {
      if (!mongoose.Types.ObjectId.isValid(v)) {
        return res.status(400).json({ message: `Invalid ${k}` });
      }
    }

    const booking = await Booking.create({
      customerId,
      vehicleId,
      locationId,
      customerName,
      plateNumber,
      type,
      scheduledStartTime: new Date(scheduledStartTime),
      scheduledEndTime: new Date(scheduledEndTime),
      finalDeductedAmount: finalDeductedAmount ?? 0,
      status: status ?? "CONFIRMED",
      qrData,
    });

    return res.status(201).json(formatBooking(booking));
  } catch (err) {
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ message: "Duplicate qrData", keyValue: err.keyValue });
    }
    console.error("createBooking error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PATCH /bookings/:id
 * Frontend uses partial updates (e.g. setting status -> ACTIVE / COMPLETED,
 * actualCheckIn, actualCheckOut, finalDeductedAmount).
 */
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    // Whitelist updatable fields
    const allowed = [
      "customerName",
      "plateNumber",
      "type",
      "scheduledStartTime",
      "scheduledEndTime",
      "actualCheckIn",
      "actualCheckOut",
      "finalDeductedAmount",
      "status",
      "qrData",
    ];
    const update = {};
    for (const key of allowed) {
      if (key in req.body) update[key] = req.body[key];
    }

    // Coerce date fields
    for (const k of [
      "scheduledStartTime",
      "scheduledEndTime",
      "actualCheckIn",
      "actualCheckOut",
    ]) {
      if (update[k]) update[k] = new Date(update[k]);
    }

    const booking = await Booking.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.status(200).json(formatBooking(booking));
  } catch (err) {
    console.error("updateBooking error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
