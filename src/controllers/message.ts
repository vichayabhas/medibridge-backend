import { Request, Response } from "express";
import { CreateTextMessage } from "../models/interface";
import TelemededicineMessage from "../models/TelemededicineMessage";

export async function createTextMessage(req:Request,res:Response){
    const data:CreateTextMessage=req.body
    const output=await TelemededicineMessage.create(data)
    res.status(200).json(output)
}