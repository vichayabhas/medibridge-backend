import mongoose from "mongoose";
import {
  dataId,
  dataString,
  dataStringDefault,
  reqNumber,
} from "../controllers/setup";

const schema = new mongoose.Schema({
  orderId: dataId,
  productId: dataId,
  name: dataString,
  quantity: reqNumber,
  price: reqNumber,
  instructions: dataStringDefault,
});

export default mongoose.model("OrderItem", schema);
