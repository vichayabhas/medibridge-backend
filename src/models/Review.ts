import mongoose from "mongoose";
import { dataId, dataString, reqNumber } from "../controllers/setup";
import { reviewTargetTypes } from "./interface";
import { UnifiedModel } from "./ModelFactory";

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

export default new UnifiedModel(mongoose.model("Review", schema));