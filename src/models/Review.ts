import mongoose from "mongoose";
import { dataId, dataString, reqNumber } from "../controllers/setup";
import { reviewTargetTypes } from "../moduleSupport/interface";
import { UnifiedModel } from "../moduleSupport/ModelFactory";

const schema = new mongoose.Schema({
  userId: dataId,
  userName: dataString,
  targetType: {
    type: String,
    enum: reviewTargetTypes,
    required: true,
  },
  targetId: dataId,
  consultationId: dataId,
  rating: reqNumber,
  comment: dataString,
  createAt: {
    type: Date,
    default: Date.now,
  },
});
export const model = mongoose.model("Review", schema);
export default new UnifiedModel(model);
