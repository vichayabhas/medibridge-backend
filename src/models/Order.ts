import mongoose from "mongoose";
import { dataId, dataNumber, dataString } from "../controllers/setup";
import { fulfillmentTypes, orderStatuses } from "./interface";

const schema = new mongoose.Schema({
  consultationId: dataId,
  userId: dataId,
  pharmacyId: dataId,
  pharmacistId: dataId,
  fulfillment: {
    type: String,
    enum: fulfillmentTypes,
    required: true,
  },
  status: {
    type: String,
    enum: orderStatuses,
    default: "pending",
  },
  subtotal: dataNumber,
  deliveryFee: dataNumber,
  total: dataNumber,
  otpCode: dataString,
  estimatedTime: dataString,
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", schema);
