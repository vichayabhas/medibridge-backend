import mongoose from "mongoose";
import {
  dataString,
  reqNumber,
  arrayString,
  getDefaultBoolean,
  arrayObjectId,
  dataId,
} from "../controllers/setup";
import { genders } from "./interface";
import { UnifiedModel } from "./ModelFactory";

const schema = new mongoose.Schema({
  firstName: dataString,
  lastName: dataString,
  gender: {
    type: String,
    enum: genders,
    required: true,
  },
  age: reqNumber,
  weight: reqNumber,
  allergies: arrayString,
  conditions: arrayString,
  currentMedications: arrayString,
  isPregnant: getDefaultBoolean(false),
  isBreastfeeding: getDefaultBoolean(false),
  bloodType: dataString,
  symptoms: dataString,
  patientHandoffIds: arrayObjectId,
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  userId: dataId,
});
export default new UnifiedModel(mongoose.model("PatientProfile", schema));