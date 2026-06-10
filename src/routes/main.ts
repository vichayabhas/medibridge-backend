import { Router } from "express";
import {
  getHomePageData,
  loadAllPharmacyAndPharmacist,
} from "../controllers/main";

const router = Router();
router.get("/getHomePageData/", getHomePageData);
router.get("/loadAllPharmacyAndPharmacist/", loadAllPharmacyAndPharmacist);
export default router;
