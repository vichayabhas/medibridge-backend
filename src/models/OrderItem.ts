import mongoose from "mongoose";
import {
  dataId,
  dataString,
  dataStringDefault,
  reqNumber,
} from "../controllers/setup";
import { UnifiedModel } from "../moduleSupport/ModelFactory";

const schema = new mongoose.Schema({
  orderId: dataId,
  productId: dataId,
  name: dataString,
  quantity: reqNumber,
  price: reqNumber,
  instructions: dataStringDefault,
});
export const model = mongoose.model("OrderItem", schema);
export default new UnifiedModel(model);
