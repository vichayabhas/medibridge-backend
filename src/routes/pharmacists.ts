import express from "express";
import Review from "../models/Review";

const router = express.Router();

router.get("/:pharmacistId/rating", async (req, res) => {
  const { pharmacistId } = req.params;

  if (!pharmacistId) {
    res.status(400).json({ error: "Pharmacist ID is required" });
    return;
  }

  try {
    const data = await Review.find({
      targetId: pharmacistId,
      targetType: "pharmacist",
    });

    if (!data || data.length === 0) {
      res.json({ average_rating: 0, review_count: 0, reviews: [] });
      return;
    }
    data.sort((a, b) => b.createAt.getTime() - a.createAt.getTime());

    const totalRating = data.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / data.length;
    const reviewCount = data.length;

    res.json({
      average_rating: averageRating,
      review_count: reviewCount,
      reviews: data,
    });
    return;
  } catch (error) {
    console.error("Unexpected error fetching pharmacist rating:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

export default router;
