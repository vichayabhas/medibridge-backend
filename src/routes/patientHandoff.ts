import { Router } from "express";
import {
  getPatientHandoffs,
  getRoomUrlForHandoff,
} from "../controllers/cleanPatientHandoffs";

const router = Router();
router.get("/getPatientHandoffs/", async (req, res) => {
  res.status(200).json(await getPatientHandoffs());
});
router.get("/getRoomUrlForHandoff/:id", async (req, res) => {
  res.status(200).json(await getRoomUrlForHandoff(req.params.id));
});
export default router;
