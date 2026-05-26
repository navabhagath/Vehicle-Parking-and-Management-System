import express from "express";
import {
  uploadGstDocument,
  createLocation,
  checkLocationName,
  getParkingLocationsById,
} from "../../controllers/vendor/parkingLocationController.js";
import {
  createLocationValidator,
  checkNameValidator,
} from "../../utils/vendorParkingLocationValidators.js";
import validate from "../../middlewares/vendorLocationValidate.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

/**
 * @swagger
 * /api/vendor/parkinglocations/upload-gst:
 *   post:
 *     summary: Upload GST document
 *     description: Uploads a GST document file and returns the URL.
 *     tags: [Parking Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               gstDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 url:
 *                   type: string
 *                 filename:
 *                   type: string
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: File upload failed
 */
router.post("/upload-gst", upload.single("gstDocument"), uploadGstDocument);

/**
 * @swagger
 * /api/vendor/parkinglocations:
 *   post:
 *     summary: Create a new parking location
 *     description: Creates a new parking location for the authenticated vendor.
 *     tags: [Parking Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - locationName
 *               - geo
 *               - operationalDays
 *               - operationalHours
 *               - capacity
 *               - bikePrice
 *               - carPrice
 *             properties:
 *               locationName:
 *                 type: string
 *                 example: "City Center Parking"
 *               geo:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *                   address:
 *                     type: string
 *               operationalDays:
 *                 type: array
 *                 items:
 *                   type: string
 *               operationalHours:
 *                 type: object
 *                 properties:
 *                   open:
 *                     type: string
 *                   close:
 *                     type: string
 *               capacity:
 *                 type: object
 *                 properties:
 *                   twoWheeler:
 *                     type: integer
 *                   fourWheeler:
 *                     type: integer
 *               bikePrice:
 *                 type: number
 *               carPrice:
 *                 type: number
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               documents:
 *                 type: object
 *                 properties:
 *                   gstUrl:
 *                     type: string
 *     responses:
 *       201:
 *         description: Location created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ParkingLocation'
 *       409:
 *         description: Duplicate location name
 *       500:
 *         description: Internal server error
 */
router.post("/", createLocationValidator, validate, createLocation);

/**
 * @swagger
 * /api/vendor/parkinglocations:
 *   get:
 *     summary: Check if a location name exists
 *     description: Checks if the vendor already has a parking location with the given name.
 *     tags: [Parking Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: locationName
 *         required: true
 *         schema:
 *           type: string
 *         description: The location name to check
 *     responses:
 *       200:
 *         description: Matching locations returned
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParkingLocation'
 *       500:
 *         description: Internal server error
 */
router.get("/", checkNameValidator, validate, checkLocationName);

/**
 * @swagger
 * /api/vendor/parkinglocations/{id}:
 *   get:
 *     summary: Get a parking location by ID
 *     description: Returns details of a specific parking location owned by the vendor.
 *     tags: [Parking Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The parking location ID
 *     responses:
 *       200:
 *         description: Location details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingLocation'
 *       400:
 *         description: Invalid location ID
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getParkingLocationsById);

export default router;