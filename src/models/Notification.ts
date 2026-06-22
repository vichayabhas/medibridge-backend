import mongoose from "mongoose";
import { dataString, getDefaultBoolean } from "../controllers/setup";
import { notificationTypes } from "./interface";
import { UnifiedModel } from "./ModelFactory";

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

export default new UnifiedModel(mongoose.model("Notification", schema));