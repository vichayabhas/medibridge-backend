import express, { Request, Response } from "express";
import { RegisterInput, UpdateProfile } from "../models/interface";
import Profile from "../models/Profile";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUser } from "../middleware/auth";
import mongoose from "mongoose";
import { sendRes } from "./setup";
import PatientProfile from "../models/PatientProfile";
type Id = mongoose.Types.ObjectId;
export async function register(req: express.Request, res: express.Response) {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      avatarUrl,
    }: //private
    RegisterInput = req.body;
    const user = await Profile.create({
      email,
      password,
      phone,
      role,
      name,
      avatarUrl,
    });
    console.log(req.body);
    sendTokenResponse(user._id, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
    });
    console.log(err);
  }
}
export async function login(req: express.Request, res: express.Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      success: false,
      msg: "Please provide an email and password",
    });
    return;
  }
  console.log(email);
  console.log(password);
  const user = await Profile.findOne({
    email,
  }).select("+password");
  if (!user) {
    res.status(400).json({
      success: false,
      msg: "Invalid credentials",
    });
    return;
  }
  console.log(user);
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401).json({
      success: false,
      msg: "Invalid credentials",
    });
    return;
  }
  console.log(user._id);
  sendTokenResponse(user._id, 200, res);
}
const sendTokenResponse = (
  id: Id,
  statusCode: number,
  res: express.Response,
) => {
  console.log(process.env.JWT_SECRET);
  const token = jwt.sign({ id }, process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: parseInt(process.env.JWT_EXPIRE || "5"),
  });
  const options = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRE || "0") * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
export async function getMe(req: express.Request, res: express.Response) {
  const user = await getUser(req);
  console.log(user);
  res.status(200).json(user);
}
export async function checkPassword(
  req: express.Request,
  res: express.Response,
) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const isMatch = await bcrypt.compare(req.body.password, user.password);
  sendRes(res, isMatch);
}
export async function getPatientProfileFromUserId(id: Id) {
  console.log(id);
  return await PatientProfile.findOne();
}
export async function updateProfile(req: Request, res: Response) {
  const data: UpdateProfile = req.body;
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  await user.updateOne(data);
  // const user2 = await Profile.findById(user._id);
  // res.status(200).json({});
  sendTokenResponse(user._id, 200, res);
}
