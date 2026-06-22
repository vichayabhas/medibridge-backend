import { Request, Response } from "express";
import Order from "../models/Order";
import { sendRes } from "./setup";
import Pharmacist from "../models/Pharmacist";
import Pharmacy from "../models/Pharmacy";
import { OrderType } from "../models/interface";

export async function updateOrderStatus(req: Request, res: Response) {
  const newOrder = await Order.findByIdAndUpdate(req.params.id.toString(), req.body);
  if (!newOrder) {
    sendRes(res, false);
    return;
  }
  const pharmacist = await Pharmacist.findById(newOrder.pharmacistId);
  if (!pharmacist) {
    sendRes(res, false);
    return;
  }
  const pharmacy = await Pharmacy.findById(pharmacist.pharmacyId);
  if (!pharmacy) {
    sendRes(res, false);
    return;
  }
  const orders: OrderType[] = [];
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
  res.status(200).json(orders);
}
