import { Router } from "express";
import {
  getTicketsByUser,
  getTicketsByHandler,
  updateTicketStatus,
  createTicket,
} from "../../controllers/customer/ticketController.js";

const router = Router();

router.get("", getTicketsByUser);
router.get("/handler", getTicketsByHandler);
router.post("", createTicket);
router.patch("/:ticketId", updateTicketStatus);

export default router;
