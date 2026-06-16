import mongoose from "mongoose";
import { userRoles } from "./interface";
import { dataString } from "../controllers/setup";
import bcrypt from "bcrypt";

const schema = new mongoose.Schema({
  name: dataString,
  phone: dataString,
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    Math: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
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
  roleId: mongoose.Schema.ObjectId,
});
schema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
export default mongoose.model("Profile", schema);
