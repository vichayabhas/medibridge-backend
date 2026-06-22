import mongoose from "mongoose";
import {
  dataId,
  dataString,
  getDefaultBoolean,
} from "../controllers/setup";
import { consultationStatuses } from "./interface";
import { UnifiedModel } from "./ModelFactory";

const schema = new mongoose.Schema({
  taskId: dataId,
  handoffId: dataId,
  roomIdentifier: dataString,
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

export default new UnifiedModel(mongoose.model("TelemedicineRoom", schema));