import { Router } from "express";
import { createTextMessage } from "../controllers/message";

const router=Router()
router.post('/text/',createTextMessage)