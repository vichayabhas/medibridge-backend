import mongoose from "mongoose";
import { dataId, getDefaultBoolean } from "../controllers/setup";
import { UnifiedModel } from "../moduleSupport/ModelFactory";

const schema = new mongoose.Schema({
  userId: dataId,
  name: {
    type: String,
    default: "กระดานข้อมูล",
  },
  isDefault: getDefaultBoolean(false),
  // fields: mongoose.Schema.Types.Mixed,
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});
export const model = mongoose.model("PatientClipboard", schema);
export default new UnifiedModel(model);
