import mongoose from "mongoose";
import { dataId } from "../controllers/setup";
import { consultationStatuses } from "./interface";
import { UnifiedModel } from "./ModelFactory";

const schema = new mongoose.Schema({
  triageSessionId: dataId,
  userId: dataId,
  pharmacistId: dataId,
  pharmacyId: dataId,
  status: {
    type: String,
    enum: consultationStatuses,
    default: "waiting",
  },
  messages: mongoose.Schema.Types.Mixed,
  approvedProducts: {
    type: Array,
    default: [],
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
export default new UnifiedModel(mongoose.model("Consultation", schema));