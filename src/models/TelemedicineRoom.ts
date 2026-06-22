import mongoose from "mongoose";
import { dataId, dataString, getDefaultBoolean } from "../controllers/setup";
import { consultationStatuses } from "../moduleSupport/interface";
import { UnifiedModel } from "../moduleSupport/ModelFactory";

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
export const model = mongoose.model("TelemedicineRoom", schema);
export default new UnifiedModel(model);
