import { Router } from 'express';
import { z } from 'zod';
import { authenticate, optionalAuth } from '../middleware/auth';
import { Review, Product, Order } from '../models';

const router = Router();

// Validation schemas
const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  comment: z.string().min(1).max(1000),
  images: z.array(z.string()).optional(),
});

// Get reviews for a product
router.get('/product/:productId', optionalAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    let sortQuery: any = { createdAt: -1 };
    if (sort === 'oldest') sortQuery = { createdAt: 1 };
    if (sort === 'rating-high') sortQuery = { rating: -1, createdAt: -1 };
    if (sort === 'rating-low') sortQuery = { rating: 1, createdAt: -1 };
    if (sort === 'helpful') sortQuery = { helpful: -1, createdAt: -1 };

    const reviews = await Review.find({ product: productId, isActive: true })
      .populate('user', 'firstName lastName')
      .sort(sortQuery)
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await Review.countDocuments({ product: productId, isActive: true });

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { product: productId, isActive: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const averageRating = await Review.aggregate([
      { $match: { product: productId, isActive: true } },
      { $group: { _id: null, average: { $avg: '$rating' }, total: { $sum: 1 } } }
    ]);

    res.json({
      reviews,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
      stats: {
        averageRating: averageRating[0]?.average || 0,
        totalReviews: averageRating[0]?.total || 0,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Create a review
router.post('/', authenticate, async (req, res) => {
  try {
    const validatedData = reviewSchema.parse(req.body);
    const userId = req.user!.userId;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: validatedData.productId,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Check if user purchased this product
    const hasPurchased = await Order.findOne({
      user: userId,
      'items.product': validatedData.productId,
      paymentStatus: 'paid',
    });

    const review = new Review({
      user: userId,
      product: validatedData.productId,
      rating: validatedData.rating,
      title: validatedData.title,
      comment: validatedData.comment,
      images: validatedData.images || [],
      verified: !!hasPurchased,
    });

    await review.save();
    await review.populate('user', 'firstName lastName');

    // Update product rating
    await updateProductRating(validatedData.productId);

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Failed to create review' });
  }
});

// Update a review
router.put('/:id', authenticate, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user!.userId;
    const validatedData = reviewSchema.omit({ productId: true }).parse(req.body);

    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    Object.assign(review, validatedData);
    await review.save();
    await review.populate('user', 'firstName lastName');

    // Update product rating
    await updateProductRating(review.product.toString());

    res.json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user!.userId;

    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    const productId = review.product.toString();
    review.isActive = false;
    await review.save();

    // Update product rating
    await updateProductRating(productId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

// Mark review as helpful
router.post('/:id/helpful', authenticate, async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    ).populate('user', 'firstName lastName');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      message: 'Review marked as helpful',
      review,
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({ message: 'Failed to mark review as helpful' });
  }
});

// Get user's reviews
router.get('/user/me', authenticate, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ user: userId, isActive: true })
      .populate('product', 'name image slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await Review.countDocuments({ user: userId, isActive: true });

    res.json({
      reviews,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Helper function to update product rating
async function updateProductRating(productId: string) {
  try {
    const stats = await Review.aggregate([
      { $match: { product: productId, isActive: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const { averageRating = 0, reviewCount = 0 } = stats[0] || {};

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount,
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

export default router;
