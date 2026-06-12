import { QueryFilter } from "mongoose";
import PatientHandoff from "../models/PatientHandoff";
import { Id } from "../models/configTypes";
import TelemedicineRoom from "../models/TelemedicineRoom";
import Pharmacist from "../models/Pharmacist";
import { Request, Response } from "express";
import { getUser } from "../middleware/auth";
import { getPatientProfileFromUserId } from "./user";
import {
  CreatePatientHandoff,
  FilteredHandoffsOptions,
  GetHandoffsOptions,
  HandoffStatusCount,
  PatientHandoffStatus,
  PatientHandoffType,
} from "../models/interface";
import { sendRes, swop } from "./setup";

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
