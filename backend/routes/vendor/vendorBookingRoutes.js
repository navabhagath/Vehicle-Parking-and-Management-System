import express from "express";
import { getBookings } from "../../controllers/vendor/vendorBookingController.js";

const router = express.Router();

/**
 * @swagger
 * /api/vendor/bookings/{locationId}:
 *   get:
 *     summary: Get bookings for a location
 *     description: Returns current or overstayed bookings for a specific parking location.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The parking location ID
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [current, overstayed]
 *         description: Filter type — "current" for active bookings, "overstayed" for overdue ones
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid location ID
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
router.get("/:locationId", getBookings);

export default router;
