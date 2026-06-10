// import { Request, Response } from "express";

import Article from "../models/Article";
import { ArticleReady } from "../models/interface";
import Pharmacist from "../models/Pharmacist";

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
        createdAt: createAt,
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
  articlesReady.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return articlesReady;
}
