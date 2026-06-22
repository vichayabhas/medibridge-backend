import mongoose from "mongoose";
import {
  dataId,
  dataString,
  reqNumber,
  getDefaultBoolean,
  dataNumber,
  arrayString,
} from "../controllers/setup";
import { UnifiedModel } from "../moduleSupport/ModelFactory";

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
export const model = mongoose.model("Product", schema);
export default new UnifiedModel(model);
