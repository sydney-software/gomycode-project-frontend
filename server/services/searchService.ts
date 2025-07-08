import { Product, Category, Brand } from '../models';

export interface SearchFilters {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  tags?: string[];
  sortBy?: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  products: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    categories: any[];
    brands: any[];
    priceRange: { min: number; max: number };
    ratings: number[];
  };
  suggestions?: string[];
}

export class SearchService {
  static async searchProducts(filters: SearchFilters): Promise<SearchResult> {
    const {
      query,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      featured,
      tags,
      sortBy = 'relevance',
      page = 1,
      limit = 20,
    } = filters;

    // Build MongoDB query
    const mongoQuery: any = { isActive: true };

    // Text search
    if (query) {
      mongoQuery.$text = { $search: query };
    }

    // Category filter
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        mongoQuery.category = categoryDoc._id;
      }
    }

    // Brand filter
    if (brand) {
      const brandDoc = await Brand.findOne({ slug: brand });
      if (brandDoc) {
        mongoQuery.brand = brandDoc._id;
      }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      mongoQuery.price = {};
      if (minPrice !== undefined) mongoQuery.price.$gte = minPrice;
      if (maxPrice !== undefined) mongoQuery.price.$lte = maxPrice;
    }

    // Rating filter
    if (rating !== undefined) {
      mongoQuery.rating = { $gte: rating };
    }

    // Stock filter
    if (inStock !== undefined) {
      mongoQuery.inStock = inStock;
    }

    // Featured filter
    if (featured !== undefined) {
      mongoQuery.featured = featured;
    }

    // Tags filter
    if (tags && tags.length > 0) {
      mongoQuery.tags = { $in: tags };
    }

    // Build sort query
    let sortQuery: any = {};
    switch (sortBy) {
      case 'price-low':
        sortQuery = { price: 1 };
        break;
      case 'price-high':
        sortQuery = { price: -1 };
        break;
      case 'rating':
        sortQuery = { rating: -1, reviewCount: -1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'popular':
        sortQuery = { reviewCount: -1, rating: -1 };
        break;
      case 'relevance':
      default:
        if (query) {
          sortQuery = { score: { $meta: 'textScore' } };
        } else {
          sortQuery = { featured: -1, rating: -1, createdAt: -1 };
        }
        break;
    }

    // Execute search query
    let productQuery = Product.find(mongoQuery)
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .sort(sortQuery);

    // Add text score for relevance sorting
    if (query && sortBy === 'relevance') {
      productQuery = productQuery.select({ score: { $meta: 'textScore' } });
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const products = await productQuery.skip(skip).limit(limit);

    // Get total count
    const total = await Product.countDocuments(mongoQuery);

    // Get filter options
    const [categories, brands, priceRange] = await Promise.all([
      this.getAvailableCategories(mongoQuery),
      this.getAvailableBrands(mongoQuery),
      this.getPriceRange(mongoQuery),
    ]);

    // Generate search suggestions
    const suggestions = query ? await this.getSearchSuggestions(query) : [];

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        categories,
        brands,
        priceRange,
        ratings: [5, 4, 3, 2, 1],
      },
      suggestions,
    };
  }

  static async getAvailableCategories(baseQuery: any) {
    const pipeline = [
      { $match: baseQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { _id: '$category._id', name: '$category.name', slug: '$category.slug', count: 1 } },
      { $sort: { count: -1 } },
    ];

    return await Product.aggregate(pipeline);
  }

  static async getAvailableBrands(baseQuery: any) {
    const pipeline = [
      { $match: baseQuery },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $lookup: { from: 'brands', localField: '_id', foreignField: '_id', as: 'brand' } },
      { $unwind: '$brand' },
      { $project: { _id: '$brand._id', name: '$brand.name', slug: '$brand.slug', count: 1 } },
      { $sort: { count: -1 } },
    ];

    return await Product.aggregate(pipeline);
  }

  static async getPriceRange(baseQuery: any) {
    const pipeline = [
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          min: { $min: '$price' },
          max: { $max: '$price' },
        },
      },
    ];

    const result = await Product.aggregate(pipeline);
    return result[0] || { min: 0, max: 0 };
  }

  static async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      // Get product names that match the query
      const productSuggestions = await Product.find(
        { $text: { $search: query }, isActive: true },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(5)
        .select('name');

      // Get category names that match
      const categorySuggestions = await Category.find({
        name: { $regex: query, $options: 'i' },
        isActive: true,
      })
        .limit(3)
        .select('name');

      // Get brand names that match
      const brandSuggestions = await Brand.find({
        name: { $regex: query, $options: 'i' },
        isActive: true,
      })
        .limit(3)
        .select('name');

      // Combine and deduplicate suggestions
      const suggestions = [
        ...productSuggestions.map(p => p.name),
        ...categorySuggestions.map(c => c.name),
        ...brandSuggestions.map(b => b.name),
      ];

      return [...new Set(suggestions)].slice(0, 8);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  static async getPopularSearchTerms(limit = 10): Promise<string[]> {
    // This would typically be implemented with a search analytics collection
    // For now, return some common terms
    return [
      'iPhone',
      'Samsung',
      'MacBook',
      'laptop',
      'smartphone',
      'gaming',
      'wireless',
      'bluetooth',
      'camera',
      'storage',
    ].slice(0, limit);
  }

  static async getTrendingProducts(limit = 10) {
    return await Product.find({ isActive: true })
      .sort({ reviewCount: -1, rating: -1 })
      .limit(limit)
      .populate('category brand', 'name slug')
      .select('name slug price originalPrice image rating reviewCount');
  }

  static async getRecentlyViewedProducts(productIds: string[], limit = 10) {
    return await Product.find({
      _id: { $in: productIds },
      isActive: true,
    })
      .limit(limit)
      .populate('category brand', 'name slug')
      .select('name slug price originalPrice image rating reviewCount');
  }
}
