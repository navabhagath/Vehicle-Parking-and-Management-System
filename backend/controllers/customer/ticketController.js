import mongoose from "mongoose";
import Ticket from "../../models/ticketModel.js";

/**
 * Transform mongoose doc -> frontend Ticket shape.
 * Frontend Ticket interface:
 *   id, creatorId, handlerId, bookingId|null, subject, description,
 *   category, status, createdAt (string), emailId
 *
 * Note: handlerId in the frontend is `string` (not nullable), but Mongo
 * defaults it to null until assigned. We coerce null -> "" so the type
 * stays a string and the frontend doesn't break.
 */
const formatTicket = (t) => {
  if (!t) return null;
  const obj = t.toObject ? t.toObject() : t;
  return {
    id: obj._id.toString(),
    creatorId: obj.creatorId.toString(),
    handlerId: obj.handlerId ? obj.handlerId.toString() : "",
    bookingId: obj.bookingId ? obj.bookingId.toString() : null,
    subject: obj.subject,
    description: obj.description,
    category: obj.category,
    status: obj.status,
    createdAt: obj.createdAt
      ? new Date(obj.createdAt).toISOString()
      : new Date().toISOString(),
    emailId: obj.emailId,
  };
};

/**
 * GET /tickets?creatorId=xxx
 */
export const getTicketsByUser = async (req, res) => {
  try {
    const { creatorId } = req.query;

    if (!creatorId) {
      return res.status(400).json({ message: "creatorId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ message: "Invalid creatorId" });
    }

    const tickets = await Ticket.find({ creatorId }).sort({ createdAt: -1 });
    return res.status(200).json(tickets.map(formatTicket));
  } catch (err) {
    console.error("getTicketsByUser error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PATCH /tickets/:ticketId
 * Updates ticket status.
 */
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ message: "Invalid ticketId" });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const updated = await Ticket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json(formatTicket(updated));
  } catch (err) {
    console.error("updateTicketStatus error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /tickets/handler?handlerId=xxx
 */
export const getTicketsByHandler = async (req, res) => {
  try {
    const { handlerId } = req.query;

    if (!handlerId) {
      return res.status(400).json({ message: "handlerId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(handlerId)) {
      return res.status(400).json({ message: "Invalid handlerId" });
    }

    const tickets = await Ticket.find({ handlerId }).sort({ createdAt: -1 });
    return res.status(200).json(tickets.map(formatTicket));
  } catch (err) {
    console.error("getTicketsByHandler error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /tickets
 * Frontend sends Partial<Ticket>. handlerId may not be sent on creation.
 */
export const createTicket = async (req, res) => {
  try {
    const {
      creatorId,
      handlerId,
      bookingId,
      subject,
      description,
      category,
      status,
      emailId,
    } = req.body;

    // Required fields
    const required = { creatorId, subject, description, category, emailId };
    for (const [k, v] of Object.entries(required)) {
      if (v === undefined || v === null || v === "") {
        return res.status(400).json({ message: `${k} is required` });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ message: "Invalid creatorId" });
    }
    if (handlerId && !mongoose.Types.ObjectId.isValid(handlerId)) {
      return res.status(400).json({ message: "Invalid handlerId" });
    }
    if (bookingId && !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid bookingId" });
    }

    const ticket = await Ticket.create({
      creatorId,
      handlerId: handlerId || null,
      bookingId: bookingId || null,
      subject,
      description,
      category,
      status: status ?? "OPEN",
      emailId,
    });

    return res.status(201).json(formatTicket(ticket));
  } catch (err) {
    console.error("createTicket error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
