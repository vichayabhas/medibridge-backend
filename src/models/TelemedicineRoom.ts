import mongoose from "mongoose";
import {
  dataId,
  dataString,
  getDefaultBoolean,
} from "../controllers/setup";
import { consultationStatuses } from "./interface";

const schema = new mongoose.Schema({
  taskId: dataId,
  handoffId: dataId,
  roomId: dataId,
  roomUrl: dataString,
  pharmacistName: dataString,
  expiresAt: Date,
  enableRecording: getDefaultBoolean(false),
  maxParticipants: {
    type: Number,
    default: 2,
  },
  status: {
    type: String,
    default: "active",
    enum: consultationStatuses,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("TelemedicineRoom", schema);
