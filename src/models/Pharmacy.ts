import mongoose from "mongoose";
import {
  dataString,
  reqNumber,
  dataNumber,
  arrayString,
  getDefaultBoolean,
  dataId,
  arrayObjectId,
} from "../controllers/setup";
import { verificationStatuses } from "../moduleSupport/interface";
import { UnifiedModel } from "../moduleSupport/ModelFactory";

const schema = new mongoose.Schema({
  name: dataString,
  address: dataString,
  latitude: reqNumber,
  longitude: reqNumber,
  phone: dataString,
  openingHours: {
    type: [
      {
        day: reqNumber,
        open: dataString,
        close: dataString,
      },
    ],
    default: [],
  },
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
  pharmacistIds: arrayObjectId,
});
export const model = mongoose.model("Pharmacy", schema);
export default new UnifiedModel(model);
