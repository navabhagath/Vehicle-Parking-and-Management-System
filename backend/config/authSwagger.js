import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Parking Management - Auth API",
      version: "1.0.0",
      description:
        "API documentation for the Parking Management System (Authentication Module)",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development server",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "664000000000000000000001" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            phone: { type: "string", example: "+919876543210" },
            role: {
              type: "string",
              enum: ["VENDOR", "CUSTOMER", "SUPER_ADMIN"],
              example: "VENDOR",
            },
            accountStatus: {
              type: "string",
              enum: ["ACTIVE", "SUSPENDED", "QUIT"],
              example: "ACTIVE",
            },
            isVerified: { type: "boolean", example: true },
            hasPaidSubscription: { type: "boolean", example: true },
            permissions: {
              type: "array",
              items: { type: "string" },
              example: ["create_location", "view_analytics"],
            },
          },
        },
      },
    },
    paths: {
      // ─── Vendor Registration ───
      "/vendor/register": {
        post: {
          tags: ["Vendor Auth"],
          summary: "Register a new vendor",
          description:
            "Creates a new vendor account along with a wallet and initial revenue record.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "phone", "password"],
                  properties: {
                    name: { type: "string", example: "City Core Parking" },
                    email: { type: "string", example: "vendor@parking.com" },
                    phone: { type: "string", example: "9876543210" },
                    password: { type: "string", example: "Vendor@123" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Vendor registered successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example: "Vendor registration Successfull",
                      },
                      data: {
                        type: "object",
                        properties: {
                          user: { $ref: "#/components/schemas/User" },
                          wallet: { type: "object" },
                          revenue: { type: "object" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description:
                "Validation error (missing fields or short password)",
            },
            409: {
              description: "Email or phone already exists",
            },
          },
        },
      },

      // ─── Vendor Login ───
      "/vendor/login": {
        post: {
          tags: ["Vendor Auth"],
          summary: "Vendor login",
          description:
            "Authenticates a vendor using email and password. Returns a JWT token (1h expiry).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "vendor@parking.com" },
                    password: { type: "string", example: "Vendor@123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Login Successfull" },
                      data: {
                        type: "object",
                        properties: {
                          token: {
                            type: "string",
                            example: "eyJhbGciOiJIUzI1...",
                          },
                          user: { $ref: "#/components/schemas/User" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Missing fields or invalid credentials",
            },
            403: {
              description: "Account suspended or closed",
            },
          },
        },
      },

      // ─── Super Admin Login ───
      "/super_admin/login": {
        post: {
          tags: ["Admin Auth"],
          summary: "Super admin login",
          description:
            "Authenticates a super admin using email and password. Returns a JWT token (1h expiry).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "admin@parking.com" },
                    password: { type: "string", example: "Admin@123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Login Successfull" },
                      data: {
                        type: "object",
                        properties: {
                          token: {
                            type: "string",
                            example: "eyJhbGciOiJIUzI1...",
                          },
                          user: { $ref: "#/components/schemas/User" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Missing fields or invalid credentials",
            },
            403: {
              description: "Account suspended or closed",
            },
          },
        },
      },

      // ─── Customer Request OTP ───
      "/customer/request-otp": {
        post: {
          tags: ["Customer Auth"],
          summary: "Request OTP for customer login",
          description:
            "Sends an OTP via SMS to the customer's phone number. In non-production, the OTP is also returned in the response as `devCode`.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["phone"],
                  properties: {
                    phone: { type: "string", example: "9876543210" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "OTP sent successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example: "OTP sent successfully",
                      },
                      devCode: {
                        type: "string",
                        example: "1234",
                        description: "Only returned in non-production",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Invalid phone number",
            },
          },
        },
      },

      // ─── Customer Verify OTP & Login ───
      "/customer/verify-otp": {
        post: {
          tags: ["Customer Auth"],
          summary: "Verify OTP and login/register customer",
          description:
            "Verifies the OTP. If the customer does not exist, a new account is created automatically. Returns a JWT token (7d expiry).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["phone", "otp"],
                  properties: {
                    phone: { type: "string", example: "9876543210" },
                    otp: { type: "string", example: "1234" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Verified successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example: "Verified successfully",
                      },
                      data: {
                        type: "object",
                        properties: {
                          token: {
                            type: "string",
                            example: "eyJhbGciOiJIUzI1...",
                          },
                          user: { $ref: "#/components/schemas/User" },
                          isNewUser: { type: "boolean", example: false },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Missing fields or invalid/expired OTP",
            },
            403: {
              description: "Account suspended or closed",
            },
          },
        },
      },

      // ─── Forgot Password (Request Reset OTP) ───
      "/forgot-password": {
        post: {
          tags: ["Password Reset"],
          summary: "Request password reset OTP",
          description:
            "Sends a password reset OTP to the vendor/admin's email address.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "role"],
                  properties: {
                    email: { type: "string", example: "vendor@parking.com" },
                    role: {
                      type: "string",
                      enum: ["VENDOR", "SUPER_ADMIN"],
                      example: "VENDOR",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "OTP sent to email",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example: "OTP sent to your email",
                      },
                      devCode: {
                        type: "string",
                        example: "5678",
                        description: "Only returned in non-production",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Missing fields or invalid role",
            },
            404: {
              description: "No account found with this email and role",
            },
          },
        },
      },

      // ─── Verify Reset OTP ───
      "/verify-reset-otp": {
        post: {
          tags: ["Password Reset"],
          summary: "Verify password reset OTP",
          description:
            "Validates the OTP and returns a short-lived reset token (15 min) to authorize the password change.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "otp", "role"],
                  properties: {
                    email: { type: "string", example: "vendor@parking.com" },
                    otp: { type: "string", example: "5678" },
                    role: {
                      type: "string",
                      enum: ["VENDOR", "SUPER_ADMIN"],
                      example: "VENDOR",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "OTP verified, reset token issued",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example:
                          "OTP verified successfully. Proceed to reset password.",
                      },
                      resetToken: {
                        type: "string",
                        example: "eyJhbGciOiJIUzI1...",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Missing fields or invalid/expired OTP",
            },
          },
        },
      },

      // ─── Reset Password ───
      "/reset-password": {
        post: {
          tags: ["Password Reset"],
          summary: "Reset user password",
          description:
            "Sets a new password using the reset token obtained from the verify-reset-otp step.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["resetToken", "newPassword"],
                  properties: {
                    resetToken: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1...",
                    },
                    newPassword: { type: "string", example: "NewVendor@123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Password reset successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example: "Password has been reset successfully.",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Missing fields",
            },
            401: {
              description: "Expired or invalid reset token",
            },
            404: {
              description: "User not found",
            },
          },
        },
      },

      // ─── Check Email Availability ───
      "/check-email": {
        get: {
          tags: ["Availability"],
          summary: "Check if an email is available",
          description:
            "Returns whether the given email address is already registered.",
          parameters: [
            {
              name: "email",
              in: "query",
              required: true,
              schema: { type: "string", example: "vendor@parking.com" },
            },
          ],
          responses: {
            200: {
              description: "Availability result",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      available: { type: "boolean", example: true },
                    },
                  },
                },
              },
            },
            400: {
              description: "Email is required",
            },
          },
        },
      },

      // ─── Check Phone Availability ───
      "/check-phone": {
        get: {
          tags: ["Availability"],
          summary: "Check if a phone number is available",
          description:
            "Returns whether the given phone number is already registered. Accepts raw 10-digit or +91-prefixed format.",
          parameters: [
            {
              name: "phone",
              in: "query",
              required: true,
              schema: { type: "string", example: "9876543210" },
            },
          ],
          responses: {
            200: {
              description: "Availability result",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      available: { type: "boolean", example: true },
                    },
                  },
                },
              },
            },
            400: {
              description: "Phone is required",
            },
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
    "/api-docs/auth",
    swaggerUi.serveFiles(swaggerSpec),
    swaggerUi.setup(swaggerSpec),
  );
  console.log("Swagger docs available at /api-docs/auth for AUTH");
}

export default swaggerSpec;
