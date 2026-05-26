import { body, query } from "express-validator";

const VALID_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// Rules for POST /api/vendor/parkinglocations
export const createLocationValidator = [
  body("locationName")
    .trim()
    .notEmpty().withMessage("Location name is required")
    .isLength({ min: 5 }).withMessage("Location name must be at least 5 characters")
    .matches(/^[A-Za-z][A-Za-z0-9 ]*$/)
    .withMessage("Must start with a letter; only letters, numbers, and spaces allowed"),

  body("geo.type")
    .equals("Point").withMessage("geo.type must be 'Point'"),

  body("geo.coordinates")
    .isArray({ min: 2, max: 2 })
    .withMessage("Coordinates must be [longitude, latitude]"),

  body("geo.coordinates.*")
    .isFloat().withMessage("Coordinates must be numbers"),

  body("operationalDays")
    .isArray({ min: 1 }).withMessage("Select at least one operational day"),

  body("operationalDays.*")
    .isIn(VALID_DAYS).withMessage("Invalid day name"),

  body("operationalHours.start")
    .matches(TIME_REGEX).withMessage("Start time must be in HH:MM format"),

  body("operationalHours.end")
    .matches(TIME_REGEX).withMessage("End time must be in HH:MM format")
    .custom((end, { req }) => {
      if (end <= req.body.operationalHours?.start) {
        throw new Error("Closing time must be after opening time");
      }
      return true;
    }),

  body("capacity.twoWheeler")
    .isInt({ min: 0 }).withMessage("Two-wheeler capacity must be 0 or more"),

  body("capacity.fourWheeler")
    .isInt({ min: 0 }).withMessage("Four-wheeler capacity must be 0 or more"),

  body("bikePrice")
    .isFloat({ min: 0 }).withMessage("Bike price must be 0 or more"),

  body("carPrice")
    .isFloat({ min: 0 }).withMessage("Car price must be 0 or more"),

  body("amenities")
    .optional()
    .isArray().withMessage("Amenities must be an array"),

  body("documents.gstDocument")
  .trim()
  .notEmpty().withMessage("GST document URL is required")
  .isString().withMessage("GST document must be a string"),
];

// Rules for GET /api/vendor/parkinglocations?locationName=...
export const checkNameValidator = [
  query("locationName")
    .trim()
    .notEmpty().withMessage("locationName query param is required"),
];