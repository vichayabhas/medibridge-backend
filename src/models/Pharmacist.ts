import mongoose from "mongoose";
import {
  dataString,
  dataNumber,
  arrayString,
  dataStringDefault,
} from "../controllers/setup";
import { pharmacistAvailabilities, verificationStatuses } from "./interface";

const schema = new mongoose.Schema({
  pharmacyId: dataString,
  name: dataString,
  licenseNo: dataString,
  avatarUrl: dataString,
  availability: {
    type: String,
    enum: pharmacistAvailabilities,
    default: "offline",
  },
  rating: dataNumber,
  reviewCount: dataNumber,
  specialties: arrayString,
  methodRates: {
    type: Object,
    default: { chat: 0, phone: 0, video: 0 },
  },
  bookedSlots: arrayString,
  consultDurations: {
    type: [Number],
    default: [15, 30],
  },
  experience: dataNumber,
  workplace: dataStringDefault,
  languages: arrayString,
  insurance: arrayString,
  bio: dataStringDefault,
  nextAvailable: dataStringDefault,
  verificationStatus: {
    type: String,
    enum: verificationStatuses,
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
export default mongoose.model("Pharmacist", schema);
