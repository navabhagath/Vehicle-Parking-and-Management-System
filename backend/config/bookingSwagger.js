import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Parking Management - Booking API",
      version: "1.0.0",
      description:
        "API documentation for the Parking Management System (Booking Module)",
    },
    servers: [
      {
        url: "http://localhost:4000/api",
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
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Bookings", description: "Booking management" },
      { name: "Gatepass", description: "Gatepass check-in / check-out" },
      { name: "Locations", description: "Parking locations lookup" },
      { name: "Vehicles", description: "Vehicle management" },
      { name: "Wallet", description: "Wallet operations" },
    ],
    paths: {
      // ─── Bookings ───
      "/bookings": {
        post: {
          tags: ["Bookings"],
          summary: "Create a new booking",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    customerId: { type: "string" },
                    vehicleId: { type: "string" },
                    locationId: { type: "string" },
                    startTime: { type: "string", format: "date-time" },
                    endTime: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Booking created successfully" },
            500: { description: "Server error" },
          },
        },
        get: {
          tags: ["Bookings"],
          summary: "Get bookings by customer",
          parameters: [
            {
              name: "customerId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
            { name: "_page", in: "query", schema: { type: "integer" } },
            { name: "_limit", in: "query", schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Array of bookings" },
          },
        },
      },
      "/bookings/getBookingsByStatus": {
        get: {
          tags: ["Bookings"],
          summary: "Get bookings filtered by status",
          parameters: [
            {
              name: "customerId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "status",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Array of bookings matching status" },
          },
        },
      },
      "/bookings/recent": {
        get: {
          tags: ["Bookings"],
          summary: "Get recent bookings",
          parameters: [
            {
              name: "customerId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
            { name: "_page", in: "query", schema: { type: "integer" } },
            { name: "_limit", in: "query", schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Array of recent bookings" },
          },
        },
      },
      "/bookings/{id}": {
        patch: {
          tags: ["Bookings"],
          summary: "Update a booking",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Booking updated" },
            404: { description: "Booking not found" },
          },
        },
      },

      // ─── Gatepass ───
      "/bookings/gatepass/{bookingId}/{locationId}": {
        get: {
          tags: ["Gatepass"],
          summary: "Get booking details for gatepass",
          parameters: [
            {
              name: "bookingId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "locationId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Booking details" },
            404: { description: "Booking not found" },
          },
        },
      },
      "/bookings/gatepass/checkin/{bookingId}/{locationId}": {
        patch: {
          tags: ["Gatepass"],
          summary: "Check in a booking",
          parameters: [
            {
              name: "bookingId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "locationId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Checked in successfully" },
            404: { description: "Booking not found" },
          },
        },
      },
      "/bookings/gatepass/checkout": {
        post: {
          tags: ["Gatepass"],
          summary: "Check out a booking",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    bookingId: { type: "string" },
                    locationId: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Checked out successfully" },
            404: { description: "Booking not found" },
          },
        },
      },

      // ─── Locations ───
      "/bookings/locations": {
        get: {
          tags: ["Locations"],
          summary: "Get all parking locations",
          responses: {
            200: { description: "Array of parking locations" },
          },
        },
      },
      "/bookings/locations/getLocationById/{id}": {
        get: {
          tags: ["Locations"],
          summary: "Get a parking location by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Parking location object" },
            404: { description: "Location not found" },
          },
        },
      },

      // ─── Vehicles ───
      "/bookings/vehicle": {
        get: {
          tags: ["Vehicles"],
          summary: "Get vehicles by user",
          parameters: [
            {
              name: "userId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Array of vehicles" },
          },
        },
        post: {
          tags: ["Vehicles"],
          summary: "Add a new vehicle",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["userId", "plateNumber", "model", "name"],
                  properties: {
                    userId: { type: "string" },
                    plateNumber: { type: "string" },
                    model: { type: "string" },
                    name: { type: "string" },
                    type: { type: "string", enum: ["2-WHEELER", "4-WHEELER"] },
                    isPrimary: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Vehicle created" },
          },
        },
      },
      "/bookings/vehicle/{vehicleId}": {
        get: {
          tags: ["Vehicles"],
          summary: "Get vehicle by ID",
          parameters: [
            {
              name: "vehicleId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Vehicle object" },
            404: { description: "Vehicle not found" },
          },
        },
      },
      "/bookings/vehicle/{id}": {
        patch: {
          tags: ["Vehicles"],
          summary: "Update a vehicle",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    plateNumber: { type: "string" },
                    model: { type: "string" },
                    name: { type: "string" },
                    type: { type: "string", enum: ["2-WHEELER", "4-WHEELER"] },
                    isPrimary: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Vehicle updated" },
            404: { description: "Vehicle not found" },
          },
        },
        delete: {
          tags: ["Vehicles"],
          summary: "Delete a vehicle",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Vehicle deleted" },
            404: { description: "Vehicle not found" },
          },
        },
      },

      // ─── Wallet ───
      "/bookings/wallet/getWalletById": {
        get: {
          tags: ["Wallet"],
          summary: "Get wallet by user ID",
          parameters: [
            {
              name: "userId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Wallet object" },
            404: { description: "Wallet not found" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use(
    "/api-docs/booking",
    swaggerUi.serveFiles(swaggerSpec),
    swaggerUi.setup(swaggerSpec),
  );
  console.log("Swagger docs available at /api-docs/booking for BOOKING");
}

export default swaggerSpec;
