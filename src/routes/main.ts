import { Router } from "express";
import {
  articleAction,
  getAdminData,
  getHomePageData,
  getPharmacyDashboardData,
  loadAllPharmacyAndPharmacist,
  pharmacistAction,
  pharmacyAction,
} from "../controllers/main";

const router = Router();
router.get("/getHomePageData/", getHomePageData);
router.get("/loadAllPharmacyAndPharmacist/", async (req, res) => {
  const data = await loadAllPharmacyAndPharmacist();
  res.status(200).json(data);
});
router.get("/getAdminData/", getAdminData);
router.put("/articleAction/:id", articleAction);
router.put("/pharmacistAction/:id", pharmacistAction);
router.put("/pharmacyAction/:id", pharmacyAction);
router.get("/getPharmacyDashboardData/", getPharmacyDashboardData);
export default router;
