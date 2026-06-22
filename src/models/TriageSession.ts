import mongoose from "mongoose";
import { dataId, arrayString, getDefaultBoolean } from "../controllers/setup";
import { triageStatuses } from "../moduleSupport/interface";
import { UnifiedModel } from "../moduleSupport/ModelFactory";

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
export const model = mongoose.model("TriageSession", schema);
export default new UnifiedModel(model);
