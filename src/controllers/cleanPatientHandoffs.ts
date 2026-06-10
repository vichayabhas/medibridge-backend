import { QueryFilter } from "mongoose";
import PatientHandoff from "../models/PatientHandoff";
import { Id } from "../models/configTypes";
import TelemedicineRoom from "../models/TelemedicineRoom";
import Pharmacist from "../models/Pharmacist";
import { Request } from "express";
import { getUser } from "../middleware/auth";
import { getPatientProfileFromUserId } from "./user";
import {
  FilteredHandoffsOptions,
  GetHandoffsOptions,
  HandoffStatusCount,
  PatientHandoffStatus,
  PatientHandoffType,
} from "../models/interface";

export type CreatePatientHandoff = Omit<PatientHandoffType, "_id" | "createAt">;

interface PatientHandoffDoc {
  _id: Id;
  pharmacyId: Id;
  status: PatientHandoffType["status"];
  createdAt: Date;
  pharmacistId: Id;
}



export async function getPatientHandoffs(
  options: GetHandoffsOptions = {},
): Promise<{ rows: PatientHandoffType[]; count: number | null }> {
  const { page = 1, pageSize = 20, pharmacyId, statuses } = options;

  try {
    const filter: QueryFilter<PatientHandoffDoc> = {};

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
): Promise<{ success: boolean; error?: string }> {
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

  await PatientHandoff.create({ ...handoff, userId: patientProfile._id });

  return { success: true };
}

export async function updatePatientHandoff(
  id: string,
  update: Partial<PatientHandoffType>,
): Promise<void> {
  await PatientHandoff.findByIdAndUpdate(id, update);
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
