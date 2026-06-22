import mongoose from "mongoose";
import { dataId, getDefaultBoolean } from "../controllers/setup";
import { UnifiedModel } from "./ModelFactory";

const schema = new mongoose.Schema({
  userId: dataId,
  name: {
    type: String,
    default: "กระดานข้อมูล",
  },
  isDefault: getDefaultBoolean(false),
  fields: mongoose.Schema.Types.Mixed,
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});

export default new UnifiedModel(mongoose.model("PatientClipboard", schema));