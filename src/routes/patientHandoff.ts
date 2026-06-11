import { Router } from "express";
import {
  getPatientHandoffs,
  getRoomUrlForHandoff,
  updatePatientHandoff,
} from "../controllers/cleanPatientHandoffs";

const router = Router();
router.get("/getPatientHandoffs/", async (req, res) => {
  res.status(200).json(await getPatientHandoffs(req));
});
router.get("/getRoomUrlForHandoff/:id", async (req, res) => {
  res.status(200).json(await getRoomUrlForHandoff(req.params.id));
});
router.put("/updatePatientHandoff/:id", async (req, res) => {
  const out = await updatePatientHandoff(req.params.id, req.body);
  res.status(200).json(out);
});
export default router;
