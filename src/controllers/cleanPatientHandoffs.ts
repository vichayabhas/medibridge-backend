import mongoose, { QueryFilter } from "mongoose";
import PatientHandoff from "../models/PatientHandoff";
import { Id } from "../models/configTypes";
import TelemedicineRoom from "../models/TelemedicineRoom";
import Pharmacist from "../models/Pharmacist";
import { Request, Response } from "express";
import { getUser } from "../middleware/auth";
import { getPatientProfileFromUserId, getPharmacistFromUserId } from "./user";
import {
  ChatMessage,
  ConsultationData,
  CreatePatientHandoff,
  FilteredHandoffsOptions,
  GetHandoffsOptions,
  HandoffStatusCount,
  HandoffWithMessages,
  PatientCallData,
  PatientHandoffStatus,
  PatientHandoffType,
  PharmacistType,
  PharmacyWithDistance,
  PharmaShiftData,
} from "../models/interface";
import { sendRes, swop } from "./setup";
import Pharmacy from "../models/Pharmacy";
import TelemededicineMessage from "../models/TelemededicineMessage";

interface PatientHandoffDoc {
  _id: Id;
  pharmacyId: Id;
  status: PatientHandoffType["status"];
  createdAt: Date;
  pharmacistId: Id;
  userId: Id;
}

export async function getPatientHandoffs(
  req: Request,
  options: GetHandoffsOptions = {},
): Promise<{ rows: PatientHandoffType[]; count: number | null }> {
  const { page = 1, pageSize = 20, pharmacyId, statuses } = options;

  try {
    const user = await getUser(req);
    if (!user) {
      return { rows: [], count: null };
    }
    const patient = await getPatientProfileFromUserId(user._id);

    const filter: QueryFilter<PatientHandoffDoc> = {};
    if (patient) {
      filter.userId = patient._id;
    }

    if (pharmacyId) {
      filter.pharmacyId = pharmacyId;
    }

    if (statuses && statuses.length > 0) {
      filter.status = { $in: statuses };
    }

    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const [data, count] = await Promise.all([
      PatientHandoff.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      PatientHandoff.countDocuments(filter),
    ]);

    return {
      rows: data,
      count: count ?? null,
    };
  } catch (e) {
    console.error("Unexpected error fetching patient handoffs", e);
    return { rows: [], count: null };
  }
}

export async function getAllPatientHandoffs(): Promise<PatientHandoffType[]> {
  const data = await PatientHandoff.find().sort({ createAt: -1 });

  return data;
}

export async function getPatientHandoffsForPharmacist(
  pharmacistId: Id,
): Promise<PatientHandoffType[]> {
  const data = await PatientHandoff.find({ pharmacistId }).sort({
    createAt: -1,
  });
  return data ?? [];
}

export async function getFilteredPatientHandoffs(
  options: FilteredHandoffsOptions,
): Promise<{ rows: PatientHandoffType[]; count: number }> {
  const { pharmacistId, statuses, page = 1, pageSize = 3 } = options;
  const filter: QueryFilter<PatientHandoffDoc> = {};

  if (pharmacistId) {
    filter.pharmacyId = pharmacistId;
  }

  if (statuses && statuses.length > 0) {
    filter.status = { $in: statuses };
  }

  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  const [data, count] = await Promise.all([
    PatientHandoff.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),

    PatientHandoff.countDocuments(filter),
  ]);

  return { rows: data, count: count ?? 0 };
}

export async function getHandoffStatusCounts(
  pharmacistId: string,
): Promise<HandoffStatusCount> {
  let waiting = 0;
  let ongoing = 0;
  let finished = 0;
  const pharmacist = await Pharmacist.findById(pharmacistId);
  if (pharmacist) {
    let i = 0;
    while (i < pharmacist.patientHandoffIds.length) {
      const handoff = await PatientHandoff.findById(
        pharmacist.patientHandoffIds[i++],
      );
      if (handoff) {
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
      }
    }
  }

  return {
    waiting,
    ongoing,
    finished,
  };
}

export async function savePatientHandoff(
  handoff: CreatePatientHandoff,
  req: Request,
) {
  const user = await getUser(req);
  if (!user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบก่อนส่งคำขอ" };
  }
  const patientProfile = await getPatientProfileFromUserId(user._id);
  if (!patientProfile) {
    return { success: false, error: "กรุณาเข้าสู่ระบบก่อนส่งคำขอ" };
  }

  let hasPending = false;
  let i = 0;
  while (i < patientProfile.patientHandoffIds.length) {
    const patientHandoff = await PatientHandoff.findById(
      patientProfile.patientHandoffIds[i++],
    );
    if (!patientHandoff) {
      continue;
    }
    const pendings: PatientHandoffStatus[] = ["ready", "accepted", "sent"];
    if (pendings.includes(patientHandoff.status)) {
      hasPending = true;
      break;
    }
  }
  if (hasPending) {
    return {
      success: false,
      error:
        "คุณมีคำขอที่กำลังดำเนินการอยู่แล้ว กรุณารอให้เสร็จสิ้นก่อนส่งคำขอใหม่",
    };
  }
  const pharmacist = await Pharmacist.findById(handoff.pharmacistId);
  if (!pharmacist) {
    return { success: false };
  }

  const newHandoff = await PatientHandoff.create({
    ...handoff,
    userId: patientProfile._id,
  });
  await pharmacist.updateOne({
    patientHandoffIds: swop(null, newHandoff._id, pharmacist.patientHandoffIds),
  });
  await patientProfile.updateOne({
    patientHandoffIds: swop(
      null,
      newHandoff._id,
      patientProfile.patientHandoffIds,
    ),
  });

  const out = await getPatientHandoffsForPharmacist(pharmacist._id);

  return out;
}

export async function updatePatientHandoff(
  id: string,
  update: Partial<PatientHandoffType>,
) {
  const newHandoff = await PatientHandoff.findByIdAndUpdate(id, update);
  if (!newHandoff) {
    return [];
  }
  return await getHandoffsFromPharmacistId(newHandoff.pharmacistId);
}

export async function updateTelemedicineData(
  id: string,
  data: Partial<
    Pick<
      PatientHandoffType,
      | "telemedicineChannel"
      | "telemedicinePatientNote"
      | "telemedicineCollectedData"
      | "telemedicineStartTime"
      | "telemedicineEndTime"
      | "status"
    >
  >,
): Promise<void> {
  await PatientHandoff.findByIdAndUpdate(id, data);
}

export async function getRoomUrlForHandoff(
  handoffId: string,
): Promise<string | null> {
  const data = await TelemedicineRoom.findOne({ handoffId });
  return data?.roomUrl ?? null;
}

export async function seedPatientHandoffs(
  seed: CreatePatientHandoff[],
  req: Request,
): Promise<void> {
  const user = await getUser(req);
  if (!user) {
    return;
  }
  const patientProfile = await getPatientProfileFromUserId(user._id);
  if (!patientProfile) {
    return;
  }

  let i = 0;
  while (i < seed.length) {
    await PatientHandoff.create({ ...seed[i++], userId: patientProfile._id });
  }
}
async function getHandoffsFromPharmacistId(id: Id) {
  const pharmacist = await Pharmacist.findById(id);
  if (!pharmacist) {
    return [];
  }
  const handoffs: PatientHandoffType[] = [];
  let i = 0;
  while (i < pharmacist.patientHandoffIds.length) {
    const handoff = await PatientHandoff.findById(
      pharmacist.patientHandoffIds[i++],
    );
    if (!handoff) {
      continue;
    }
    handoffs.push(handoff);
  }
  return handoffs;
}
export async function hasPendingHandoff(req: Request, res: Response) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const patientProfile = await getPatientProfileFromUserId(user._id);
  if (!patientProfile) {
    sendRes(res, false);
    return;
  }

  let hasPending = false;
  let i = 0;
  while (i < patientProfile.patientHandoffIds.length) {
    const patientHandoff = await PatientHandoff.findById(
      patientProfile.patientHandoffIds[i++],
    );
    if (!patientHandoff) {
      continue;
    }
    const pendings: PatientHandoffStatus[] = ["ready", "accepted", "sent"];
    if (pendings.includes(patientHandoff.status)) {
      hasPending = true;
      break;
    }
  }
  sendRes(res, hasPending);
}
export async function getPatientHandoffsForConsultation(
  req: Request,
  res: Response,
) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const patient = await getPatientProfileFromUserId(user._id);
  if (!patient) {
    sendRes(res, false);
    return;
  }
  const consultationDatas: ConsultationData[] = [];
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
          new mongoose.Types.ObjectId(handoff.telemedicineRoomId?.toString()),
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
          new mongoose.Types.ObjectId(handoff.telemedicineRoomId?.toString()),
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
  res.status(200).json(consultationDatas);
}
export async function getPharmacistShiftData(req: Request, res: Response) {
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
  const arrayHandoffWithMessages: HandoffWithMessages[] = [];
  i = 0;

  while (i < pharmacist.patientHandoffIds.length) {
    const handoff = await PatientHandoff.findById(
      pharmacist.patientHandoffIds[i++],
    );
    if (!handoff) {
      continue;
    }
    let j = 0;
    const messages: ChatMessage[] = [];
    while (j < handoff.chatIds.length) {
      const message = await TelemededicineMessage.findById(
        handoff.chatIds[j++],
      );
      if (!message) {
        continue;
      }
      messages.push(message);
    }

    arrayHandoffWithMessages.push({ handoff, messages });
  }
  const data: PharmaShiftData = {
    pharmacist,
    pharmacy,
    arrayHandoffWithMessages,
  };
  res.status(200).json(data);
}
export async function getPatientCallData(req: Request, res: Response) {
  const handoff = await PatientHandoff.findById(req.params.id.toString());
  let error: string | null = null;
  if (!handoff) {
    error = "ไม่พบข้อมูลการปรึกษา";
    res.status(400).json({ error });
    return;
  }

  if (handoff.status !== "accepted") {
    error = "การปรึกษายังไม่พร้อม กรุณารอเภสัชกรรับเรื่อง";
    res.status(400).json({ error });
    return;
  }

  const pharmacist = await Pharmacist.findById(handoff.pharmacistId);
  if (!pharmacist) {
    sendRes(res, false);
    return;
  }
  const pharmacy = await Pharmacy.findById(pharmacist.pharmacyId);
  if (!pharmacy) {
    sendRes(res, false);
    return;
  }
  const messageInputs: ChatMessage[] = [];
  let i = 0;
  while (i < handoff.chatIds.length) {
    const message = await TelemededicineMessage.findById(handoff.chatIds[i++]);
    if (!message) {
      continue;
    }
    messageInputs.push(message);
  }
  const data: PatientCallData = {
    messageInputs,
    handoff,
    pharmacyName: pharmacy.name,
    error,
  };
  res.status(200).json(data);
}
