import mongoose from "mongoose";
import { dataId, arrayString, getDefaultBoolean } from "../controllers/setup";
import { triageStatuses } from "./interface";

const schema = new mongoose.Schema({
  userId: dataId,
  symptoms: mongoose.Schema.Types.Mixed,
  redFlags: arrayString,
  hasRedFlag: getDefaultBoolean(false),
  summary: mongoose.Schema.Types.Mixed,
  status: {
    type: String,
    enum: triageStatuses,
    default: "in_progress",
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
export default mongoose.model("TriageSession", schema);
