import express from "express";
import { getOverviewData } from "../../controllers/vendor/vendorOverviewController.js";

const router = express.Router();

/**
 * @swagger
 * /api/vendor/locations/{locationId}/overview:
 *   get:
 *     summary: Get location overview
 *     description: Returns location details, slot summary (total/occupied/free), and recent parking activity.
 *     tags: [Overview]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The parking location ID
 *     responses:
 *       200:
 *         description: Overview data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   $ref: '#/components/schemas/ParkingLocation'
 *                 slotSummary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     occupied:
 *                       type: integer
 *                     free:
 *                       type: integer
 *                 recentParking:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       plateNumber:
 *                         type: string
 *                       customerName:
 *                         type: string
 *                       vehicleType:
 *                         type: string
 *                       checkInTime:
 *                         type: string
 *       400:
 *         description: Invalid location ID
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
router.get("/:locationId/overview", getOverviewData);

export default router;
