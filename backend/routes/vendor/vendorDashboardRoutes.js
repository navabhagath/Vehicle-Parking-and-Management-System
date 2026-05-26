import express from "express";
import { getVendorDashboard } from "../../controllers/vendor/vendorDashboardController.js";

const router = express.Router();

/**
 * @swagger
 * /api/vendor/dashboard:
 *   get:
 *     summary: Get vendor dashboard data
 *     description: Returns all locations owned by the vendor along with occupancy data, active count, total slots and total occupied.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     locations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ParkingLocation'
 *                     occupancyMap:
 *                       type: object
 *                     activeCount:
 *                       type: integer
 *                     totalSlots:
 *                       type: integer
 *                     totalOccupied:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
router.get("/dashboard", getVendorDashboard);

export default router;
