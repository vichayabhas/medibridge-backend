import mongoose from "mongoose";
import {
  dataString,
  dataId,
  getDefaultBoolean,
  arrayString,
  dataNumber,
} from "../controllers/setup";
import { articleStatuses } from "./interface";
import { UnifiedModel } from "./ModelFactory";

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

export default new UnifiedModel(mongoose.model("Article", schema));
