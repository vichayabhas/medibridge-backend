import { Router } from "express";
import { getArticles } from "../controllers/article";

const router=Router()
router.get('/getArticles/',async(req,res)=>{
    res.status(200).json(await getArticles())
})
export default router