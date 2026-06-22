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
import TelemedicineRoom from "../models/TelemedicineRoom";
import PatientHandoff from "../models/PatientHandoff";
import { Id } from "../models/configTypes";

type TelemedicineRoomRecord = {
  taskId: Id;
  handoffId: Id;
  roomIdentifier: string;
  roomName: string;
  roomUrl: string;
  pharmacistName: string;
  expiresAt: Date | null;
  enableRecording: boolean;
};

const telemedicineRoomCache = new Map<string, TelemedicineRoomRecord>();

function deriveDailyRoomName(roomUrl?: string | null) {
  if (!roomUrl) {
    return null;
  }

  return roomUrl.replace(/^https?:\/\/[^/]+\//, "").replace(/\/?$/, "") || null;
}

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
  router.post("/create-room", async (req, res) => {
    try {
      const {
        taskId,
        pharmacistName,
        expiresInHours = 2,
        enableRecording = false,
      } = req.body;

      // Validate required fields
      if (!taskId || !pharmacistName) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: taskId, pharmacistName",
        });
        return;
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

      const expiresAt = room.expiresAt
        ? new Date(room.expiresAt)
        : null;

      const roomRow: TelemedicineRoomRecord = {
        taskId,
        handoffId: taskId,
        roomIdentifier: room.roomId,
        roomName: room.roomName,
        roomUrl: room.roomUrl,
        pharmacistName: pharmacistName,
         expiresAt,
         enableRecording,
      };
      const telemedicineRoom = await TelemedicineRoom.findOne({ taskId });
      if (telemedicineRoom) {
        await telemedicineRoom.updateOne({
          roomIdentifier: room.roomId,
          roomUrl: room.roomUrl,
          pharmacistName,
          expiresAt,
          enableRecording,
        });
      }else{const newRoom=
        await TelemedicineRoom.create({
          handoffId: taskId,
          roomIdentifier: room.roomId,
          roomUrl: room.roomUrl,
          pharmacistName,
          expiresAt,
          enableRecording,
        });
        await PatientHandoff.findByIdAndUpdate(taskId,{telemedicineRoomId:newRoom._id})
      }

      telemedicineRoomCache.set(taskId, roomRow);

      // let { error: upsertError } = await supabase
      //   .from("telemedicine_rooms")
      //   .upsert(roomRow, {
      //     onConflict: "task_id",
      //   });

      // if (upsertError && /room_name|column/i.test(upsertError.message)) {
      //   console.warn(
      //     "telemedicine_rooms schema is missing room_name; retrying without it",
      //   );
      //   const legacyRoomRow = {
      //     task_id: taskId,
      //     handoff_id: taskId,
      //     room_id: room.roomId,
      //     room_url: room.roomUrl,
      //     pharmacist_name: pharmacistName,
      //     expires_at: expiresAt,
      //     enable_recording: enableRecording,
      //   };

      //   const retry = await supabase
      //     .from("telemedicine_rooms")
      //     .upsert(legacyRoomRow, {
      //       onConflict: "task_id",
      //     });
      //   upsertError = retry.error;
      // }

      // if (upsertError) {
      //   console.warn(
      //     "Failed saving telemedicine room to Supabase; using in-memory fallback",
      //     upsertError,
      //   );
      // }

      res.json({
        ...room,
        persisted:true,
      });
      return;
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
  router.post("/create-room", async (req, res) => {
    try {
      const {
        taskId,
        pharmacistName,
        expiresInHours = 2,
        enableRecording = false,
      } = req.body;

      // Validate required fields
      if (!taskId || !pharmacistName) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: taskId, pharmacistName",
        });
        return;
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
        room.name.startsWith("pharma-"),
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
   * GET /api/telemedicine/rooms/by-handoff/:handoffId
   *
   * Returns the Daily room URL for a handoff.
   */
  router.get(
    "/rooms/by-handoff/:handoffId",
    async (req: Request, res: Response) => {
      try {
        const handoffId = Array.isArray(req.params.handoffId)
          ? req.params.handoffId[0]
          : req.params.handoffId;

        if (!handoffId) {
          res
            .status(400)
            .json({ success: false, message: "Handoff ID is required" });
          return;
        }

        const  data = await TelemedicineRoom.findOne({handoffId
          
        })
          // .from("telemedicine_rooms")
          // .select("room_url, room_name, pharmacist_name, expires_at")
          // .eq("handoff_id", handoffId)
          // .order("created_at", { ascending: false })
          // .limit(1)
          // .maybeSingle();

        // if (error) {
        //   console.error("Failed fetching telemedicine room by handoff", error);
        //   res
        //     .status(500)
        //     .json({
        //       success: false,
        //       message: "Failed to fetch room",
        //       error: error.message,
        //     });
        //   return;
        // }

        const cached = telemedicineRoomCache.get(handoffId);
        res.json({
          success: true,
          roomUrl: data?.roomIdentifier ?? cached?.roomUrl ?? null,
        });
        return;
      } catch (error) {
        const err = error as Error;
        console.error("Error fetching room by handoff:", err.message);
        res
          .status(500)
          .json({
            success: false,
            message: "Failed to fetch room",
            error: err.message,
          });
        return;
      }
    },
  );

  /**
   * POST /api/telemedicine/meeting-token
   *
   * Creates a meeting token for a participant joining a private Daily room.
   */
  router.post("/meeting-token", async (req: Request, res: Response) => {
    try {
      const {
        handoffId,
        participantName,
        role = "patient",
        audioOnly = false,
      } = req.body as {
        handoffId?: string;
        participantName?: string;
        role?: "patient" | "pharmacist";
        audioOnly?: boolean;
      };

      if (!handoffId) {
        res
          .status(400)
          .json({ success: false, message: "Handoff ID is required" });
        return;
      }


        const room=await TelemedicineRoom.findOne({handoffId})

      

      const cached = telemedicineRoomCache.get(handoffId);

      if (!room?.roomUrl && !cached?.roomUrl) {
        res
          .status(404)
          .json({ success: false, message: "Room not found for handoff" });
        return;
      }

      const source = room ?? cached;
      const roomName =
        (source as Partial<TelemedicineRoomRecord> | undefined)?.roomName ||
        deriveDailyRoomName(source?.roomIdentifier?.toString());

      if (!roomName) {
        res
          .status(500)
          .json({
            success: false,
            message: "Failed to derive Daily room name",
          });
        return;
      }

      const userName =
        participantName?.trim() ||
        source?.pharmacistName ||
        (role === "pharmacist" ? "เภสัชกร" : "ผู้ป่วย");
      const expiresAt = source?.expiresAt
        ? Math.floor(new Date(source.expiresAt).getTime() / 1000)
        : undefined;

      const token = await dailyClient.createMeetingToken(roomName, {
        userName,
        isOwner: role === "pharmacist",
        startVideoOff: audioOnly,
        startAudioOff: false,
        enableScreenshare: false,
        enableRecording: false,
        expiresAt,
        closeTabOnExit: false,
      });

       res.json({
        success: true,
        token: token.token,
        roomUrl: source?.roomUrl,
        roomName,
        expiresAt: source?.expiresAt,
      });
      return
    } catch (error) {
      const err = error as Error;
      console.error("Error creating meeting token:", err.message);
       res
        .status(500)
        .json({
          success: false,
          message: "Failed to create meeting token",
          error: err.message,
        });
        return
    }
  });

  /**
   * DELETE /api/telemedicine/rooms/:roomId
   *
   * Delete a telemedicine room (after session ends)
   */
  router.delete("/rooms/:roomId", async (req: Request, res: Response) => {
    try {
      const roomId = Array.isArray(req.params.roomId)
        ? req.params.roomId[0]
        : req.params.roomId;

      if (!roomId) {
        res.status(400).json({
          success: false,
          message: "Room ID is required",
        });
        return;
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
        return;
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
