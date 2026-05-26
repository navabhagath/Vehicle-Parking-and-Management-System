import express from "express";
import { getRevenueStats } from "../../controllers/vendor/analyticsStatsController.js";
import { getVehiclePie } from "../../controllers/vendor/analyticsVehiclepieController.js";
import { getRevenueBar } from "../../controllers/vendor/analyticsRevenueController.js";
const router = express.Router();

/**
 * @swagger
 * /api/vendor/analytics/stats/{locationId}:
 *   get:
 *     summary: Get revenue statistics
 *     description: Returns revenue stats (today, month, year, total) for a specific parking location.
 *     tags: [Analytics]
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
 *         description: Revenue statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 today:
 *                   type: number
 *                   example: 500
 *                 month:
 *                   type: number
 *                   example: 12000
 *                 year:
 *                   type: number
 *                   example: 85000
 *                 total:
 *                   type: number
 *                   example: 150000
 *       400:
 *         description: Invalid location ID
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
router.get("/stats/:locationId", getRevenueStats);

/**
 * @swagger
 * /api/vendor/analytics/vehicle-pie/{locationId}:
 *   get:
 *     summary: Get vehicle type distribution
 *     description: Returns revenue and count breakdown by vehicle type (2-Wheeler vs 4-Wheeler) for a given period.
 *     tags: [Analytics]
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
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *           enum: [today, last7, last15, last30]
 *         description: Time period filter
 *     responses:
 *       200:
 *         description: Vehicle type distribution
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 twoWheelerRev:
 *                   type: number
 *                 twoWheelerCount:
 *                   type: integer
 *                 fourWheelerRev:
 *                   type: number
 *                 fourWheelerCount:
 *                   type: integer
 *       400:
 *         description: Invalid location ID or query parameter
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
router.get("/vehicle-pie/:locationId", getVehiclePie);

/**
 * @swagger
 * /api/vendor/analytics/revenue-bar/{locationId}:
 *   get:
 *     summary: Get revenue bar chart data
 *     description: Returns labels and revenue data for bar chart visualization over week, month, or year range.
 *     tags: [Analytics]
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
 *         name: range
 *         required: true
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *         description: Time range for the chart
 *     responses:
 *       200:
 *         description: Bar chart data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 labels:
 *                   type: array
 *                   items:
 *                     type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: number
 *       400:
 *         description: Invalid location ID or query parameters
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
router.get("/revenue-bar/:locationId", getRevenueBar);

export default router;
