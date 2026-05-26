import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Parking Management - Admin API",
      version: "1.0.0",
      description:
        "API documentation for the Parking Management System (Admin Module)",
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
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Dashboard", description: "Admin dashboard statistics" },
      { name: "Revenue", description: "Revenue management" },
      {
        name: "Vendor Management",
        description: "Vendor management operations",
      },
      { name: "Users", description: "User management" },
    ],
    paths: {
      // ─── Dashboard Stats ───
      "/admin/stats": {
        get: {
          tags: ["Dashboard"],
          summary: "Get dashboard statistics",
          description:
            "Returns total vendors, total revenue, monthly analysis, growth velocity, and top vendors by revenue.",
          responses: {
            200: {
              description: "Dashboard stats retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      totalVendors: { type: "integer", example: 25 },
                      totalRevenue: { type: "number", example: 150000 },
                      monthlyAnalysis: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            month: { type: "string", example: "Jan" },
                            amount: { type: "number", example: 12000 },
                          },
                        },
                      },
                      growthVelocity: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            month: { type: "string", example: "Jan" },
                            totalVendors: { type: "integer", example: 5 },
                          },
                        },
                      },
                      topVendorsRevenue: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: {
                              type: "string",
                              example: "City Core Parking",
                            },
                            value: { type: "number", example: 50000 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            500: { description: "Dashboard Error" },
          },
        },
      },

      // ─── Revenue ───
      "/admin/getRevenue": {
        get: {
          tags: ["Revenue"],
          summary: "Get revenue report for all vendors",
          description:
            "Returns total revenue and per-vendor revenue data with subscription status.",
          responses: {
            200: {
              description: "Revenue report retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      totalRevenueAllVendors: {
                        type: "number",
                        example: 150000,
                      },
                      vendorData: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            vendorId: { type: "string" },
                            amount: { type: "string", example: "5000" },
                            vendorName: {
                              type: "string",
                              example: "City Core Parking",
                            },
                            vendorEmail: {
                              type: "string",
                              example: "vendor@parking.com",
                            },
                            hasPaidSubscription: {
                              type: "boolean",
                              example: true,
                            },
                            paymentDate: {
                              type: "string",
                              format: "date-time",
                            },
                            expiryDate: { type: "string", format: "date-time" },
                            status: {
                              type: "string",
                              enum: ["Active", "Expiring Soon", "Overdue"],
                              example: "Active",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            500: { description: "Error fetching revenue" },
          },
        },
      },

      // ─── Send Reminder ───
      "/admin/send-reminder": {
        post: {
          tags: ["Revenue"],
          summary: "Send subscription reminder email to a vendor",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "vendorEmail",
                    "vendorName",
                    "expiryDate",
                    "status",
                    "vendorId",
                  ],
                  properties: {
                    vendorEmail: {
                      type: "string",
                      example: "vendor@parking.com",
                    },
                    vendorName: {
                      type: "string",
                      example: "City Core Parking",
                    },
                    expiryDate: { type: "string", format: "date-time" },
                    status: { type: "string", example: "Expiring Soon" },
                    vendorId: {
                      type: "string",
                      example: "664000000000000000000001",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Reminder sent successfully" },
            500: { description: "Failed to send reminder" },
          },
        },
      },

      // ─── Vendor Management ───
      "/admin/vendor-management": {
        get: {
          tags: ["Vendor Management"],
          summary: "Get all vendors with their location details",
          responses: {
            200: {
              description: "Vendor management data retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        vendorId: { type: "string" },
                        name: { type: "string", example: "City Core Parking" },
                        email: {
                          type: "string",
                          example: "vendor@parking.com",
                        },
                        phone: { type: "string", example: "9876543210" },
                        status: { type: "string", example: "ACTIVE" },
                        isVerified: { type: "boolean", example: true },
                        createdAt: { type: "string", format: "date-time" },
                        locationDetails: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              locationName: {
                                type: "string",
                                example: "City Center Parking",
                              },
                              locationId: { type: "string" },
                              approvalStatus: {
                                type: "string",
                                example: "approved",
                              },
                              bikePrice: { type: "number", example: 20 },
                              carPrice: { type: "number", example: 50 },
                              capacity: {
                                type: "object",
                                properties: {
                                  twoWheeler: { type: "integer", example: 50 },
                                  fourWheeler: { type: "integer", example: 30 },
                                },
                              },
                              amenities: {
                                type: "array",
                                items: { type: "string" },
                                example: ["CCTV", "EV Charging"],
                              },
                              isActive: { type: "boolean", example: true },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            500: { description: "Error fetching vendor management data" },
          },
        },
      },

      // ─── Update Vendor Approval Status ───
      "/admin/update-status/{vendorId}": {
        patch: {
          tags: ["Vendor Management"],
          summary: "Update vendor parking location approval status",
          parameters: [
            {
              name: "vendorId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "The vendor's user ID",
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
                    status: {
                      type: "string",
                      enum: ["approved", "rejected", "pending"],
                      example: "approved",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Status updated successfully" },
            404: { description: "No parking location found for this vendor" },
            500: { description: "Error updating status" },
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
    "/api-docs/admin",
    swaggerUi.serveFiles(swaggerSpec),
    swaggerUi.setup(swaggerSpec),
  );
  console.log("Swagger docs available at /api-docs/admin for ADMIN");
}

export default swaggerSpec;
