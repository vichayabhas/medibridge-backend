import express, { Request, Response } from "express";
import {
  ChatMessage,
  ConsultationData,
  CreateOrUpdatePatientProfile,
  GetPatientProfileData,
  GetPharmacistData,
  PatientHandoffType,
  PharmacistType,
  PharmacyRegister,
  PharmacyWithDistance,
  RegisterInput,
  UpdateProfile,
} from "../models/interface";
import Profile from "../models/Profile";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUser } from "../middleware/auth";
import mongoose from "mongoose";
import { sendRes } from "./setup";
import PatientProfile from "../models/PatientProfile";
import Pharmacist from "../models/Pharmacist";
import Pharmacy from "../models/Pharmacy";
import PatientHandoff from "../models/PatientHandoff";
import TelemededicineMessage from "../models/TelemededicineMessage";
import TelemedicineRoom from "../models/TelemedicineRoom";
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
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401).json({
      success: false,
      msg: "Invalid credentials",
    });
    return;
  }
  sendTokenResponse(user._id, 200, res);
}
const sendTokenResponse = (
  id: Id,
  statusCode: number,
  res: express.Response,
) => {
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
  const user = await Profile.findById(id);
  if (!user) return null;
  return await PatientProfile.findById(user.roleId);
}
export async function getPharmacistFromUserId(id: Id) {
  const user = await Profile.findById(id);
  if (!user) return null;
  return await Pharmacist.findById(user.roleId);
}
export async function updateProfile(req: Request, res: Response) {
  const data: UpdateProfile = req.body;
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  await Profile.findByIdAndUpdate(user._id,data)
  // const user2 = await Profile.findById(user._id);
  // res.status(200).json({});
  sendTokenResponse(user._id, 200, res);
}
export async function getPharmacistData(req: Request, res: Response) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const pharmacist = await getPharmacistFromUserId(user._id);
  if (!pharmacist) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  const pharmacistsWithPharmacy: PharmacistType[] = [];
  const pharmacyRaw = await Pharmacy.findById(pharmacist.pharmacyId);
  if (!pharmacyRaw) {
    sendRes(res, false);
    return;
  }

  while (i < pharmacyRaw.pharmacistIds.length) {
    const pharmacist = await Pharmacist.findById(
      pharmacyRaw.pharmacistIds[i++],
    );
    if (!pharmacist) {
      continue;
    }
    pharmacistsWithPharmacy.push(pharmacist);
  }
  const pharmacy: PharmacyWithDistance = {
    ...pharmacyRaw,
    distance: 0,
    isOpen: true,
    onlinePharmacists: pharmacistsWithPharmacy.filter(
      (r) => r.availability === "online",
    ).length,
    estimatedWaitTime: 0,
    lat: 0,
    lng: 0,
  };
  const handoffs: PatientHandoffType[] = [];
  i = 0;
  let waiting = 0;
  let ongoing = 0;
  let finished = 0;
  while (i < pharmacist.patientHandoffIds.length) {
    const handoff = await PatientHandoff.findById(
      pharmacist.patientHandoffIds[i++],
    );
    if (!handoff) {
      continue;
    }
    switch (handoff.status) {
      case "sent": {
        waiting++;
        break;
      }
      case "accepted": {
        ongoing++;
        break;
      }
      case "ready": {
        ongoing++;
        break;
      }
      case "completed": {
        finished++;
        break;
      }
      case "rejected": {
        break;
      }
    }
    handoffs.push(handoff);
  }
  const data: GetPharmacistData = {
    pharmacist,
    pharmacy,
    handoffs,
    user,
    handOffStatusCount: { finished, ongoing, waiting },
  };
  res.status(200).json(data);
}
export async function updatePharmacistProfile(req: Request, res: Response) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const pharmacist = await getPharmacistFromUserId(user._id);

  if (!pharmacist) {
    sendRes(res, false);
    return;
  }
  await pharmacist.updateOne(req.body);
  const newData = await Pharmacist.findById(pharmacist._id);
  res.status(200).json(newData);
}
export async function pharmacyRegister(req: Request, res: Response) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const { lat, lng, phone, name, address, imageUrl }: PharmacyRegister =
    req.body;
  const pharmacyRaw = await Pharmacy.create({
    latitude: lat,
    longitude: lng,
    phone,
    name,
    imageUrl,
    address,
    managerId: user._id,
  });
  const pharmacy: PharmacyWithDistance = {
    ...pharmacyRaw,
    distance: 0,
    isOpen: false,
    onlinePharmacists: 0,
    estimatedWaitTime: 0,
    lat: 0,
    lng: 0,
  };
  res.status(200).json(pharmacy);
}
export async function createOrUpdatePatientProfile(
  req: Request,
  res: Response,
) {
  const body: CreateOrUpdatePatientProfile = req.body;
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  let patient = await PatientProfile.findById(user.roleId);
  if (!patient) {
    patient = await PatientProfile.create({ ...body, userId: user._id });
    // await user.updateOne({ roleId: patient._id });
    await Profile.findByIdAndUpdate(user._id,{roleId:patient._id})
  } else {
    await patient.updateOne(body);
  }
  res.status(200).json({ ...body, ...patient });
}
export async function getPatientProfileData(req: Request, res: Response) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const consultationDatas: ConsultationData[] = [];
  const patient = await getPatientProfileFromUserId(user._id);
  if (!patient) {
    const data: GetPatientProfileData = { patient, user, consultationDatas };
    res.status(200).json(data);
    return;
  }

  let i = 0;
  while (i < patient.patientHandoffIds.length) {
    const handoff = await PatientHandoff.findById(
      patient.patientHandoffIds[i++],
    );
    if (!handoff) {
      continue;
    }
    const pharmacist = await Pharmacist.findById(handoff.pharmacistId);
    if (!pharmacist) {
      continue;
    }
    let j = 0;
    const pharmacistsWithPharmacy: PharmacistType[] = [];
    const pharmacyRaw = await Pharmacy.findById(pharmacist.pharmacyId);
    if (!pharmacyRaw) {
      sendRes(res, false);
      return;
    }

    while (j < pharmacyRaw.pharmacistIds.length) {
      const pharmacist = await Pharmacist.findById(
        pharmacyRaw.pharmacistIds[j++],
      );
      if (!pharmacist) {
        continue;
      }
      pharmacistsWithPharmacy.push(pharmacist);
    }
    const pharmacy: PharmacyWithDistance = {
      ...pharmacyRaw,
      distance: 0,
      isOpen: true,
      onlinePharmacists: pharmacistsWithPharmacy.filter(
        (r) => r.availability === "online",
      ).length,
      estimatedWaitTime: 0,
      lat: 0,
      lng: 0,
    };
    let k = 0;
    const messages: ChatMessage[] = [];
    while (k < handoff.chatIds.length) {
      const message = await TelemededicineMessage.findById(
        handoff.chatIds[k++],
      );
      if (!message) {
        continue;
      }
      messages.push(message);
    }
    switch (handoff.telemedicineChannel) {
      case "chat": {
        consultationDatas.push({
          messages,
          pharmacist,
          pharmacy,
          isChat: true,
          isPhone: false,
          isVideo: false,
          handoff,
        });
        continue;
      }
      case "phone": {
        const telemedicineRoom = await TelemedicineRoom.findById(
          handoff.telemedicineRoomId,
        );
        consultationDatas.push({
          pharmacist,
          pharmacy,
          isChat: false,
          isPhone: true,
          isVideo: false,
          roomUrl: telemedicineRoom?.roomUrl ?? null,
          handoff,
          messages,
        });
        continue;
      }
      case "video": {
        const telemedicineRoom = await TelemedicineRoom.findById(
          handoff.telemedicineRoomId,
        );
        consultationDatas.push({
          pharmacist,
          pharmacy,
          isChat: false,
          isPhone: false,
          isVideo: true,
          roomUrl: telemedicineRoom?.roomUrl ?? null,
          handoff,
          messages,
        });
        continue;
      }
    }
  }
  const data: GetPatientProfileData = { patient, user, consultationDatas };
  res.status(200).json(data);
}
