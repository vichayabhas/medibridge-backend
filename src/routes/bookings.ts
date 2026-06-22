import { Router, type Request, type Response } from "express";
import Pharmacist from "../models/Pharmacist";
import PatientHandoff from "../models/PatientHandoff";
import { Id } from "../moduleSupport/configTypes";
import { PatientRequestType, TelemedicineChannel } from "../moduleSupport/interface";



const router = Router();

function toMins(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * POST /api/bookings/validate
 * Body: { pharmacistId, slot, duration, dayOffset }
 * Returns: { ok: boolean, error?: string }
 */
function toBookedSlot(value: string): string {
  return value.slice(0, 5);
}

function normalizeNote(value?: string | null): string  {
  if (typeof value !== "string") return '';
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '';
}

function splitSymptoms(value: string): string[] {
  const segments = value
    .split(/[\n,]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  return Array.from(new Set(segments));
}

// // Sanitize collected telemedicine data before persisting.
// function sanitizeCollectedData(data: any) {
//   if (!data || typeof data !== "object") return null;
//   const allowedKeys = ["note", "duration", "slot", "appointmentTime", "patientName", "userId"];
//   const out: Record<string, unknown> = {};
//   for (const k of allowedKeys) {
//     if (Object.prototype.hasOwnProperty.call(data, k)) {
//       const v = (data as Record<string, unknown>)[k];
//       // basic type normalization
//       if (v === null || v === undefined) {
//         out[k] = null;
//       } else if (typeof v === "string") {
//         out[k] = v.trim();
//       } else if (typeof v === "number") {
//         out[k] = v;
//       } else {
//         out[k] = String(v);
//       }
//     }
//   }

//   // limit stored size to 10KB; otherwise drop to null and log
//   try {
//     const json = JSON.stringify(out);
//     if (json.length > 10 * 1024) {
//       console.warn("telemedicineCollectedData too large, dropping payload");
//       return null;
//     }
//   } catch (e) {
//     console.warn("Failed serializing telemedicineCollectedData", e);
//     return null;
//   }

//   return out;
// }

async function validateBooking(pharmacistId: Id, slot: string, duration: number, dayOffset: number) {
  if (dayOffset === 0) {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    if (toMins(slot) < nowMins + 5) {
      return { ok: false, error: "ต้องจองล่วงหน้าอย่างน้อย 5 นาที" } as const;
    }
  }

  if (dayOffset !== 0) {
    return { ok: true } as const;
  }

  const pharmacist = await Pharmacist.findById(pharmacistId)


  if ( !pharmacist) {
    return { ok: false, error: "ไม่พบข้อมูลเภสัชกร" } as const;
  }

  const bookedSlots=pharmacist.bookedSlots
  const startM = toMins(slot);
  const endM = startM + duration;
  const conflict = bookedSlots.some((b) => {
    const bM = toMins(b);
    return (bM - 1) < endM && (bM + duration + 1) > startM;
  });

  if (conflict) {
    return { ok: false, error: "ช่วงเวลานี้ถูกจองแล้ว กรุณาเลือกเวลาอื่น" } as const;
  }

  return { ok: true } as const;
}
router.post("/validate", async (req: Request, res: Response) => {
  const { pharmacistId, slot, duration, dayOffset } = req.body as {
    pharmacistId: Id;
    slot: string;
    duration: number;
    dayOffset: number;
  };

  if (!pharmacistId || !slot || typeof duration !== "number" || typeof dayOffset !== "number") {
     res.status(400).json({ ok: false, error: "Missing required fields" });
     return
  }
  const validation = await validateBooking(pharmacistId, slot, duration, dayOffset);
  if (!validation.ok) {
     res.status(validation.error === "ไม่พบข้อมูลเภสัชกร" ? 404 : 409).json(validation);
     return
  }
   res.json({ ok: true });
});
router.post("/create", async (req: Request, res: Response) => {
  const {
    pharmacistId,
    pharmacyId,
    slot,
    duration,
    dayOffset,
    appointmentTime,
    userId,
    patientName,
    requestType,
    telemedicineChannel,
    telemedicinePatientNote,
    telemedicineCollectedData,
    note,
  } = req.body as {
    pharmacistId: Id;
    pharmacyId?: Id;
    slot: string;
    duration: number;
    dayOffset: number;
    appointmentTime: Date;
    userId: Id
    patientName?: string;
    requestType?: PatientRequestType;
    telemedicineChannel: TelemedicineChannel;
    telemedicinePatientNote?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    telemedicineCollectedData?: any;
    note?: string;
  };
  if (!pharmacistId || !slot || typeof duration !== "number" || typeof dayOffset !== "number" || !appointmentTime) {
     res.status(400).json({ ok: false, error: "Missing required fields" });
     return
  }
  const validation = await validateBooking(pharmacistId, slot, duration, dayOffset);
  if (!validation.ok) {
     res.status(validation.error === "ไม่พบข้อมูลเภสัชกร" ? 404 : 409).json(validation);
     return
  }

  const  pharmacist = await Pharmacist.findById(pharmacistId)


  if ( !pharmacist) {
     res.status(404).json({ ok: false, error: "ไม่พบข้อมูลเภสัชกร" });
     return
  }

  const effectivePharmacyId = pharmacyId || (pharmacist.pharmacyId ) ;
  const nextBookedSlots = Array.from(new Set([...(pharmacist.bookedSlots as string[] ?? []), toBookedSlot(slot)])).sort();
  const normalizedNote = normalizeNote(note);
  const normalizedTelemedicineNote = normalizeNote(telemedicinePatientNote);
  const summarySource = normalizedNote ?? normalizedTelemedicineNote;

  const handoffId = `MB-${Date.now().toString().slice(-8)}`;
  // sanitize collected data and remove internal identifiers
  // const sanitizedCollectedData = sanitizeCollectedData(telemedicineCollectedData);
  // if (sanitizedCollectedData && Object.prototype.hasOwnProperty.call(sanitizedCollectedData, "userId")) {
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   delete (sanitizedCollectedData as any).userId;
  // }


  // const handoffRow = {
  //   id: handoffId,
  //   user_id: userId ?? null,
  //   patient_name: patientName?.trim() || "ผู้ใช้งาน",
  //   age: null,
  //   gender: null,
  //   symptoms: summarySource ? splitSymptoms(summarySource) : [],
  //   duration: `${duration} นาที`,
  //   conditions: [],
  //   medications: [],
  //   allergies: [],
  //   patient_summary: summarySource,
  //   ai_summary: summarySource,
  //   pharmacy_id: effectivePharmacyId,
  //   pharmacist_id: pharmacistId,
  //   appointment_time: appointmentTime,
  //   fulfillment: null,
  //   suggested_action: null,
  //   request_type: requestType || "telemedicine",
  //   telemedicine_channel: telemedicineChannel || null,
  //   telemedicine_patient_note: normalizedTelemedicineNote,
  //   telemedicine_collected_data: telemedicineCollectedData,
  //   telemedicine_request_time: null,
  //   telemedicine_start_time: null,
  //   telemedicine_end_time: null,
  //   consult_duration_minutes: duration,
  //   status: "sent",
  // };
  await PatientHandoff.create({
    userId: userId ,
    patientName: patientName?.trim() || "ผู้ใช้งาน",
    symptoms: summarySource ? splitSymptoms(summarySource) : [],
    duration: `${duration} นาที`,
    patientSummary: summarySource,
    aiSummary: summarySource,
    pharmacyId: effectivePharmacyId,
    pharmacistId: pharmacistId,
    appointmentTime: appointmentTime,
    requestType: requestType || "telemedicine",
    telemedicineChannel: telemedicineChannel ,
    telemedicinePatientNote: normalizedTelemedicineNote,
    telemedicineCollectedData: telemedicineCollectedData ?? null,
    consultDurationMinutes: duration,
    status: "sent",
  })

  // const { error: insertError } = await supabase.from("patient_handoffs").insert(handoffRow);
  // if (insertError) {
  //   console.error("Failed creating booking handoff", insertError);
  //    res.status(500).json({ ok: false, error: "ไม่สามารถบันทึกการจองได้" });
  //    return
  // }
  await Pharmacist.findByIdAndUpdate(pharmacistId,{bookedSlots:nextBookedSlots})

  // const { error: updateError } = await supabase
  //   .from("pharmacists")
  //   .update({ booked_slots: nextBookedSlots })
  //   .eq("id", pharmacistId);

  // if (updateError) {
  //   console.error("Failed reserving booked slot", updateError);
  //   await supabase.from("patient_handoffs").delete().eq("id", handoffId);
  //    res.status(500).json({ ok: false, error: "ไม่สามารถจองช่วงเวลานี้ได้" });
  //    return
  // }

   res.json({ ok: true, handoffId });

  
});

export { router as bookingsRouter };
