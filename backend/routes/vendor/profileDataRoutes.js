import express from "express";
import { getVendorData } from "../../controllers/vendor/vendorProfileController.js";

const router = express.Router();

/**
 * @swagger
 * /api/vendor/profileData:
 *   get:
 *     summary: Get vendor profile data
 *     description: Returns the authenticated vendor's profile information.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vendor'
 *       404:
 *         description: Vendor not found
 *       500:
 *         description: Internal server error
 */
router.get("/", getVendorData);

export default router;
