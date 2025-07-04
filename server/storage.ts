import { 
  users, categories, brands, products, orders, orderItems,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Brand, type InsertBrand,
  type Product, type InsertProduct, type ProductWithDetails,
  type Order, type InsertOrder, type OrderWithItems,
  type OrderItem, type InsertOrderItem
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;

  // Brands
  getBrands(): Promise<Brand[]>;
  getBrand(id: number): Promise<Brand | undefined>;

  // Products
  getProducts(filters?: {
    categoryId?: number;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ProductWithDetails[]>;
  getProduct(id: number): Promise<ProductWithDetails | undefined>;
  getProductBySlug(slug: string): Promise<ProductWithDetails | undefined>;
  getFeaturedProducts(limit?: number): Promise<ProductWithDetails[]>;

  // Orders
  createOrder(order: InsertOrder, items: Omit<InsertOrderItem, 'orderId'>[]): Promise<OrderWithItems>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  getUserOrders(userId: number): Promise<OrderWithItems[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private brands: Map<number, Brand> = new Map();
  private products: Map<number, Product> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem> = new Map();
  
  private currentUserId = 1;
  private currentCategoryId = 1;
  private currentBrandId = 1;
  private currentProductId = 1;
  private currentOrderId = 1;
  private currentOrderItemId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed categories
    const phoneCategory: Category = { id: 1, name: "Smartphones", slug: "smartphones", description: "Latest smartphones and mobile phones" };
    const laptopCategory: Category = { id: 2, name: "Laptops", slug: "laptops", description: "Laptops and portable computers" };
    
    this.categories.set(1, phoneCategory);
    this.categories.set(2, laptopCategory);
    this.currentCategoryId = 3;

    // Seed brands
    const brands = [
      { id: 1, name: "Apple", slug: "apple", logo: null },
      { id: 2, name: "Samsung", slug: "samsung", logo: null },
      { id: 3, name: "Google", slug: "google", logo: null },
      { id: 4, name: "OnePlus", slug: "oneplus", logo: null },
      { id: 5, name: "Dell", slug: "dell", logo: null },
      { id: 6, name: "HP", slug: "hp", logo: null },
      { id: 7, name: "ASUS", slug: "asus", logo: null },
    ];

    brands.forEach(brand => this.brands.set(brand.id, brand));
    this.currentBrandId = 8;

    // Seed products
    const products = [
      {
        id: 1,
        name: "iPhone 15 Pro",
        slug: "iphone-15-pro",
        description: "6.1\" Super Retina XDR display, A17 Pro chip, Pro camera system with 5x telephoto zoom",
        price: "189999.00",
        originalPrice: "199999.00",
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
        categoryId: 1,
        brandId: 1,
        inStock: true,
        stockQuantity: 50,
        featured: true,
        specifications: JSON.stringify({
          display: "6.1\" Super Retina XDR OLED",
          processor: "A17 Pro chip",
          storage: "128GB, 256GB, 512GB, 1TB",
          camera: "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
          battery: "Up to 23 hours video playback",
          os: "iOS 17"
        }),
        rating: "4.9",
        reviewCount: 128
      },
      {
        id: 2,
        name: "MacBook Pro 16\"",
        slug: "macbook-pro-16",
        description: "M3 Pro chip, 18GB unified memory, 512GB SSD storage, Liquid Retina XDR display",
        price: "449999.00",
        originalPrice: "479999.00",
        image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
        categoryId: 2,
        brandId: 1,
        inStock: true,
        stockQuantity: 25,
        featured: true,
        specifications: JSON.stringify({
          display: "16.2\" Liquid Retina XDR",
          processor: "Apple M3 Pro chip",
          memory: "18GB unified memory",
          storage: "512GB SSD",
          graphics: "Integrated GPU",
          battery: "Up to 22 hours",
          os: "macOS Sonoma"
        }),
        rating: "4.8",
        reviewCount: 89
      },
      {
        id: 3,
        name: "Galaxy S24 Ultra",
        slug: "galaxy-s24-ultra",
        description: "6.8\" Dynamic AMOLED 2X display, Snapdragon 8 Gen 3, 200MP camera system, S Pen included",
        price: "159999.00",
        originalPrice: "169999.00",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
        categoryId: 1,
        brandId: 2,
        inStock: true,
        stockQuantity: 40,
        featured: true,
        specifications: JSON.stringify({
          display: "6.8\" Dynamic AMOLED 2X",
          processor: "Snapdragon 8 Gen 3",
          storage: "256GB, 512GB, 1TB",
          camera: "200MP Main, 50MP Periscope Telephoto, 10MP Telephoto, 12MP Ultra Wide",
          battery: "5000mAh with 45W fast charging",
          os: "Android 14 with One UI 6.1"
        }),
        rating: "4.7",
        reviewCount: 156
      },
      {
        id: 4,
        name: "Google Pixel 8 Pro",
        slug: "google-pixel-8-pro",
        description: "6.7\" LTPO OLED display, Google Tensor G3 chip, AI-powered photography features",
        price: "129999.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        images: ["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
        categoryId: 1,
        brandId: 3,
        inStock: true,
        stockQuantity: 30,
        featured: false,
        specifications: JSON.stringify({
          display: "6.7\" LTPO OLED",
          processor: "Google Tensor G3",
          storage: "128GB, 256GB, 512GB",
          camera: "50MP Main, 48MP Ultra Wide, 48MP Telephoto",
          battery: "5050mAh with 30W fast charging",
          os: "Android 14"
        }),
        rating: "4.6",
        reviewCount: 45
      },
      {
        id: 5,
        name: "Dell XPS 13",
        slug: "dell-xps-13",
        description: "13.4\" FHD+ display, Intel Core i7 processor, 16GB RAM, 512GB SSD, premium ultrabook",
        price: "179999.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        images: ["https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
        categoryId: 2,
        brandId: 5,
        inStock: true,
        stockQuantity: 20,
        featured: false,
        specifications: JSON.stringify({
          display: "13.4\" FHD+ InfinityEdge",
          processor: "Intel Core i7-1360P",
          memory: "16GB LPDDR5",
          storage: "512GB PCIe NVMe SSD",
          graphics: "Intel Iris Xe Graphics",
          battery: "Up to 12 hours",
          os: "Windows 11 Home"
        }),
        rating: "4.5",
        reviewCount: 67
      },
      {
        id: 6,
        name: "OnePlus 12",
        slug: "oneplus-12",
        description: "6.82\" LTPO AMOLED display, Snapdragon 8 Gen 3, 100W SUPERVOOC fast charging",
        price: "89999.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
        categoryId: 1,
        brandId: 4,
        inStock: true,
        stockQuantity: 35,
        featured: false,
        specifications: JSON.stringify({
          display: "6.82\" Curved LTPO AMOLED",
          processor: "Snapdragon 8 Gen 3",
          storage: "256GB, 512GB",
          camera: "50MP Main, 64MP Periscope Telephoto, 48MP Ultra Wide",
          battery: "5400mAh with 100W SUPERVOOC",
          os: "OxygenOS 14 based on Android 14"
        }),
        rating: "4.8",
        reviewCount: 92
      },
      {
        id: 7,
        name: "HP Spectre x360",
        slug: "hp-spectre-x360",
        description: "14\" OLED 2.8K display, Intel Core i7, 16GB RAM, 2-in-1 convertible design with pen support",
        price: "199999.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
        categoryId: 2,
        brandId: 6,
        inStock: true,
        stockQuantity: 15,
        featured: false,
        specifications: JSON.stringify({
          display: "14\" OLED 2.8K touchscreen",
          processor: "Intel Core i7-1355U",
          memory: "16GB LPDDR5",
          storage: "1TB PCIe NVMe SSD",
          graphics: "Intel Iris Xe Graphics",
          battery: "Up to 17 hours",
          os: "Windows 11 Home"
        }),
        rating: "4.3",
        reviewCount: 34
      },
      {
        id: 8,
        name: "iPhone 14",
        slug: "iphone-14",
        description: "6.1\" Super Retina XDR display, A15 Bionic chip, Advanced dual-camera system",
        price: "119999.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        images: ["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
        categoryId: 1,
        brandId: 1,
        inStock: true,
        stockQuantity: 60,
        featured: false,
        specifications: JSON.stringify({
          display: "6.1\" Super Retina XDR OLED",
          processor: "A15 Bionic chip",
          storage: "128GB, 256GB, 512GB",
          camera: "12MP Main, 12MP Ultra Wide",
          battery: "Up to 20 hours video playback",
          os: "iOS 17"
        }),
        rating: "4.7",
        reviewCount: 203
      },
      {
        id: 9,
        name: "ASUS ROG Strix G15",
        slug: "asus-rog-strix-g15",
        description: "15.6\" 144Hz display, AMD Ryzen 7, NVIDIA RTX 4060, 16GB RAM, gaming laptop",
        price: "159999.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"],
        categoryId: 2,
        brandId: 7,
        inStock: true,
        stockQuantity: 18,
        featured: false,
        specifications: JSON.stringify({
          display: "15.6\" FHD 144Hz",
          processor: "AMD Ryzen 7 7735HS",
          memory: "16GB DDR5",
          storage: "512GB PCIe NVMe SSD",
          graphics: "NVIDIA GeForce RTX 4060",
          battery: "Up to 12 hours",
          os: "Windows 11 Home"
        }),
        rating: "4.6",
        reviewCount: 78
      }
    ];

    products.forEach(product => this.products.set(product.id, product));
    this.currentProductId = 10;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      address: insertUser.address ?? null,
      phone: insertUser.phone ?? null,
      city: insertUser.city ?? null,
      postalCode: insertUser.postalCode ?? null,
    };
    this.users.set(id, user);
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  // Brands
  async getBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }

  async getBrand(id: number): Promise<Brand | undefined> {
    return this.brands.get(id);
  }

  // Products
  async getProducts(filters: {
    categoryId?: number;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<ProductWithDetails[]> {
    let products = Array.from(this.products.values());

    // Apply filters
    if (filters.categoryId) {
      products = products.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters.brandId) {
      products = products.filter(p => p.brandId === filters.brandId);
    }
    if (filters.minPrice) {
      products = products.filter(p => parseFloat(p.price) >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      products = products.filter(p => parseFloat(p.price) <= filters.maxPrice!);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    if (filters.featured !== undefined) {
      products = products.filter(p => p.featured === filters.featured);
    }

    // Apply pagination
    if (filters.offset) {
      products = products.slice(filters.offset);
    }
    if (filters.limit) {
      products = products.slice(0, filters.limit);
    }

    // Add category and brand details
    return products.map(product => ({
      ...product,
      category: this.categories.get(product.categoryId)!,
      brand: this.brands.get(product.brandId)!,
    }));
  }

  async getProduct(id: number): Promise<ProductWithDetails | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    return {
      ...product,
      category: this.categories.get(product.categoryId)!,
      brand: this.brands.get(product.brandId)!,
    };
  }

  async getProductBySlug(slug: string): Promise<ProductWithDetails | undefined> {
    const product = Array.from(this.products.values()).find(p => p.slug === slug);
    if (!product) return undefined;

    return {
      ...product,
      category: this.categories.get(product.categoryId)!,
      brand: this.brands.get(product.brandId)!,
    };
  }

  async getFeaturedProducts(limit = 6): Promise<ProductWithDetails[]> {
    return this.getProducts({ featured: true, limit });
  }

  // Orders
  async createOrder(insertOrder: InsertOrder, items: Omit<InsertOrderItem, 'orderId'>[]): Promise<OrderWithItems> {
    const orderId = this.currentOrderId++;
    const order: Order = { 
      ...insertOrder, 
      id: orderId,
      userId: insertOrder.userId ?? null,
      paymentStatus: insertOrder.paymentStatus ?? 'pending',
      orderStatus: insertOrder.orderStatus ?? 'processing',
    };
    this.orders.set(orderId, order);

    const orderItemsWithIds = items.map(item => {
      const id = this.currentOrderItemId++;
      const orderItem: OrderItem = { ...item, id, orderId };
      this.orderItems.set(id, orderItem);
      return orderItem;
    });

    const orderWithItems: OrderWithItems = {
      ...order,
      items: orderItemsWithIds.map(item => ({
        ...item,
        product: this.products.get(item.productId)!,
      })),
    };

    return orderWithItems;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => ({
        ...item,
        product: this.products.get(item.productId)!,
      }));

    return { ...order, items };
  }

  async getUserOrders(userId: number): Promise<OrderWithItems[]> {
    const userOrders = Array.from(this.orders.values()).filter(order => order.userId === userId);
    
    return Promise.all(userOrders.map(async order => {
      const items = Array.from(this.orderItems.values())
        .filter(item => item.orderId === order.id)
        .map(item => ({
          ...item,
          product: this.products.get(item.productId)!,
        }));
      
      return { ...order, items };
    }));
  }
}

export const storage = new MemStorage();
