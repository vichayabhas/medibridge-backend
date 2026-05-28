/**
 * Express App Setup with Daily.co Integration
 * 
 * This file sets up your Express backend to serve
 * the telemedicine routes and Daily.co API integration.
 */

import "./env";

import express from "express";
import cors from "cors";
import { initializeDailyCoClient } from "./services/daily-co";
import { createTeleMedicineRouter } from "./routes/telemedicine";
import { bookingsRouter } from "./routes/bookings";
import pharmacistsRouter from "./routes/pharmacists";

/**
 * Initialize Express app
 */
const app = express();

/**
 * Middleware
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Initialize Daily.co client
 */
let dailyClient;
try {
  dailyClient = initializeDailyCoClient();
  console.log("✅ Daily.co client initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Daily.co client:", error);
  process.exit(1);
}

/**
 * Mount telemedicine routes
 */
app.use("/api/telemedicine", createTeleMedicineRouter(dailyClient));
app.use("/api/bookings", bookingsRouter);
app.use("/api/pharmacists", pharmacistsRouter);

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    dailyCoStatus: dailyClient ? "connected" : "disconnected",
  });
});

/**
 * Error handling middleware
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/**
 * Start server
 */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📹 Telemedicine API at http://localhost:${PORT}/api/telemedicine`);
});
