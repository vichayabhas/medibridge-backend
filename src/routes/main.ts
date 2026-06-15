import { Router } from "express";
import {
  articleAction,
  getAdminData,
  getHomePageData,
  loadAllPharmacyAndPharmacist,
  pharmacistAction,
  pharmacyAction,
} from "../controllers/main";

const router = Router();
router.get("/getHomePageData/", getHomePageData);
router.get("/loadAllPharmacyAndPharmacist/", loadAllPharmacyAndPharmacist);
router.get("/getAdminData/", getAdminData);
router.put("/articleAction/:id", articleAction);
router.put("/pharmacistAction/:id", pharmacistAction);
router.put("/pharmacyAction/:id", pharmacyAction);
export default router;
