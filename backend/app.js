import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import adminDashboardRouter from "./routes/admin/adminDashboardRoutes.js";
import allRoutes from "./routes/index.js";
import authRoutes from "./routes/auth/authRoutes.js";
import vendorRouter from "./routes/vendor/index.js";
import { setupSwagger } from "./config/swagger.js";
import { setupSwagger as customerSetupSwagger } from "./config/customerSwagger.js";
import { setupSwagger as authSetupSwagger } from "./config/authSwagger.js";
import { setupSwagger as adminSetupSwagger } from "./config/adminSwagger.js";
import { setupSwagger as bookingSetupSwagger } from "./config/bookingSwagger.js";
import { verifyToken } from "./middlewares/authMiddleware.js";
import path from "path";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }),
);

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

setupSwagger(app);
customerSetupSwagger(app);
authSetupSwagger(app);
adminSetupSwagger(app);
bookingSetupSwagger(app);


app.use("", authRoutes);
app.use("/api", verifyToken ,allRoutes);
app.use("/api/vendor", verifyToken, vendorRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;