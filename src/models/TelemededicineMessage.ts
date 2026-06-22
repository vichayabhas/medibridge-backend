import mongoose from "mongoose";
import { dataId, dataString } from "../controllers/setup";
import { senderTypes } from "./interface";
import { UnifiedModel } from "./ModelFactory";

const schema = new mongoose.Schema({
  handoffId: dataId,
  senderType: {
    type: String,
    enum: senderTypes,
    required: true,
  },
  senderName: dataString,
  content: dataString,
  messageType: {
    type: String,
    default: "text",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default new UnifiedModel(mongoose.model("TelemedicineMessage", schema));