import mongoose from "mongoose";
import { userRoles } from "./interface";
import { dataString } from "../controllers/setup";

const schema = new mongoose.Schema({
  fullName: dataString,
  phone: dataString,
  email: dataString,
  avatarUrl: dataString,
  role: {
    type: String,
    enum: userRoles,
    default: "patient",
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
export default mongoose.model("Profile", schema);
