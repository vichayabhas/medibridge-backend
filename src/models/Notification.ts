import mongoose from "mongoose";
import { dataString, getDefaultBoolean } from "../controllers/setup";
import { notificationTypes } from "../moduleSupport/interface";
import { UnifiedModel } from "../moduleSupport/ModelFactory";

const schema = new mongoose.Schema({
  userId: dataString,
  type: {
    type: String,
    enum: notificationTypes,
    required: true,
  },
  title: dataString,
  message: dataString,
  read: getDefaultBoolean(false),
  actionUrl: dataString,
  createAt: {
    type: Date,
    default: Date.now,
  },
});
export const model = mongoose.model("Notification", schema);
export default new UnifiedModel(model);
