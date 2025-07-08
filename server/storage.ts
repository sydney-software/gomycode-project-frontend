import { User, Category, Brand, Product, Order, IUser, ICategory, IBrand, IProduct, IOrder, IOrderItem } from './models';
import mongoose from 'mongoose';

// Types for compatibility with existing frontend
export type ProductWithDetails = IProduct & {
  category: ICategory;
  brand: IBrand;
};

export type OrderWithItems = IOrder & {
  items: (IOrderItem & { product: IProduct })[];
};

export type InsertUser = Partial<IUser>;
export type InsertCategory = Partial<ICategory>;
export type InsertBrand = Partial<IBrand>;
export type InsertProduct = Partial<IProduct>;
export type InsertOrder = Partial<IOrder>;
export type InsertOrderItem = {
  product: string;
  quantity: number;
  price: number;
  total: number;
};

export interface IStorage {
  // Users
  getUser(id: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  createUser(user: InsertUser): Promise<IUser>;

  // Categories
  getCategories(): Promise<ICategory[]>;
  getCategory(id: string): Promise<ICategory | null>;
  getCategoryBySlug(slug: string): Promise<ICategory | null>;

  // Brands
  getBrands(): Promise<IBrand[]>;
  getBrand(id: string): Promise<IBrand | null>;

  // Products
  getProducts(filters?: {
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ProductWithDetails[]>;
  getProduct(id: string): Promise<ProductWithDetails | null>;
  getProductBySlug(slug: string): Promise<ProductWithDetails | null>;
  getFeaturedProducts(limit?: number): Promise<ProductWithDetails[]>;

  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  getOrder(id: string): Promise<OrderWithItems | null>;
  getUserOrders(userId: string): Promise<OrderWithItems[]>;
}

// Mock data for fallback when database is not available
const mockData = {
  categories: [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest smartphones and mobile phones',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '507f1f77bcf86cd799439012',
      name: 'Laptops',
      slug: 'laptops',
      description: 'Laptops and portable computers',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  brands: [
    {
      _id: '507f1f77bcf86cd799439021',
      name: 'Apple',
      slug: 'apple',
      logo: '/images/brands/apple.png',
      description: 'Apple Inc. products',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '507f1f77bcf86cd799439022',
      name: 'Samsung',
      slug: 'samsung',
      logo: '/images/brands/samsung.png',
      description: 'Samsung Electronics',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '507f1f77bcf86cd799439023',
      name: 'Dell',
      slug: 'dell',
      logo: '/images/brands/dell.png',
      description: 'Dell Technologies',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '507f1f77bcf86cd799439024',
      name: 'HP',
      slug: 'hp',
      logo: '/images/brands/hp.png',
      description: 'HP Inc.',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  products: [
    {
      _id: '507f1f77bcf86cd799439031',
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'The latest iPhone with advanced features and A17 Pro chip',
      price: 999,
      originalPrice: 1099,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
      images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'],
      category: '507f1f77bcf86cd799439011',
      brand: '507f1f77bcf86cd799439021',
      inStock: true,
      stockQuantity: 50,
      featured: true,
      specifications: {
        display: '6.1-inch Super Retina XDR',
        processor: 'A17 Pro chip',
        storage: '128GB',
        camera: '48MP Main camera'
      },
      rating: 4.8,
      reviewCount: 245,
      tags: ['smartphone', 'ios', 'premium'],
      sku: 'IPH15PRO128',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '507f1f77bcf86cd799439032',
      name: 'Samsung Galaxy S24',
      slug: 'samsung-galaxy-s24',
      description: 'Flagship Android smartphone with AI features',
      price: 799,
      originalPrice: 899,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'],
      category: '507f1f77bcf86cd799439011',
      brand: '507f1f77bcf86cd799439022',
      inStock: true,
      stockQuantity: 30,
      featured: true,
      specifications: {
        display: '6.2-inch Dynamic AMOLED 2X',
        processor: 'Snapdragon 8 Gen 3',
        storage: '256GB',
        camera: '50MP Triple camera'
      },
      rating: 4.6,
      reviewCount: 189,
      tags: ['smartphone', 'android', 'flagship'],
      sku: 'SGS24256',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '507f1f77bcf86cd799439033',
      name: 'MacBook Pro 14"',
      slug: 'macbook-pro-14',
      description: 'Professional laptop with M3 chip for demanding workflows',
      price: 1999,
      originalPrice: 2199,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
      category: '507f1f77bcf86cd799439012',
      brand: '507f1f77bcf86cd799439021',
      inStock: true,
      stockQuantity: 15,
      featured: true,
      specifications: {
        display: '14.2-inch Liquid Retina XDR',
        processor: 'Apple M3 chip',
        memory: '16GB',
        storage: '512GB SSD'
      },
      rating: 4.9,
      reviewCount: 156,
      tags: ['laptop', 'professional', 'macos'],
      sku: 'MBP14M3512',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '507f1f77bcf86cd799439034',
      name: 'Dell XPS 13',
      slug: 'dell-xps-13',
      description: 'Ultra-portable laptop with premium design and performance',
      price: 1299,
      originalPrice: 1499,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'],
      category: '507f1f77bcf86cd799439012',
      brand: '507f1f77bcf86cd799439023',
      inStock: true,
      stockQuantity: 25,
      featured: false,
      specifications: {
        display: '13.4-inch FHD+',
        processor: 'Intel Core i7-1360P',
        memory: '16GB',
        storage: '512GB SSD'
      },
      rating: 4.4,
      reviewCount: 98,
      tags: ['laptop', 'ultrabook', 'windows'],
      sku: 'DXPS13I7512',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '507f1f77bcf86cd799439035',
      name: 'iPhone 14',
      slug: 'iphone-14',
      description: 'Previous generation iPhone with excellent value and performance',
      price: 699,
      originalPrice: 799,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
      images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'],
      category: '507f1f77bcf86cd799439011',
      brand: '507f1f77bcf86cd799439021',
      inStock: true,
      stockQuantity: 40,
      featured: true,
      specifications: {
        display: '6.1-inch Super Retina XDR',
        processor: 'A15 Bionic chip',
        storage: '128GB',
        camera: '12MP Dual camera'
      },
      rating: 4.7,
      reviewCount: 312,
      tags: ['smartphone', 'ios', 'value'],
      sku: 'IPH14128',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '507f1f77bcf86cd799439036',
      name: 'HP Spectre x360',
      slug: 'hp-spectre-x360',
      description: '2-in-1 convertible laptop with stunning OLED display',
      price: 1199,
      originalPrice: 1399,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'],
      category: '507f1f77bcf86cd799439012',
      brand: '507f1f77bcf86cd799439024',
      inStock: true,
      stockQuantity: 20,
      featured: false,
      specifications: {
        display: '13.5-inch OLED Touch',
        processor: 'Intel Core i7-1355U',
        memory: '16GB',
        storage: '1TB SSD'
      },
      rating: 4.3,
      reviewCount: 67,
      tags: ['laptop', '2-in-1', 'touchscreen'],
      sku: 'HPSX360I71TB',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

export class MongoStorage implements IStorage {
  constructor() {
    this.seedData();
  }

  private isDatabaseConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  private async seedData() {
    try {
      // Check if MongoDB is connected
      if (!mongoose.connection.readyState) {
        console.log('MongoDB not connected, skipping database seeding');
        return;
      }

      // Check if data already exists
      const categoryCount = await Category.countDocuments();
      if (categoryCount > 0) return;

      console.log('Seeding database...');

      // Seed categories
      const phoneCategory = await Category.create({
        name: "Smartphones",
        slug: "smartphones",
        description: "Latest smartphones and mobile phones"
      });

      const laptopCategory = await Category.create({
        name: "Laptops",
        slug: "laptops",
        description: "Laptops and portable computers"
      });

      // Seed brands
      const brandData = [
        { name: "Apple", slug: "apple" },
        { name: "Samsung", slug: "samsung" },
        { name: "Google", slug: "google" },
        { name: "OnePlus", slug: "oneplus" },
        { name: "Dell", slug: "dell" },
        { name: "HP", slug: "hp" },
        { name: "ASUS", slug: "asus" },
      ];

      const createdBrands = await Brand.insertMany(brandData);
      const brandMap = new Map(createdBrands.map(brand => [brand.slug, brand._id]));

      // Seed products
      const productData = [
        {
          name: "iPhone 15 Pro",
          slug: "iphone-15-pro",
          description: "6.1\" Super Retina XDR display, A17 Pro chip, Pro camera system with 5x telephoto zoom",
          price: 189999.00,
          originalPrice: 199999.00,
          image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
          category: phoneCategory._id,
          brand: brandMap.get('apple'),
          inStock: true,
          stockQuantity: 50,
          featured: true,
          specifications: {
            display: "6.1\" Super Retina XDR OLED",
            processor: "A17 Pro chip",
            storage: "128GB, 256GB, 512GB, 1TB",
            camera: "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
            battery: "Up to 23 hours video playback",
            os: "iOS 17"
          },
          rating: 4.9,
          reviewCount: 128,
          sku: "IPH15PRO001"
        },
        {
          name: "MacBook Pro 16\"",
          slug: "macbook-pro-16",
          description: "M3 Pro chip, 18GB unified memory, 512GB SSD storage, Liquid Retina XDR display",
          price: 449999.00,
          originalPrice: 479999.00,
          image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
          category: laptopCategory._id,
          brand: brandMap.get('apple'),
          inStock: true,
          stockQuantity: 25,
          featured: true,
          specifications: {
            display: "16.2\" Liquid Retina XDR",
            processor: "Apple M3 Pro chip",
            memory: "18GB unified memory",
            storage: "512GB SSD",
            graphics: "Integrated GPU",
            battery: "Up to 22 hours",
            os: "macOS Sonoma"
          },
          rating: 4.8,
          reviewCount: 89,
          sku: "MBP16M3001"
        },
        {
          name: "Galaxy S24 Ultra",
          slug: "galaxy-s24-ultra",
          description: "6.8\" Dynamic AMOLED 2X display, Snapdragon 8 Gen 3, 200MP camera system, S Pen included",
          price: 159999.00,
          originalPrice: 169999.00,
          image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
          category: phoneCategory._id,
          brand: brandMap.get('samsung'),
          inStock: true,
          stockQuantity: 40,
          featured: true,
          specifications: {
            display: "6.8\" Dynamic AMOLED 2X",
            processor: "Snapdragon 8 Gen 3",
            storage: "256GB, 512GB, 1TB",
            camera: "200MP Main, 50MP Periscope Telephoto, 10MP Telephoto, 12MP Ultra Wide",
            battery: "5000mAh with 45W fast charging",
            os: "Android 14 with One UI 6.1"
          },
          rating: 4.7,
          reviewCount: 156,
          sku: "GALS24ULT001"
        },
        {
          name: "Google Pixel 8 Pro",
          slug: "google-pixel-8-pro",
          description: "6.7\" LTPO OLED display, Google Tensor G3 chip, AI-powered photography features",
          price: 129999.00,
          image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          images: ["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
          category: phoneCategory._id,
          brand: brandMap.get('google'),
          inStock: true,
          stockQuantity: 30,
          featured: false,
          specifications: {
            display: "6.7\" LTPO OLED",
            processor: "Google Tensor G3",
            storage: "128GB, 256GB, 512GB",
            camera: "50MP Main, 48MP Ultra Wide, 48MP Telephoto",
            battery: "5050mAh with 30W fast charging",
            os: "Android 14"
          },
          rating: 4.6,
          reviewCount: 45,
          sku: "PIXL8PRO001"
        },
        {
          name: "Dell XPS 13",
          slug: "dell-xps-13",
          description: "13.4\" FHD+ display, Intel Core i7 processor, 16GB RAM, 512GB SSD, premium ultrabook",
          price: 179999.00,
          image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          images: ["https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
          category: laptopCategory._id,
          brand: brandMap.get('dell'),
          inStock: true,
          stockQuantity: 20,
          featured: false,
          specifications: {
            display: "13.4\" FHD+ InfinityEdge",
            processor: "Intel Core i7-1360P",
            memory: "16GB LPDDR5",
            storage: "512GB PCIe NVMe SSD",
            graphics: "Intel Iris Xe Graphics",
            battery: "Up to 12 hours",
            os: "Windows 11 Home"
          },
          rating: 4.5,
          reviewCount: 67,
          sku: "DELLXPS13001"
        }
      ];

      await Product.insertMany(productData);
      console.log('Database seeded successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }

  // Users
  async getUser(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email }).select('+password');
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async createUser(insertUser: InsertUser): Promise<IUser> {
    try {
      const user = new User(insertUser);
      return await user.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Categories
  async getCategories(): Promise<ICategory[]> {
    try {
      if (!this.isDatabaseConnected()) {
        console.log('Database not connected, using mock categories');
        return mockData.categories as any;
      }
      return await Category.find({ isActive: true }).sort({ name: 1 });
    } catch (error) {
      console.error('Error getting categories:', error);
      console.log('Falling back to mock categories');
      return mockData.categories as any;
    }
  }

  async getCategory(id: string): Promise<ICategory | null> {
    try {
      return await Category.findById(id);
    } catch (error) {
      console.error('Error getting category:', error);
      return null;
    }
  }

  async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    try {
      return await Category.findOne({ slug, isActive: true });
    } catch (error) {
      console.error('Error getting category by slug:', error);
      return null;
    }
  }

  // Brands
  async getBrands(): Promise<IBrand[]> {
    try {
      if (!this.isDatabaseConnected()) {
        console.log('Database not connected, using mock brands');
        return mockData.brands as any;
      }
      return await Brand.find({ isActive: true }).sort({ name: 1 });
    } catch (error) {
      console.error('Error getting brands:', error);
      console.log('Falling back to mock brands');
      return mockData.brands as any;
    }
  }

  async getBrand(id: string): Promise<IBrand | null> {
    try {
      return await Brand.findById(id);
    } catch (error) {
      console.error('Error getting brand:', error);
      return null;
    }
  }

  // Products
  async getProducts(filters: {
    categoryId?: string;
    brandId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<ProductWithDetails[]> {
    try {
      if (!this.isDatabaseConnected()) {
        console.log('Database not connected, using mock products');
        return this.filterMockProducts(filters);
      }

      const query: any = { isActive: true };

      // Apply filters
      if (filters.categoryId) {
        query.category = filters.categoryId;
      }
      if (filters.brandId) {
        query.brand = filters.brandId;
      }
      if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = filters.minPrice;
        if (filters.maxPrice) query.price.$lte = filters.maxPrice;
      }
      if (filters.search) {
        query.$text = { $search: filters.search };
      }
      if (filters.featured !== undefined) {
        query.featured = filters.featured;
      }

      let productQuery = Product.find(query)
        .populate('category')
        .populate('brand')
        .sort({ createdAt: -1 });

      // Apply pagination
      if (filters.offset) {
        productQuery = productQuery.skip(filters.offset);
      }
      if (filters.limit) {
        productQuery = productQuery.limit(filters.limit);
      }

      return await productQuery.exec() as any;
    } catch (error) {
      console.error('Error getting products:', error);
      console.log('Falling back to mock products');
      return this.filterMockProducts(filters);
    }
  }

  private filterMockProducts(filters: any): ProductWithDetails[] {
    let products = mockData.products.map(product => ({
      ...product,
      category: mockData.categories.find(c => c._id === product.category),
      brand: mockData.brands.find(b => b._id === product.brand)
    })).filter(p => p.category && p.brand) as any;

    // Apply filters
    if (filters.categoryId) {
      products = products.filter((p: any) => p.category._id === filters.categoryId);
    }
    if (filters.brandId) {
      products = products.filter((p: any) => p.brand._id === filters.brandId);
    }
    if (filters.minPrice) {
      products = products.filter((p: any) => p.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      products = products.filter((p: any) => p.price <= filters.maxPrice);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }
    if (filters.featured !== undefined) {
      products = products.filter((p: any) => p.featured === filters.featured);
    }

    // Apply pagination
    if (filters.offset) {
      products = products.slice(filters.offset);
    }
    if (filters.limit) {
      products = products.slice(0, filters.limit);
    }

    return products;
  }

  async getProduct(id: string): Promise<ProductWithDetails | null> {
    try {
      if (!this.isDatabaseConnected()) {
        console.log('Database not connected, using mock product');
        const product = mockData.products.find(p => p._id === id);
        if (product) {
          return {
            ...product,
            category: mockData.categories.find(c => c._id === product.category),
            brand: mockData.brands.find(b => b._id === product.brand)
          } as any;
        }
        return null;
      }
      return await Product.findById(id)
        .populate('category')
        .populate('brand') as any;
    } catch (error) {
      console.error('Error getting product:', error);
      console.log('Falling back to mock product');
      const product = mockData.products.find(p => p._id === id);
      if (product) {
        return {
          ...product,
          category: mockData.categories.find(c => c._id === product.category),
          brand: mockData.brands.find(b => b._id === product.brand)
        } as any;
      }
      return null;
    }
  }

  async getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
    try {
      return await Product.findOne({ slug, isActive: true })
        .populate('category')
        .populate('brand') as any;
    } catch (error) {
      console.error('Error getting product by slug:', error);
      return null;
    }
  }

  async getFeaturedProducts(limit = 6): Promise<ProductWithDetails[]> {
    return this.getProducts({ featured: true, limit });
  }

  // Orders
  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    try {
      const orderItems = items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }));

      const order = new Order({
        ...insertOrder,
        items: orderItems
      });

      const savedOrder = await order.save();

      // Populate the order with product details
      const populatedOrder = await Order.findById(savedOrder._id)
        .populate({
          path: 'items.product',
          model: 'Product'
        }) as any;

      return populatedOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrder(id: string): Promise<OrderWithItems | null> {
    try {
      return await Order.findById(id)
        .populate({
          path: 'items.product',
          model: 'Product'
        }) as any;
    } catch (error) {
      console.error('Error getting order:', error);
      return null;
    }
  }

  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    try {
      return await Order.find({ user: userId })
        .populate({
          path: 'items.product',
          model: 'Product'
        })
        .sort({ createdAt: -1 }) as any;
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }
}

export const storage = new MongoStorage();
