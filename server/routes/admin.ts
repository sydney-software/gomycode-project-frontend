import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { User, Category, Brand, Product, Order } from '../models';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticate);
router.use(authorize('admin'));

// Validation schemas
const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  image: z.string().optional(),
});

const brandSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  logo: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
});

const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
  image: z.string().min(1),
  images: z.array(z.string()).optional(),
  category: z.string(),
  brand: z.string(),
  stockQuantity: z.number().min(0),
  featured: z.boolean().optional(),
  specifications: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  sku: z.string().min(1),
  weight: z.number().min(0).optional(),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
  }).optional(),
});

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.find()
        .populate('items.product', 'name image')
        .sort({ createdAt: -1 })
        .limit(10),
      Product.find({ stockQuantity: { $lt: 10 }, isActive: true })
        .populate('category brand', 'name')
        .limit(10),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Category management
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const validatedData = categorySchema.parse(req.body);
    const category = new Category(validatedData);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const validatedData = categorySchema.parse(req.body);
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deactivated successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
});

// Brand management
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Failed to fetch brands' });
  }
});

router.post('/brands', async (req, res) => {
  try {
    const validatedData = brandSchema.parse(req.body);
    const brand = new Brand(validatedData);
    await brand.save();
    res.status(201).json(brand);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating brand:', error);
    res.status(500).json({ message: 'Failed to create brand' });
  }
});

router.put('/brands/:id', async (req, res) => {
  try {
    const validatedData = brandSchema.parse(req.body);
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    );
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(brand);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating brand:', error);
    res.status(500).json({ message: 'Failed to update brand' });
  }
});

router.delete('/brands/:id', async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json({ message: 'Brand deactivated successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ message: 'Failed to delete brand' });
  }
});

// Product management
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, brand } = req.query;
    const query: any = {};
    
    if (search) {
      query.$text = { $search: search as string };
    }
    if (category) {
      query.category = category;
    }
    if (brand) {
      query.brand = brand;
    }

    const products = await Product.find(query)
      .populate('category brand', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const validatedData = productSchema.parse(req.body);
    const product = new Product(validatedData);
    await product.save();
    await product.populate('category brand', 'name');
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const validatedData = productSchema.parse(req.body);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    ).populate('category brand', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deactivated successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// Order management
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
    const query: any = {};

    if (status) {
      query.orderStatus = status;
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name image price')
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image price sku')
      .populate('user', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;

    const updateData: any = { orderStatus };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    if (orderStatus === 'shipped') {
      updateData.shippedAt = new Date();
    }
    if (orderStatus === 'delivered') {
      updateData.deliveredAt = new Date();
      updateData.paymentStatus = 'paid'; // Mark as paid for COD orders
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('items.product', 'name image price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

export default router;
