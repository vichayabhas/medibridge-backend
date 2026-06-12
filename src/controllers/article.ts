// import { Request, Response } from "express";

import { Request, Response } from "express";
import Article from "../models/Article";
import { ArticleReady, CreateArticle } from "../models/interface";
import Pharmacist from "../models/Pharmacist";
import { sendRes, swop } from "./setup";
import { getUser } from "../middleware/auth";
import { getPharmacistFromUserId } from "./user";

export async function getArticles() {
  const articlesReady: ArticleReady[] = [];
  let i = 0;
  const pharmacists = await Pharmacist.find();
  while (i < pharmacists.length) {
    const pharmacist = pharmacists[i++];
    let j = 0;
    while (j < pharmacist.articlesIds.length) {
      const article = await Article.findById(pharmacist.articlesIds[j++]);
      if (!article) {
        continue;
      }
      const {
        authorId,
        _id,
        createAt,
        isAIGenerated,
        category,
        coverImage,
        tags,
        title,
        excerpt,
        views,
        status,
        body,
      } = article;
      articlesReady.push({
        authorName: pharmacist.name,
        authorId,
        _id,
        category,
        coverImage,
        createAt,
        isAIGenerated,
        title,
        excerpt,
        body,
        tags,
        views,
        status,
      });
    }
  }
  articlesReady.sort((a, b) => b.createAt.getTime() - a.createAt.getTime());
  return articlesReady;
}
export async function getArticle(req: Request, res: Response) {
  const article = await Article.findById(req.params.id);
  if (!article) {
    sendRes(res, false);
    return;
  }
  const pharmacist = await Pharmacist.findById(article.authorId);
  if (!pharmacist) {
    sendRes(res, false);
    return;
  }
  const {
    authorId,
    _id,
    createAt,
    isAIGenerated,
    category,
    coverImage,
    tags,
    title,
    excerpt,
    views,
    status,
    body,
  } = article;
  const articleReady: ArticleReady = {
    authorName: pharmacist.name,
    authorId,
    _id,
    category,
    coverImage,
    createAt,
    isAIGenerated,
    title,
    excerpt,
    body,
    tags,
    views,
    status,
  };
  await article.updateOne({ views: views + 1 });
  res.status(200).json(articleReady);
}
export async function createArticle(req: Request, res: Response) {
  const user = await getUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const pharmacist = await getPharmacistFromUserId(user._id);
  if (!pharmacist) {
    sendRes(res, false);
    return;
  }
  const {
    title,
    category,
    coverImage,
    excerpt,
    body,
    tags,
    isAIGenerated,
  }: CreateArticle = req.body;
  const article = await Article.create({
    tags,
    title,
    category,
    coverImage,
    excerpt,
    body,
    isAIGenerated,
    authorId: pharmacist._id,
  });
  await pharmacist.updateOne({
    articlesIds: swop(null, article._id, pharmacist.articlesIds),
  });
  res.status(200).json(article);
}
