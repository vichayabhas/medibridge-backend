/**
 * Telemedicine API Routes
 * 
 * Express endpoints for managing telemedicine sessions
 * including room creation, updates, and completion.
 * 
 * Place this in your backend routes (e.g., src/server/routes/telemedicine.ts)
 */

import { Request, Response } from "express";
import { Router } from "express";
import { DailyCoClient } from "../services/daily-co";

/**
 * Create telemedicine router
 */
export function createTeleMedicineRouter(dailyClient: DailyCoClient): Router {
  const router = Router();

  /**
   * POST /api/telemedicine/create-room
   * 
   * Creates a new Daily.co room for a telemedicine session
   * 
   * Request body:
   * {
   *   "taskId": "TM-25001",
   *   "pharmacistName": "Dr. Sarah",
   *   "expiresInHours": 2,
   *   "enableRecording": false
   * }
   * 
   * Response:
   * {
   *   "success": true,
   *   "roomUrl": "https://your-domain.daily.co/pharma-tm-25001-1234567890",
   *   "roomId": "abc123",
   *   "expiresAt": "2026-05-13T08:24:51.000Z"
   * }
   */
  router.post('/create-room',async(req,res)=>{
    try {
      const { taskId, pharmacistName, expiresInHours = 2, enableRecording = false } =
        req.body;

      // Validate required fields
      if (!taskId || !pharmacistName) {
         res.status(400).json({
          success: false,
          message: "Missing required fields: taskId, pharmacistName",
        });
        return
      }
      // Validate pharmacist permission (in real app, check auth)
      // const user = req.user; // From auth middleware
      // if (user.role !== 'pharmacist') {
      //   return res.status(403).json({ success: false, message: 'Not authorized' });
      // }
      // Create room via Daily.co API
      const room = await dailyClient.createTeleMedicineRoom(taskId, {
        maxParticipants: 2,
        expiresInHours,
        enableRecording,
      });

      res.json(room);
    } catch (error) {
      const err = error as Error;
      console.error("Error creating telemedicine room:", err.message);
      res.status(500).json({
        success: false,
        message: "Failed to create room",
        error: err.message,
      });
    }
  })
  router.post("/create-room",  async(req, res) => {
    try {
      const { taskId, pharmacistName, expiresInHours = 2, enableRecording = false } =
        req.body;

      // Validate required fields
      if (!taskId || !pharmacistName) {
         res.status(400).json({
          success: false,
          message: "Missing required fields: taskId, pharmacistName",
        });
        return
      }

      // Validate pharmacist permission (in real app, check auth)
      // const user = req.user; // From auth middleware
      // if (user.role !== 'pharmacist') {
      //   return res.status(403).json({ success: false, message: 'Not authorized' });
      // }

      // Create room via Daily.co API
      const room = await dailyClient.createTeleMedicineRoom(taskId, {
        maxParticipants: 2,
        expiresInHours,
        enableRecording,
      });

      res.json(room);
    } catch (error) {
      const err = error as Error;
      console.error("Error creating telemedicine room:", err.message);
      res.status(500).json({
        success: false,
        message: "Failed to create room",
        error: err.message,
      });
    }
  });

  /**
   * GET /api/telemedicine/rooms
   * 
   * List all active telemedicine rooms
   * (Admin/Pharmacist only)
   */
  router.get("/rooms", async (req: Request, res: Response) => {
    try {
      const rooms = await dailyClient.listRooms();
      const telemedicineRooms = rooms.filter((room) =>
        room.name.startsWith("pharma-")
      );

      res.json({
        success: true,
        count: telemedicineRooms.length,
        rooms: telemedicineRooms,
      });
    } catch (error) {
      const err = error as Error;
      console.error("Error listing rooms:", err.message);
      res.status(500).json({
        success: false,
        message: "Failed to list rooms",
        error: err.message,
      });
    }
  });

  /**
   * DELETE /api/telemedicine/rooms/:roomId
   * 
   * Delete a telemedicine room (after session ends)
   */
  router.delete("/rooms/:roomId", async (req: Request, res: Response) => {
    try {
      const roomId = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;

      if (!roomId) {
         res.status(400).json({
          success: false,
          message: "Room ID is required",
        });
        return
      }

      await dailyClient.deleteRoom(roomId);

      res.json({
        success: true,
        message: "Room deleted successfully",
      });
    } catch (error) {
      const err = error as Error;
      console.error("Error deleting room:", err.message);
      res.status(500).json({
        success: false,
        message: "Failed to delete room",
        error: err.message,
      });
    }
  });

  /**
   * POST /api/telemedicine/session-complete
   * 
   * Mark a telemedicine session as complete
   * This endpoint would update your database and clean up Daily.co resources
   */
  router.post("/session-complete", async (req: Request, res: Response) => {
    try {
      const { taskId, roomId } = req.body;

      if (!taskId || !roomId) {
         res.status(400).json({
          success: false,
          message: "Missing required fields: taskId, roomId",
        });
        return
      }

      // TODO: Update your database to mark task as completed
      // const task = await updateTelemedicineTask(taskId, {
      //   status: 'completed',
      //   endTime: new Date(),
      //   duration,
      //   notes
      // });

      // Clean up Daily.co room
      await dailyClient.deleteRoom(roomId);

      res.json({
        success: true,
        message: "Session completed and room cleaned up",
      });
    } catch (error) {
      const err = error as Error;
      console.error("Error completing session:", err.message);
      res.status(500).json({
        success: false,
        message: "Failed to complete session",
        error: err.message,
      });
    }
  });

  return router;
}
