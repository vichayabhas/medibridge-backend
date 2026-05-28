import { Router, type Request, type Response } from "express";



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
router.post("/validate", async (req: Request, res: Response) => {
  const { pharmacistId, slot, duration, dayOffset } = req.body as {
    pharmacistId: string;
    slot: string;
    duration: number;
    dayOffset: number;
  };

  if (!pharmacistId || !slot || typeof duration !== "number" || typeof dayOffset !== "number") {
     res.status(400).json({ ok: false, error: "Missing required fields" });
     return
  }

  // 1. Must book at least 5 minutes in the future (today only)
  if (dayOffset === 0) {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    if (toMins(slot) < nowMins + 5) {
       res.status(409).json({ ok: false, error: "ต้องจองล่วงหน้าอย่างน้อย 5 นาที" });
       return
    }
  }

  // 2. Slot must not overlap a booked slot (with 1-minute buffer, today only)
  if (dayOffset === 0) {
    const { data: pharmacist, error } = await supabase
      .from("pharmacists")
      .select("id, booked_slots")
      .eq("id", pharmacistId)
      .single();

    if (error || !pharmacist) {
       res.status(404).json({ ok: false, error: "ไม่พบข้อมูลเภสัชกร" });
       return
    }

    const bookedSlots: string[] = (pharmacist.booked_slots as string[]) ?? [];
    const startM = toMins(slot);
    const endM = startM + duration;
    const conflict = bookedSlots.some((b) => {
      const bM = toMins(b);
      return (bM - 1) < endM && (bM + duration + 1) > startM;
    });

    if (conflict) {
       res.status(409).json({ ok: false, error: "ช่วงเวลานี้ถูกจองแล้ว กรุณาเลือกเวลาอื่น" });
       return
    }
  }

   res.json({ ok: true });
   return
});

export { router as bookingsRouter };
