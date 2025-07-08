import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { Wishlist, Product } from '../models';

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

// Validation schemas
const addToWishlistSchema = z.object({
  productId: z.string(),
});

// Get user's wishlist
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.userId;

    let wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name slug price originalPrice image inStock stockQuantity rating reviewCount',
        populate: {
          path: 'category brand',
          select: 'name slug',
        },
      });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
      await wishlist.save();
    }

    // Filter out inactive products
    const activeItems = wishlist.items.filter(item => 
      item.product && (item.product as any).isActive !== false
    );

    res.json({
      wishlist: {
        ...wishlist.toObject(),
        items: activeItems,
      },
      totalItems: activeItems.length,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
});

// Add product to wishlist
router.post('/add', async (req, res) => {
  try {
    const validatedData = addToWishlistSchema.parse(req.body);
    const userId = req.user!.userId;
    const { productId } = validatedData;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    // Check if product is already in wishlist
    const existingItem = wishlist.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    // Add product to wishlist
    wishlist.items.push({
      product: productId,
      addedAt: new Date(),
    });

    await wishlist.save();

    // Populate the newly added item
    await wishlist.populate({
      path: 'items.product',
      select: 'name slug price originalPrice image inStock stockQuantity rating reviewCount',
      populate: {
        path: 'category brand',
        select: 'name slug',
      },
    });

    res.status(201).json({
      message: 'Product added to wishlist',
      wishlist,
      totalItems: wishlist.items.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors,
      });
    }
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Failed to add product to wishlist' });
  }
});

// Remove product from wishlist
router.delete('/remove/:productId', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Remove product from wishlist
    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    if (wishlist.items.length === initialLength) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    await wishlist.save();

    // Populate the remaining items
    await wishlist.populate({
      path: 'items.product',
      select: 'name slug price originalPrice image inStock stockQuantity rating reviewCount',
      populate: {
        path: 'category brand',
        select: 'name slug',
      },
    });

    res.json({
      message: 'Product removed from wishlist',
      wishlist,
      totalItems: wishlist.items.length,
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Failed to remove product from wishlist' });
  }
});

// Clear entire wishlist
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({
      message: 'Wishlist cleared successfully',
      wishlist,
      totalItems: 0,
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Failed to clear wishlist' });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.json({ inWishlist: false });
    }

    const isInWishlist = wishlist.items.some(
      item => item.product.toString() === productId
    );

    res.json({ inWishlist: isInWishlist });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ message: 'Failed to check wishlist' });
  }
});

// Move wishlist items to cart (would need cart implementation)
router.post('/move-to-cart', async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { productIds } = req.body; // Array of product IDs to move

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Remove specified items from wishlist
    if (productIds && Array.isArray(productIds)) {
      wishlist.items = wishlist.items.filter(
        item => !productIds.includes(item.product.toString())
      );
    } else {
      // Move all items
      wishlist.items = [];
    }

    await wishlist.save();

    res.json({
      message: 'Items moved to cart successfully',
      remainingItems: wishlist.items.length,
    });
  } catch (error) {
    console.error('Error moving to cart:', error);
    res.status(500).json({ message: 'Failed to move items to cart' });
  }
});

// Get wishlist statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const wishlist = await Wishlist.findOne({ user: userId })
      .populate('items.product', 'price originalPrice');

    if (!wishlist) {
      return res.json({
        totalItems: 0,
        totalValue: 0,
        averagePrice: 0,
      });
    }

    const activeItems = wishlist.items.filter(item => item.product);
    const totalValue = activeItems.reduce((sum, item) => {
      const product = item.product as any;
      return sum + (product.price || 0);
    }, 0);

    const averagePrice = activeItems.length > 0 ? totalValue / activeItems.length : 0;

    res.json({
      totalItems: activeItems.length,
      totalValue: Math.round(totalValue * 100) / 100,
      averagePrice: Math.round(averagePrice * 100) / 100,
    });
  } catch (error) {
    console.error('Error fetching wishlist stats:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist statistics' });
  }
});

export default router;
