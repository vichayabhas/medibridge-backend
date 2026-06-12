import { Router } from "express";
import { createArticle, getArticle, getArticles } from "../controllers/article";

const router = Router();
router.get("/getArticles/", async (req, res) => {
  res.status(200).json(await getArticles());
});
router.get("/getArticle/:id", getArticle);
router.post("/createArticle/", createArticle);
export default router;
