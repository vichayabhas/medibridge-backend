import mongoose from "mongoose";
import {
  dataId,
  dataString,
  dataNumber,
  arrayString,
  dataDate,
  arrayObjectId,
} from "../controllers/setup";
import {
  patientRequestTypes,
  telemedicineChannels,
  patientHandoffStatuses,
} from "./interface";

const schema = new mongoose.Schema({
  userId: dataId,
  patientName: dataString,
  age: dataNumber,
  gender: dataString,
  symptoms: arrayString,
  duration: dataString,
  conditions: arrayString,
  medications: arrayString,
  allergies: arrayString,
  patientSummary: dataString,
  aiSummary: dataString,
  pharmacyId: dataId,
  pharmacistId: dataId,
  appointmentTime: dataDate,
  fulfillment: dataString,
  suggestedAction: dataString,
  requestType: {
    type: String,
    enum: patientRequestTypes,
    required: true,
  },
  telemedicineChannel: {
    type: String,
    enum: telemedicineChannels,
    required: true,
  },
  telemedicinePatientNote: dataString,
  telemedicineCollectedData: mongoose.Schema.Types.Mixed,
  telemedicineRequestTime: dataDate,
  telemedicineStartTime: dataDate,
  telemedicineEndTime: dataDate,
  consultDurationMinutes: dataNumber,
  status: {
    type: String,
    enum: patientHandoffStatuses,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  telemedicineRoomId: mongoose.Schema.ObjectId,
  chatIds: arrayObjectId,
});

export default mongoose.model("PatientHandoff", schema);
