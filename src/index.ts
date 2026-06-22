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
import connectDB from "./db";
import user from "./routes/user";
import main from "./routes/main";
import patientHandoff from "./routes/patientHandoff";
import { Server } from "socket.io";
import { socketEvents } from "./moduleSupport/interface";
import { createServer } from "http";
import article from "./routes/article";
import order from "./routes/order";

/**
 * Initialize Express app
 */
const app = express();

/**
 * Middleware
 */
// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:5174",
//   "http://localhost:3000",
//   ...(process.env.FRONTEND_URL
//     ? process.env.FRONTEND_URL.split(",").map((u) => u.trim())
//     : []),
// ];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, health checks, mobile apps)
      // if (!origin) return callback(null, true);
      // if (allowedOrigins.includes(origin)) return callback(null, true);
      // callback(new Error(`CORS: origin ${origin} not allowed`));
      return callback(null, true);
    },
    credentials: true,
  }),
);
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
connectDB();
/**
 * Mount telemedicine routes
 */
app.use("/api/telemedicine", createTeleMedicineRouter(dailyClient));
app.use("/api/bookings", bookingsRouter);
app.use("/api/pharmacists", pharmacistsRouter);
app.use("/api/v1/auth", user);
app.use("/main", main);
app.use("/patientHandoff", patientHandoff);
app.use("/article", article);
app.use("/order", order);
app.get("/", (req, res) => {
  res.send("<div>this backend is ready to connect to frontend</div>");
});
// app
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

// /**
//  * Error handling middleware
//  */
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// app.use((err: any, req: express.Request, res: express.Response) => {
//   console.error("Server error:", err);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal server error",
//   });
// });

/**
 * Start server
 */
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: '*' },
});
io.on("connection", (socket) => {
  socketEvents.map((v) => {
    socket.on(`${v}Send`, (a, b) => {
      io.emit(v, a, b);
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(
    `📹 Telemedicine API at http://localhost:${PORT}/api/telemedicine`,
  );
});
