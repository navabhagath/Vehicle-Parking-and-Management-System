import mongoose from "mongoose";
import Transaction from "../../models/transactionModel.js";

/**
 * Transform mongoose doc -> frontend Transaction shape.
 * Frontend Transaction interface:
 *   id, walletId, bookingId|null, type, amount, status, timestamp (string)
 *
 * Mongoose has timestamps:true, so we map createdAt -> timestamp
 * (frontend stores it as `timestamp: string`).
 */
const formatTransaction = (t) => {
  if (!t) return null;
  const obj = t.toObject ? t.toObject() : t;
  return {
    id: obj._id.toString(),
    walletId: obj.walletId.toString(),
    bookingId: obj.bookingId ? obj.bookingId.toString() : null,
    type: obj.type,
    amount: obj.amount,
    status: obj.status,
    timestamp: obj.createdAt
      ? new Date(obj.createdAt).toISOString()
      : new Date().toISOString(),
  };
};

/**
 * POST /transactions
 */
export const createTransaction = async (req, res) => {
  try {
    const { walletId, bookingId = null, type, amount, status } = req.body;

    if (!walletId || !type || amount === undefined || !status) {
      return res
        .status(400)
        .json({ message: "walletId, type, amount, and status are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ message: "Invalid walletId" });
    }

    const validTypes = ["RECHARGE", "SENT", "RECEIVE", "DEDUCT", "WITHDRAWAL"];
    const validStatuses = ["SUCCESS", "FAILED"];

    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .json({ message: `type must be one of: ${validTypes.join(", ")}` });
    }
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const transaction = await Transaction.create({
      walletId,
      bookingId:
        bookingId && mongoose.Types.ObjectId.isValid(bookingId)
          ? bookingId
          : null,
      type,
      amount,
      status,
    });

    return res.status(201).json(formatTransaction(transaction));
  } catch (err) {
    console.error("createTransaction error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /transactions?walletId=xxx&_page=1&_limit=10
 * If _page and _limit are provided, returns paginated data.
 * Otherwise returns all transactions.
 */
export const getTransactions = async (req, res) => {
  try {
    const { walletId, _page, _limit } = req.query;

    console.log("getTransactions called with walletId:", walletId);

    if (!walletId) {
      return res.status(400).json({ message: "walletId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({ message: "Invalid walletId" });
    }

    let query = Transaction.find({ walletId }).sort({ createdAt: -1 });

    if (_page && _limit) {
      const page = Math.max(parseInt(_page, 10) || 1, 1);
      const limit = Math.min(Math.max(parseInt(_limit, 10) || 5, 1), 5);
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const transactions = await query;

    return res.status(200).json(transactions.map(formatTransaction));
  } catch (err) {
    console.error("getTransactions error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
