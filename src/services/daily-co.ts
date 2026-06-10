/**
 * Daily.co API Integration Helper
 * 
 * Server-side utilities for creating and managing Daily.co rooms
 * for telemedicine sessions.
 * 
 * Place this in your backend (e.g., src/server/services/daily.ts or similar)
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
import type { AxiosInstance } from "axios";
import axios from "axios";
// function getErrorMessage(error: unknown): string {
//   if (error instanceof Error) return error.message;
//   return String(error);
// }
/**
 * Configuration for Daily.co API
 */

// interface CreateMeetingTokenPayload {
//   properties: {
//     room_name: string;
//     user_name: string;
//     user_id?: string;
//     exp?: number;
//     is_owner?: boolean;
//     start_video_off?: boolean;
//     start_audio_off?: boolean;
//     enable_screenshare?: boolean;
//     enable_recording?: boolean | "cloud" | "cloud-audio-only" | "local" | "raw-tracks";
//     eject_at_token_exp?: boolean;
//     close_tab_on_exit?: boolean;
//   };
// }
interface DailyConfig {
  apiKey: string;
  baseUrl?: string;
}

/**
 * Room creation request payload
 */
interface CreateRoomPayload {
  name: string;
  privacy: "public" | "private";
  properties?: {
    max_participants?: number;
    exp?: number;
    enable_chat?: boolean;
    enable_screenshare?: boolean;
    enable_recording?: boolean;
  };
}

/**
 * Daily.co room response
 */
interface DailyRoom {
  id: string;
  name: string;
  url: string;
  privacy: string;
  created_at: string;
  max_participants: number;
}

/**
 * Response for room creation endpoint
 */
export interface CreateRoomResponse {
  success: boolean;
  roomUrl: string;
  roomId: string;
  roomName: string;
  expiresAt?: string;
  message?: string;
}
export interface CreateMeetingTokenResponse {
  success: boolean;
  token: string;
}

/**
 * Daily.co API Client
 * 
 * Handles all communication with Daily.co REST API
 */
export class DailyCoClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: DailyConfig) {
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: config.baseUrl || "https://api.daily.co/v1",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Create a new Daily.co room for a telemedicine session
   *
   * @param taskId - Unique identifier for the telemedicine task
   * @param options - Additional room configuration
   * @returns Room URL and metadata
   *
   * @example
   * const dailyClient = new DailyCoClient({ apiKey: process.env.DAILY_API_KEY });
   * const room = await dailyClient.createTeleMedicineRoom("TM-25001");
   */
  async createTeleMedicineRoom(
    taskId: string,
    options: {
      maxParticipants?: number;
      expiresInHours?: number;
      enableRecording?: boolean;
    } = {}
  ): Promise<CreateRoomResponse> {
    try {
      const roomName = `pharma-${taskId}-${Date.now()}`;

      // Calculate expiration time if specified (as unix timestamp)
      let expiresAt: number | undefined;
      if (options.expiresInHours) {
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + options.expiresInHours);
        expiresAt = Math.floor(expirationDate.getTime() / 1000); // Unix timestamp
      }

      const payload: CreateRoomPayload = {
        name: roomName,
        privacy: "private", // Always private for medical sessions
        properties: {
          max_participants: options.maxParticipants || 2, // Pharmacist + Patient
          exp: expiresAt,
          enable_chat: false, // Use video only, no chat
          enable_screenshare: false, // Video call focused
          enable_recording: options.enableRecording || false,
        },
      };

      const response = await this.client.post<DailyRoom>("/rooms", payload);
      const room = response.data;

      return {
        success: true,
        roomUrl: room.url,
        roomId: room.id,
        roomName: room.name,
        expiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : undefined,
        message: "Room created successfully",
      };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any
      
      console.error("Failed to create Daily.co room:", {
        status: err.response?.status,
        message: err.response?.data?.error || err.message,
      });

      throw new Error(
        `Failed to create telemedicine room: ${
          err.response?.data?.error || err.message
        }`
      );
    }
  }
  /**
   * Create a meeting token for a private Daily room.
   */
  async createMeetingToken(
    roomName: string,
    options: {
      userName: string;
      userId?: string;
      expiresAt?: number;
      isOwner?: boolean;
      startVideoOff?: boolean;
      startAudioOff?: boolean;
      enableScreenshare?: boolean;
      enableRecording?: boolean | "cloud" | "cloud-audio-only" | "local" | "raw-tracks";
      closeTabOnExit?: boolean;
    }
  ): Promise<CreateMeetingTokenResponse> {
    try {
      const response = await this.client.post<{ token: string }>("/meeting-tokens", {
        properties: {
          room_name: roomName,
          user_name: options.userName,
          user_id: options.userId,
          exp: options.expiresAt,
          is_owner: options.isOwner ?? false,
          start_video_off: options.startVideoOff ?? false,
          start_audio_off: options.startAudioOff ?? false,
          enable_screenshare: options.enableScreenshare ?? false,
          enable_recording: options.enableRecording,
          eject_at_token_exp: true,
          close_tab_on_exit: options.closeTabOnExit ?? false,
        },
      });

      return {
        success: true,
        token: response.data.token,
      };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.error("Failed to create Daily meeting token:", {
        status: err.response?.status,
        message: err.response?.data?.error || err.message,
      });

      throw new Error(
        `Failed to create Daily meeting token: ${
          err.response?.data?.error || err.message
        }`
      );
    }
  }


  /**
   * Delete a Daily.co room
   *
   * @param roomId - ID of the room to delete
   */
  async deleteRoom(roomId: string): Promise<void> {
    try {
      await this.client.delete(`/rooms/${roomId}`);
    } catch (error) {
      const err = getErrorMessage(error)
      console.error("Failed to delete Daily.co room:", err);
      throw new Error(`Failed to delete room: ${err}`);
    }
  }

  /**
   * Get room details
   *
   * @param roomId - ID of the room
   */
  async getRoom(roomId: string): Promise<DailyRoom> {
    try {
      const response = await this.client.get<DailyRoom>(`/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      const err = getErrorMessage(error)
      console.error("Failed to fetch room details:", err);
      throw new Error(`Failed to fetch room: ${err}`);
    }
  }

  /**
   * List all rooms
   */
  async listRooms(): Promise<DailyRoom[]> {
    try {
      const response = await this.client.get<{ data: DailyRoom[] }>("/rooms");
      return response.data.data;
    } catch (error) {
      const err = getErrorMessage(error)
      console.error("Failed to list rooms:", err);
      throw new Error(`Failed to list rooms: ${err}`);
    }
  }
}

/**
 * Environment variables required for Daily.co integration
 * 
 * Add to your .env file:
 * 
 * DAILY_API_KEY=your_api_key_here
 * DAILY_BASE_URL=https://api.daily.co/v1  (optional, has default)
 */
export function initializeDailyCoClient(): DailyCoClient {
  const apiKey = process.env.DAILY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "DAILY_API_KEY environment variable is not set. Please add it to your .env file."
    );
  }

  return new DailyCoClient({
    apiKey,
    baseUrl: process.env.DAILY_BASE_URL,
  });
}
