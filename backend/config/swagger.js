import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Parking Management - Vendor API",
      version: "1.0.0",
      description:
        "API documentation for the Parking Management System (Vendor Module)",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // ─── Parking Location ───
        ParkingLocation: {
          type: "object",
          properties: {
            _id: { type: "string", example: "69fc136e6d8096782746e162" },
            vendorId: { type: "string" },
            locationName: { type: "string", example: "City Center Parking" },
            geo: {
              type: "object",
              properties: {
                lat: { type: "number", example: 13.0827 },
                lng: { type: "number", example: 80.2707 },
                address: {
                  type: "string",
                  example: "123 Main St, Chennai",
                },
              },
            },
            operationalDays: {
              type: "array",
              items: { type: "string" },
              example: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            },
            operationalHours: {
              type: "object",
              properties: {
                open: { type: "string", example: "08:00" },
                close: { type: "string", example: "22:00" },
              },
            },
            capacity: {
              type: "object",
              properties: {
                twoWheeler: { type: "integer", example: 50 },
                fourWheeler: { type: "integer", example: 30 },
              },
            },
            bikePrice: { type: "number", example: 20 },
            carPrice: { type: "number", example: 50 },
            amenities: {
              type: "array",
              items: { type: "string" },
              example: ["CCTV", "EV Charging"],
            },
            documents: {
              type: "object",
              properties: {
                gstUrl: { type: "string" },
              },
            },
            isActive: { type: "boolean", example: true },
            approvalStatus: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
              example: "PENDING",
            },
          },
        },
        // ─── Booking ───
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string" },
            customerId: { type: "string" },
            vehicleId: { type: "string" },
            locationId: { type: "string" },
            customerName: { type: "string", example: "Karthik S" },
            plateNumber: { type: "string", example: "TN09XY9876" },
            type: {
              type: "string",
              enum: ["2-WHEELER", "4-WHEELER"],
              example: "4-WHEELER",
            },
            scheduledStartTime: {
              type: "string",
              format: "date-time",
            },
            scheduledEndTime: {
              type: "string",
              format: "date-time",
            },
            actualCheckIn: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            actualCheckOut: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            finalDeductedAmount: { type: "number", example: 100 },
            status: {
              type: "string",
              enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
              example: "COMPLETED",
            },
            qrData: { type: "string", example: "QR-BOOK-DASH-002" },
          },
        },
        // ─── Vendor / User ───
        Vendor: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "John Vendor" },
            email: {
              type: "string",
              format: "email",
              example: "vendor@example.com",
            },
            role: { type: "string", example: "vendor" },
          },
        },
        // ─── Error ───
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        // ─── Subscription ───
        SubscriptionStatus: {
          type: "object",
          properties: {
            daysLeft: {
              type: "integer",
              description: "Number of days left before subscription expires",
              example: 120,
            },
            isExpired: {
              type: "boolean",
              description: "Whether the subscription has expired",
              example: false,
            },
            showWarning: {
              type: "boolean",
              description: "True if 7 or fewer days remain",
              example: false,
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/vendor/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use(
    "/api-docs/vendor",
    swaggerUi.serveFiles(swaggerSpec),
    swaggerUi.setup(swaggerSpec),
  );
  console.log("Swagger docs available at /api-docs/vendor for VENDOR");
}

export default swaggerSpec;
