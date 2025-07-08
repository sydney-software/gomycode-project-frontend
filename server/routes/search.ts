import { Router } from 'express';
import { SearchService } from '../services/searchService';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Advanced product search
router.get('/products', optionalAuth, async (req, res) => {
  try {
    const {
      q: query,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      featured,
      tags,
      sortBy,
      page,
      limit,
    } = req.query;

    const filters = {
      query: query as string,
      category: category as string,
      brand: brand as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      rating: rating ? parseFloat(rating as string) : undefined,
      inStock: inStock === 'true' ? true : inStock === 'false' ? false : undefined,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      tags: tags ? (tags as string).split(',') : undefined,
      sortBy: sortBy as any,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    };

    const result = await SearchService.searchProducts(filters);
    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.json({ suggestions: [] });
    }

    const suggestions = await SearchService.getSearchSuggestions(query);
    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ message: 'Failed to get suggestions' });
  }
});

// Get popular search terms
router.get('/popular', async (req, res) => {
  try {
    const { limit } = req.query;
    const popularTerms = await SearchService.getPopularSearchTerms(
      limit ? parseInt(limit as string) : 10
    );
    res.json({ popularTerms });
  } catch (error) {
    console.error('Popular terms error:', error);
    res.status(500).json({ message: 'Failed to get popular terms' });
  }
});

// Get trending products
router.get('/trending', async (req, res) => {
  try {
    const { limit } = req.query;
    const trendingProducts = await SearchService.getTrendingProducts(
      limit ? parseInt(limit as string) : 10
    );
    res.json({ products: trendingProducts });
  } catch (error) {
    console.error('Trending products error:', error);
    res.status(500).json({ message: 'Failed to get trending products' });
  }
});

// Get recently viewed products (requires user session)
router.get('/recently-viewed', optionalAuth, async (req, res) => {
  try {
    const { productIds, limit } = req.query;
    
    if (!productIds) {
      return res.json({ products: [] });
    }

    const ids = typeof productIds === 'string' ? productIds.split(',') : [];
    const recentProducts = await SearchService.getRecentlyViewedProducts(
      ids,
      limit ? parseInt(limit as string) : 10
    );
    
    res.json({ products: recentProducts });
  } catch (error) {
    console.error('Recently viewed error:', error);
    res.status(500).json({ message: 'Failed to get recently viewed products' });
  }
});

// Quick search (simplified search for autocomplete)
router.get('/quick', async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.json({ results: [] });
    }

    const result = await SearchService.searchProducts({
      query,
      limit: parseInt(limit as string),
      sortBy: 'relevance',
    });

    // Return simplified results for quick search
    const quickResults = result.products.map(product => ({
      id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      category: product.category?.name,
      brand: product.brand?.name,
    }));

    res.json({ results: quickResults });
  } catch (error) {
    console.error('Quick search error:', error);
    res.status(500).json({ message: 'Quick search failed' });
  }
});

export default router;
