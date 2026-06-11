import { Router } from "express";
import { getArticle, getArticles } from "../controllers/article";

const router=Router()
router.get('/getArticles/',async(req,res)=>{
    res.status(200).json(await getArticles())
})
router.get('/getArticle/:id',getArticle)
export default router