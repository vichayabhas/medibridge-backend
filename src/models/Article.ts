import mongoose from "mongoose";
import {
  dataString,
  dataId,
  getDefaultBoolean,
  arrayString,
  dataNumber,
} from "../controllers/setup";
import { articleStatuses } from "../moduleSupport/interface";
import { UnifiedModel } from "../moduleSupport/ModelFactory";

const schema = new mongoose.Schema({
  title: dataString,
  category: dataString,
  coverImage: dataString,
  excerpt: dataString,
  body: dataString,
  authorId: dataId,
  isAIGenerated: getDefaultBoolean(false),
  tags: arrayString,
  views: dataNumber,
  status: {
    type: String,
    enum: articleStatuses,
    default: "pending",
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
export const model = mongoose.model("Article", schema);
export default new UnifiedModel(model);
