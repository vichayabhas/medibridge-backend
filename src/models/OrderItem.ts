import mongoose from "mongoose";
import {
  dataId,
  dataString,
  dataStringDefault,
  reqNumber,
} from "../controllers/setup";
import { UnifiedModel } from "./ModelFactory";

const schema = new mongoose.Schema({
  orderId: dataId,
  productId: dataId,
  name: dataString,
  quantity: reqNumber,
  price: reqNumber,
  instructions: dataStringDefault,
});

export default new UnifiedModel(mongoose.model("OrderItem", schema));