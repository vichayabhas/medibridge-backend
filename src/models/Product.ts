import mongoose from "mongoose";
import {
  dataId,
  dataString,
  reqNumber,
  getDefaultBoolean,
  dataNumber,
  arrayString,
} from "../controllers/setup";
import { UnifiedModel } from "./ModelFactory";

const schema = new mongoose.Schema({
  pharmacyId: dataId,
  name: dataString,
  genericName: dataString,
  category: dataString,
  description: dataString,
  price: reqNumber,
  imageUrl: dataString,
  dosageForm: dataString,
  strength: dataString,
  manufacturer: dataString,
  inStock: getDefaultBoolean(true),
  stockQuantity: dataNumber,
  warnings: arrayString,
  sideEffects: arrayString,
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});
export default new UnifiedModel(mongoose.model("Product", schema));