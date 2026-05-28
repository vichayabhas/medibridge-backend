import express from 'express';

const router = express.Router();

router.get('/:pharmacistId/rating', async (req, res) => {
  const { pharmacistId } = req.params;

  if (!pharmacistId) {
     res.status(400).json({ error: 'Pharmacist ID is required' });
     return
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating, comment, user_name, created_at')
      .eq('target_id', pharmacistId)
      .eq('target_type', 'pharmacist')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
       res.status(500).json({ error: 'Failed to fetch reviews' });
       return
    }

    if (!data || data.length === 0) {
       res.json({ average_rating: 0, review_count: 0, reviews: [] });
       return
    }

    const totalRating = data.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / data.length;
    const reviewCount = data.length;

     res.json({ average_rating: averageRating, review_count: reviewCount, reviews: data });
     return
  } catch (error) {
    console.error('Unexpected error fetching pharmacist rating:', error);
     res.status(500).json({ error: 'Internal server error' });
     return
  }
});

export default router;
