import { Router } from "express";
import { updateOrderStatus } from "../controllers/order";

const router=Router()
router.put('/updateOrderStatus/:id',updateOrderStatus)
export default router