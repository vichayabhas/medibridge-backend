import { QueryFilter } from "mongoose";
import PatientHandoff from "../models/PatientHandoff";
import { Id } from "../moduleSupport/configTypes";
import TelemedicineRoom from "../models/TelemedicineRoom";
import Pharmacist from "../models/Pharmacist";
import { Request } from "express";
import { getUser } from "../middleware/auth";
import { getPatientProfileFromUserId } from "./user";
import { PatientHandoffStatus, PatientHandoffType } from "../moduleSupport/interface";
import { swop } from "./setup";

// export type PatientRequestType =
//   | "in_store"
//   | "pickup"
//   | "telemedicine"
//   | "delivery";
// export type TelemedicineChannel = "chat" | "phone" | "video";

export type CreatePatientHandoff = Omit<PatientHandoffType, "_id" | "createAt">;

// export type GetHandoffsOptions = {
//   page?: number;
//   pageSize?: number;
//   pharmacyId?: string;
//   statuses?: PatientHandoff['status'][];
// };

// export async function getPatientHandoffs(options: GetHandoffsOptions = {}): Promise<{ rows: PatientHandoff[]; count: number | null }> {
//   const { page = 1, pageSize = 20, pharmacyId, statuses } = options;
//   try {
//     let query = supabase.from("patient_handoffs").select("*", { count: "exact" }).order("created_at", { ascending: false });
//     if (pharmacyId) query = query.eq("pharmacy_id", pharmacyId);
//     if (statuses && statuses.length > 0) query = query.in("status", statuses as string[]);
//     const from = (page - 1) * pageSize;
//     const to = page * pageSize - 1;
//     const { data, error, count } = await query.range(from, to);
//     if (error) {
//       console.error("Failed reading patient handoffs", error);
//       return { rows: [], count: null };
//     }
//     return { rows: (data ?? []).map(fromDbRow), count: count ?? null };
//   } catch (e) {
//     console.error("Unexpected error fetching patient handoffs", e);
//     return { rows: [], count: null };
//   }
// }
interface PatientHandoffDoc {
  _id: Id;
  pharmacyId: Id;
  status: PatientHandoffType["status"];
  createdAt: Date;
  pharmacistId: Id;
  // Add other raw DB fields here if needed...
}

export type GetHandoffsOptions = {
  page?: number;
  pageSize?: number;
  pharmacyId?: Id;
  statuses?: PatientHandoffType["status"][];
};

export async function getPatientHandoffs(
  options: GetHandoffsOptions = {},
): Promise<{ rows: PatientHandoffType[]; count: number | null }> {
  const { page = 1, pageSize = 20, pharmacyId, statuses } = options;

  try {
    // 2. Type the filter object cleanly using your document interface
    const filter: QueryFilter<PatientHandoffDoc> = {};

    if (pharmacyId) {
      filter.pharmacyId = pharmacyId;
    }

    if (statuses && statuses.length > 0) {
      // TypeScript now safely validates that $in expects an array of PatientHandoff['status']
      filter.status = { $in: statuses };
    }

    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // 3. Explicitly type the Model query if it isn't already generic
    const [data, count] = await Promise.all([
      PatientHandoff.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      // .lean<PatientHandoffDoc[]>(), // Tells TypeScript exactly what structure 'data' will be
      PatientHandoff.countDocuments(filter),
    ]);

    return {
      rows: data, // 'fromDbRow' now receives a strongly typed PatientHandoffDoc
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

export type FilteredHandoffsOptions = {
  pharmacistId: string;
  statuses: PatientHandoffStatus[];
  page?: number;
  pageSize?: number;
};

export async function getFilteredPatientHandoffs(
  options: FilteredHandoffsOptions,
): Promise<{ rows: PatientHandoffType[]; count: number }> {
  const { pharmacistId, statuses, page = 1, pageSize = 3 } = options;
  const filter: QueryFilter<PatientHandoffDoc> = {};

  if (pharmacistId) {
    filter.pharmacyId = pharmacistId;
  }

  if (statuses && statuses.length > 0) {
    // TypeScript now safely validates that $in expects an array of PatientHandoff['status']
    filter.status = { $in: statuses };
  }

  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  // 3. Explicitly type the Model query if it isn't already generic
  const [data, count] = await Promise.all([
    PatientHandoff.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),

    // .lean<PatientHandoffDoc[]>(), // Tells TypeScript exactly what structure 'data' will be
    PatientHandoff.countDocuments(filter),
  ]);
  // let query = supabase
  //   .from("patient_handoffs")
  //   .select("*", { count: "exact" })
  //   .eq("pharmacist_id", pharmacistId)
  //   .in("status", statuses as string[])
  //   .order("created_at", { ascending: false });

  // const from = (page - 1) * pageSize;
  // const to = page * pageSize - 1;
  // const { data, error, count } = await query.range(from, to);

  // if (error) {
  //   console.error("Failed reading filtered handoffs", error);
  //   return { rows: [], count: 0 };
  // }
  return { rows: data, count: count ?? 0 };
}
export interface HandoffStatusCount {
  waiting: number;
  ongoing: number;
  finished: number;
}
export async function getHandoffStatusCounts(
  pharmacistId: string,
): Promise<HandoffStatusCount> {
  // const results = await Promise.all([
  //   // supabase
  //   //   .from("patient_handoffs")
  //   //   .select("*", { count: "exact", head: true })
  //   //   .eq("pharmacist_id", pharmacistId)
  //   //   .eq("status", "sent"),
  //   // supabase
  //   //   .from("patient_handoffs")
  //   //   .select("*", { count: "exact", head: true })
  //   //   .eq("pharmacist_id", pharmacistId)
  //   //   .in("status", ["accepted", "ready"]),
  //   // supabase
  //   //   .from("patient_handoffs")
  //   //   .select("*", { count: "exact", head: true })
  //   //   .eq("pharmacist_id", pharmacistId)
  //   //   .eq("status", "completed"),
  // ]);
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

// async function hasPendingHandoff(): Promise<boolean> {
//   // const { data, error } = await supabase
//   //   .from("patient_handoffs")
//   //   .select("*")
//   //   .in("status", ["sent", "accepted", "ready"])
//   //   .limit(1);
//   const sent = await PatientHandoff.find({ status: "sent" });
//   const accepted = await PatientHandoff.find({ status: "accepted" });
//   const ready = await PatientHandoff.find({ status: "ready" });
//   // if (error) {
//   //   console.error("Failed checking pending handoffs", error);
//   //   return false;
//   // }
//   // return (data ?? []).length > 0;
//   return sent.length + accepted.length + ready.length > 0;
// }

export async function savePatientHandoff(
  handoff: CreatePatientHandoff,
  req: Request,
): Promise<{ success: boolean; error?: string }> {
  const user = await getUser(req);
  // Check if patient already has a pending handoff
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
  // if(patientProfile._id.toString()!=handoff.user)

  // Get current authenticated user for RLS compliance
  // const { data: sessionData } = await supabase.auth.getSession();
  // const userId = sessionData?.session?.user?.id ?? null;
  // if (!userId) {
  //   return { success: false, error: "กรุณาเข้าสู่ระบบก่อนส่งคำขอ" };
  // }
  const newHandoff = await PatientHandoff.create({
    ...handoff,
    userId: patientProfile._id,
  });
  await patientProfile.updateOne({
    patientHandoffIds: swop(
      null,
      newHandoff._id,
      patientProfile.patientHandoffIds,
    ),
  });
  const pharmacist = await Pharmacist.findById(newHandoff.pharmacistId);
  if (pharmacist) {
    await pharmacist.updateOne({
      patientHandoffIds: swop(
        null,
        newHandoff._id,
        pharmacist.patientHandoffIds,
      ),
    });
  }

  // const row = { ...toDbRow(handoff), user_id: userId };
  // const { error } = await supabase.from("patient_handoffs").insert(row);
  // if (error) {
  //   console.error("Failed saving patient handoff", error);
  //   return { success: false, error: "ไม่สามารถบันทึกข้อมูลได้" };
  // }
  return { success: true };
}

export async function updatePatientHandoff(
  id: string,
  update: Partial<PatientHandoffType>,
): Promise<void> {
  await PatientHandoff.findByIdAndUpdate(id, update);
  // const patch: Record<string, unknown> = {};
  // if (update.status !== undefined) patch.status = update.status;
  // if (update.pharmacistId !== undefined) patch.pharmacist_id = update.pharmacistId;
  // if (update.symptoms !== undefined) patch.symptoms = update.symptoms;
  // if (update.allergies !== undefined) patch.allergies = update.allergies;
  // if (update.conditions !== undefined) patch.conditions = update.conditions;
  // if (update.medications !== undefined) patch.medications = update.medications;
  // if (update.aiSummary !== undefined) patch.ai_summary = update.aiSummary;
  // if (update.patientSummary !== undefined) patch.patient_summary = update.patientSummary;
  // if (update.appointmentTime !== undefined) patch.appointment_time = update.appointmentTime;
  // if (update.consultDurationMinutes !== undefined) patch.consult_duration_minutes = update.consultDurationMinutes;
  // if (Object.keys(patch).length === 0) return;
  // const { error } = await supabase.from("patient_handoffs").update(patch).eq("id", id);
  // if (error) console.error("Failed updating patient handoff", error);
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
  // const patch: Record<string, unknown> = {};
  // if (data.telemedicineChannel !== undefined) patch.telemedicine_channel = data.telemedicineChannel;
  // if (data.telemedicinePatientNote !== undefined) patch.telemedicine_patient_note = data.telemedicinePatientNote;
  // if (data.telemedicineCollectedData !== undefined) patch.telemedicine_collected_data = data.telemedicineCollectedData;
  // if (data.telemedicineStartTime !== undefined) patch.telemedicine_start_time = data.telemedicineStartTime;
  // if (data.telemedicineEndTime !== undefined) patch.telemedicine_end_time = data.telemedicineEndTime;
  // if (data.status !== undefined) patch.status = data.status;
  // if (Object.keys(patch).length === 0) return;
  // const { error } = await supabase.from("patient_handoffs").update(patch).eq("id", id);
  // if (error) console.error("Failed updating telemedicine data", error);
  await PatientHandoff.findByIdAndUpdate(id, data);
}

export async function getRoomUrlForHandoff(
  handoffId: string,
): Promise<string | null> {
  // const apiUrl =getBackendUrl()

  // try {
  //   const response = await fetch(`${apiUrl}/api/telemedicine/rooms/by-handoff/${encodeURIComponent(handoffId)}`);
  //   if (response.ok) {
  //     const data = await response.json() as { success?: boolean; roomUrl?: string | null };
  //     if (data.success) return data.roomUrl ?? null;
  //   }
  // } catch (error) {
  //   console.error("Failed fetching telemedicine room from backend", error);
  // }

  // const { data, error } = await supabase
  //   .from("telemedicine_rooms")
  //   .select("room_url")
  //   .eq("handoff_id", handoffId)
  //   .order("created_at", { ascending: false })
  //   .limit(1)
  //   .maybeSingle();
  // if (error) {
  //   console.error("Failed fetching telemedicine room", error);
  //   return null;
  // }
  const data = await TelemedicineRoom.findOne({ handoffId });
  return data?.roomUrl ?? null;
}

export async function seedPatientHandoffs(
  seed: CreatePatientHandoff[],
  req: Request,
): Promise<void> {
  const user = await getUser(req);
  // Check if patient already has a pending handoff
  if (!user) {
    return; //{ success: false, error: "กรุณาเข้าสู่ระบบก่อนส่งคำขอ" };
  }
  const patientProfile = await getPatientProfileFromUserId(user._id);
  if (!patientProfile) {
    return; //{ success: false, error: "กรุณาเข้าสู่ระบบก่อนส่งคำขอ" };
  }
  // const { count } = await supabase
  //   .from("patient_handoffs")
  //   .select("*", { count: "exact", head: true });
  // if ((count ?? 0) === 0 && seed.length > 0) {
  //   const { data: sessionData } = await supabase.auth.getSession();
  //   const userId = sessionData?.session?.user?.id ?? null;
  //   const rows = seed.map((h) => ({ ...toDbRow(h), user_id: userId }));
  //   const { error } = await supabase.from("patient_handoffs").insert(rows);
  //   if (error) console.error("Failed to seed patient handoffs", error);
  // }
  let i = 0;
  while (i < seed.length) {
    await PatientHandoff.create({ ...seed[i++], userId: patientProfile._id });
  }
}
