// import { Request, Response } from "express";

import { Request, Response } from "express";
import Article from "../models/Article";
import { ArticleReady } from "../models/interface";
import Pharmacist from "../models/Pharmacist";
import { sendRes } from "./setup";

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
