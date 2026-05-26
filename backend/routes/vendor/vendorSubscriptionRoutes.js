import express from "express";
import {
  getSubscriptionStatus,
  renewSubscription,
} from "../../controllers/vendor/vendorSubscriptionController.js";

const router = express.Router();

/**
 * @swagger
 * /api/vendor/subscription/status:
 *   get:
 *     summary: Get vendor subscription status
 *     description: Returns the current subscription status of the vendor including days left, expiry status, and whether to show a warning.
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     daysLeft:
 *                       type: integer
 *                       description: Number of days left before subscription expires
 *                       example: 120
 *                     isExpired:
 *                       type: boolean
 *                       description: Whether the subscription has expired
 *                       example: false
 *                     showWarning:
 *                       type: boolean
 *                       description: True if 7 or fewer days remain
 *                       example: false
 *       500:
 *         description: Internal server error
 */
router.get("/status", getSubscriptionStatus);

/**
 * @swagger
 * /api/vendor/subscription/renew:
 *   patch:
 *     summary: Renew vendor subscription
 *     description: Renews the vendor's subscription by extending it by 1 year. If expired, renewal starts from today. If not expired, it extends from the current expiry date. Adds ₹1,50,000 to revenue.
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription renewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Subscription renewed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     daysLeft:
 *                       type: integer
 *                       example: 365
 *                     isExpired:
 *                       type: boolean
 *                       example: false
 *                     showWarning:
 *                       type: boolean
 *                       example: false
 *       404:
 *         description: No subscription found for this vendor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.patch("/renew", renewSubscription);

export default router;
