import express from "express";
import {
  register,
  login,
  getMe,
  checkPassword,
  updateProfile,
  getPharmacistData,
} from "../controllers/user";
import { protect } from "../middleware/auth";
// import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/register", register); //
router.post("/login", login); //
router.get("/me", getMe); //
router.post("/checkPassword/", checkPassword); //
router.put("/updateProfile/", protect, updateProfile);
router.get("/getPharmacistData/",protect, getPharmacistData);

export default router;
