import { Request, Response } from "express";
import { getArticles } from "./article";
import {
  HomePageData,
  PharmacistType,
  PharmacyWithDistance,
} from "../models/interface";
import Pharmacy from "../models/Pharmacy";
import Pharmacist from "../models/Pharmacist";

export async function getHomePageData(req: Request, res: Response) {
  const articleReadies = await getArticles();
  const homePageData: HomePageData = { articleReadies };
  res.status(200).json(homePageData);
}
export async function loadAllPharmacyAndPharmacist(
  req: Request,
  res: Response,
) {
  // loadAll: async () => {
  //     set({ pharmacistsLoading: true, pharmacistsError: null });
  //     try {
  //       const [
  //         { data: pharmaciesData, error: pharmsErr },
  //         { data: pharmacistsData, error: rphErr },
  //       ] = await Promise.all([
  //         supabase.from("pharmacies").select("*"),
  //         supabase.from("pharmacists").select("*"),
  //       ]);
  //       if (pharmsErr) console.error("[loadAll] pharmacies error:", pharmsErr);
  //       if (rphErr) console.error("[loadAll] pharmacists error:", rphErr);
  //       const pharmacists: PharmacistRow[] = (pharmacistsData ?? []).map(
  //         mapPharmacistRow,
  //       );
  const pharmaciesRaw = await Pharmacy.find();
  const pharmacists: PharmacistType[] = [];
  const pharmacies: PharmacyWithDistance[] = [];
  let i = 0;
  while (i < pharmaciesRaw.length) {
    const pharmacy = pharmaciesRaw[i++];
    let j = 0;
    const pharmacistsWithPharmacy: PharmacistType[] = [];
    while (j < pharmacy.pharmacistIds.length) {
      const pharmacist = await Pharmacist.findById(pharmacy.pharmacistIds[j++]);
      if (!pharmacist) {
        continue;
      }
      pharmacists.push(pharmacist);
      pharmacistsWithPharmacy.push(pharmacist);
    }

    //       const pharmacies = (pharmaciesData ?? []).map(mapPharmacyRow);
    //       const withDistance: PharmacyWithDistance[] = pharmacies.map((p) => {
    //         const rphs = pharmacists.filter((rph) => rph.pharmacyId === p.id);
    //         return {
    //           ...p,
    //           distance: 0,
    //           isOpen: isPharmacyOpen(p.openingHours),
    //           onlinePharmacists: rphs.filter((r) => r.availability === "online")
    //             .length,
    //           estimatedWaitTime: 0,
    //         };
    //       });
    pharmacies.push({
      ...pharmacy,
      distance: 0,
      isOpen: true,
      onlinePharmacists: pharmacistsWithPharmacy.filter(
        (r) => r.availability === "online",
      ).length,
      estimatedWaitTime: 0,
      lat: 0,
      lng: 0,
    });
  }
  res.status(200).json({ pharmacies, pharmacists });
  //       set({ pharmacies: withDistance, pharmacists, pharmacistsLoading: false });
  //     } catch (err) {
  //       console.error("[loadAll] unexpected error:", err);
  //       set({
  //         pharmacistsLoading: false,
  //         pharmacistsError: "โหลดข้อมูลเภสัชกรไม่สำเร็จ",
  //       });
  //     }
  //   },
}
