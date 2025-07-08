import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import paymentRoutes from "./routes/payments";
import adminRoutes from "./routes/admin";
import reviewRoutes from "./routes/reviews";
import wishlistRoutes from "./routes/wishlist";
import searchRoutes from "./routes/search";
import { optionalAuth, authenticate } from "./middleware/auth";

const createOrderRequestSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  paymentMethod: z.enum(['cod', 'mpesa', 'card']),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
  })).min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.use("/api/auth", authRoutes);

  // Payment routes
  app.use("/api/payments", paymentRoutes);

  // Admin routes
  app.use("/api/admin", adminRoutes);

  // Review routes
  app.use("/api/reviews", reviewRoutes);

  // Wishlist routes
  app.use("/api/wishlist", wishlistRoutes);

  // Search routes
  app.use("/api/search", searchRoutes);

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get all brands
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  // Get products with optional filters
  app.get("/api/products", async (req, res) => {
    try {
      const {
        category,
        brand,
        minPrice,
        maxPrice,
        search,
        featured,
        limit = '20',
        offset = '0'
      } = req.query;

      const filters: any = {};
      
      if (category) {
        const categoryRecord = await storage.getCategoryBySlug(category as string);
        if (categoryRecord) {
          filters.categoryId = (categoryRecord as any)._id.toString();
        }
      }

      if (brand) {
        const brands = await storage.getBrands();
        const brandRecord = brands.find(b => b.slug === brand);
        if (brandRecord) {
          filters.brandId = (brandRecord as any)._id.toString();
        }
      }
      
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (search) filters.search = search as string;
      if (featured !== undefined) filters.featured = featured === 'true';
      
      filters.limit = parseInt(limit as string);
      filters.offset = parseInt(offset as string);

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get featured products
  app.get("/api/products/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const products = await storage.getFeaturedProducts(limit);
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  // Get single product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get single product by slug
  app.get("/api/products/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await storage.getProductBySlug(slug);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Create order
  app.post("/api/orders", optionalAuth, async (req, res) => {
    try {
      const validatedData = createOrderRequestSchema.parse(req.body);
      
      // Calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of validatedData.items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        
        if (!product.inStock || product.stockQuantity < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          product: item.productId,
          quantity: item.quantity,
          price: product.price,
          total: itemTotal,
        });
      }

      const tax = subtotal * 0.16; // 16% VAT
      const total = subtotal + tax;

      const order = await storage.createOrder(
        {
          user: req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : undefined, // Use authenticated user if available
          email: validatedData.email,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.phone,
          address: validatedData.address,
          city: validatedData.city,
          postalCode: validatedData.postalCode,
          paymentMethod: validatedData.paymentMethod,
          paymentStatus: validatedData.paymentMethod === 'cod' ? 'pending' : 'pending',
          orderStatus: 'processing',
          total: total,
          subtotal: subtotal,
          tax: tax,
          shippingCost: 0,
        },
        orderItems
      );

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid order data", 
          errors: error.errors 
        });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Get user orders (authenticated users only)
  app.get("/api/orders/user/me", authenticate, async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.user!.userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
