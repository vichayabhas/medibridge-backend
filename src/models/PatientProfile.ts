import mongoose from "mongoose";
import {
  dataString,
  reqNumber,
  arrayString,
  getDefaultBoolean,
} from "../controllers/setup";
import { genders } from "./interface";

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
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});
export default mongoose.model("PatientProfile", schema);
