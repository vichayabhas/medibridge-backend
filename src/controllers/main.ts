import { Request, Response } from "express";
import { getArticles } from "./article";
import {
  AdminData,
  HomePageData,
  OrderType,
  PharmacistType,
  PharmacyWithDistance,
} from "../moduleSupport/interface";
import Pharmacy from "../models/Pharmacy";
import Pharmacist from "../models/Pharmacist";
import { getUser } from "../middleware/auth";
import { sendRes } from "./setup";
import Article from "../models/Article";
import Order from "../models/Order";
import mongoose from "mongoose";

export async function getHomePageData(req: Request, res: Response) {
  const articleReadies = await getArticles();
  const homePageData: HomePageData = { articleReadies };
  res.status(200).json(homePageData);
}
export async function loadAllPharmacyAndPharmacist() {
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
  return { pharmacies, pharmacists };
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
export async function getAdminData(req: Request, res: Response) {
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
  const articles = await getArticles();
  const data: AdminData = {
    pharmacists,
    articles,
    pharmacies,
  };
  res.status(200).json(data);
}
export async function articleAction(req: Request, res: Response) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  if (user.role != "admin") {
    sendRes(res, false);
    return;
  }
  await Article.findByIdAndUpdate(req.params.id.toString(), req.body);
  const articles = await getArticles();
  res.status(200).json(articles);
}
export async function pharmacistAction(req: Request, res: Response) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  if (user.role != "admin") {
    sendRes(res, false);
    return;
  }
  const pharmacist = await Pharmacist.findByIdAndUpdate(
    req.params.id.toString(),
    req.body,
  );
  const { pharmacies, pharmacists } = await loadAllPharmacyAndPharmacist();
  res.status(200).json({ pharmacies, pharmacists, pharmacist });
}
export async function pharmacyAction(req: Request, res: Response) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  if (user.role != "admin") {
    sendRes(res, false);
    return;
  }
  const pharmacyRaw = await Pharmacy.findByIdAndUpdate(req.params.id.toString(), req.body);
  if (!pharmacyRaw) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  const pharmacistsWithPharmacy: PharmacistType[] = [];
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
  const { pharmacies, pharmacists } = await loadAllPharmacyAndPharmacist();
  res.status(200).json({ pharmacies, pharmacists, pharmacy });
}
export async function getPharmacyDashboardData(req: Request, res: Response) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const orders: OrderType[] = [];
  const pharmacy = await Pharmacy.findById(new mongoose.Types.ObjectId(user.roleId?.toString()));
  if (!pharmacy) {
    res.status(200).json({ orders, pharmacy });
    return;
  }

  // const pharmacists: PharmacistType[] = [];
  let i = 0;
  while (i < pharmacy.pharmacistIds.length) {
    const pharmacist = await Pharmacist.findById(pharmacy.pharmacistIds[i++]);
    if (!pharmacist) {
      continue;
    }
    // pharmacists.push(pharmacist);
    let j = 0;
    while (i < pharmacist.orderIds.length) {
      const order = await Order.findById(pharmacist.orderIds[j++]);
      if (!order) {
        continue;
      }
      if (order.fulfillment == "delivery") {
        continue;
      }
      orders.push(order);
    }
  }
  res.status(200).json({ orders, pharmacy });
}
