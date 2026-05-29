import mongoose from "mongoose";
import {
  dataString,
  reqNumber,
  dataNumber,
  arrayString,
  getDefaultBoolean,
  dataId,
} from "../controllers/setup";
import { verificationStatuses } from "./interface";

const schema = new mongoose.Schema({
  name: dataString,
  address: dataString,
  latitude: reqNumber,
  longitude: reqNumber,
  phone: dataString,
  openingHours: mongoose.Schema.Types.Mixed,
  verificationStatus: {
    type: String,
    enum: verificationStatuses,
    default: "pending",
  },
  rating: dataNumber,
  reviewCount: dataNumber,
  imageUrl: dataString,
  services: arrayString,
  hasDelivery: getDefaultBoolean(false),
  managerId: dataId,
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});
export default mongoose.model("Pharmacy", schema);
