import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Parking Management API",
      version: "1.0.0",
      description: "API documentation for the Parking Management backend",
    },
    servers: [
      {
        url: "http://localhost:4000/api",
        description: "Development server",
      },
    ],
    tags: [
      { name: "Vehicles", description: "Vehicle management" },
      { name: "Wallet", description: "Wallet operations" },
      { name: "Locations", description: "Parking locations" },
      { name: "Bookings", description: "Booking management" },
      { name: "Transactions", description: "Transaction management" },
      { name: "Tickets", description: "Support tickets" },
      { name: "Users", description: "User management" },
    ],
    paths: {
      // ── Vehicles ──
      "/customer/vehicle": {
        get: {
          tags: ["Vehicles"],
          summary: "Get vehicles by userId",
          parameters: [
            {
              name: "userId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "Array of vehicles" } },
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
          responses: { 201: { description: "Vehicle created" } },
        },
      },
      "/customer/vehicle/getVehicleById/{vehicleId}": {
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
          responses: { 200: { description: "Vehicle object" } },
        },
      },
      "/customer/vehicle/{id}": {
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
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Vehicle updated" } },
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
          responses: { 200: { description: "Vehicle deleted" } },
        },
      },

      // ── Wallet ──
      "/customer/wallet": {
        get: {
          tags: ["Wallet"],
          summary: "Get wallet by userId",
          parameters: [
            {
              name: "userId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "Array of wallets" } },
        },
      },
      "/customer/wallet/{walletId}": {
        patch: {
          tags: ["Wallet"],
          summary: "Update wallet balance",
          parameters: [
            {
              name: "walletId",
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
                  required: ["balance"],
                  properties: {
                    balance: { type: "number" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Wallet updated" } },
        },
      },

      // ── Locations ──
      "/customer/locations": {
        get: {
          tags: ["Locations"],
          summary: "Get all active & approved parking locations",
          responses: { 200: { description: "Array of parking locations" } },
        },
      },
      "/customer/locations/getLocationById/{id}": {
        get: {
          tags: ["Locations"],
          summary: "Get parking location by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "Parking location object" } },
        },
      },

      // ── Bookings ──
      "/customer/bookings": {
        get: {
          tags: ["Bookings"],
          summary: "Get bookings by customerId (paginated)",
          parameters: [
            {
              name: "customerId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "_page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "_limit",
              in: "query",
              schema: { type: "integer", default: 10 },
            },
          ],
          responses: { 200: { description: "Array of bookings" } },
        },
      },
      "/customer/bookings/recent": {
        get: {
          tags: ["Bookings"],
          summary: "Get recent bookings with vehicle & location data",
          parameters: [
            {
              name: "customerId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
            {
              name: "_page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "_limit",
              in: "query",
              schema: { type: "integer", default: 10 },
            },
          ],
          responses: {
            200: {
              description: "Array of { booking, vehicle, location }",
            },
          },
        },
      },
      "/customer/bookings/getBookingsByStatus": {
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
              schema: {
                type: "string",
                enum: ["CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"],
              },
            },
          ],
          responses: { 200: { description: "Array of bookings" } },
        },
      },
      "/customer/bookings/{id}": {
        get: {
          tags: ["Bookings"],
          summary: "Get booking by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "Booking object" } },
        },
      },

      // ── Transactions ──
      "/customer/transactions": {
        get: {
          tags: ["Transactions"],
          summary: "Get transactions by walletId (optionally paginated)",
          parameters: [
            {
              name: "walletId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
            { name: "_page", in: "query", schema: { type: "integer" } },
            { name: "_limit", in: "query", schema: { type: "integer" } },
          ],
          responses: { 200: { description: "Array of transactions" } },
        },
        post: {
          tags: ["Transactions"],
          summary: "Create a transaction",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["walletId", "type", "amount", "status"],
                  properties: {
                    walletId: { type: "string" },
                    bookingId: { type: "string", nullable: true },
                    type: {
                      type: "string",
                      enum: [
                        "RECHARGE",
                        "SENT",
                        "RECEIVE",
                        "DEDUCT",
                        "WITHDRAWAL",
                      ],
                    },
                    amount: { type: "number" },
                    status: { type: "string", enum: ["SUCCESS", "FAILED"] },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Transaction created" } },
        },
      },

      // ── Tickets ──
      "/customer/tickets": {
        get: {
          tags: ["Tickets"],
          summary: "Get tickets by creatorId",
          parameters: [
            {
              name: "creatorId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "Array of tickets" } },
        },
        post: {
          tags: ["Tickets"],
          summary: "Create a ticket",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "creatorId",
                    "subject",
                    "description",
                    "category",
                    "emailId",
                  ],
                  properties: {
                    creatorId: { type: "string" },
                    handlerId: { type: "string" },
                    bookingId: { type: "string" },
                    subject: { type: "string" },
                    description: { type: "string" },
                    category: { type: "string" },
                    status: { type: "string", default: "OPEN" },
                    emailId: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Ticket created" } },
        },
      },
      "/customer/tickets/handler": {
        get: {
          tags: ["Tickets"],
          summary: "Get tickets by handlerId",
          parameters: [
            {
              name: "handlerId",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "Array of tickets" } },
        },
      },
      "/customer/tickets/{ticketId}": {
        patch: {
          tags: ["Tickets"],
          summary: "Update ticket status",
          parameters: [
            {
              name: "ticketId",
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
                  required: ["status"],
                  properties: {
                    status: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Ticket updated" } },
        },
      },

      // ── Users ──
      "/customer/users/getUserByRole": {
        get: {
          tags: ["Users"],
          summary: "Get users by role",
          parameters: [
            {
              name: "role",
              in: "query",
              required: true,
              schema: {
                type: "string",
                enum: ["SUPER_ADMIN", "VENDOR", "CUSTOMER"],
              },
            },
          ],
          responses: { 200: { description: "Array of users" } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use(
    "/api-docs/customer",
    swaggerUi.serveFiles(swaggerSpec),
    swaggerUi.setup(swaggerSpec),
  );
  console.log("Swagger docs available at /api-docs/customer for CUSTOMER");
};
