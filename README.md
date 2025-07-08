# Front Market - E-commerce Platform

A modern, full-stack e-commerce platform built with the MERN stack, specializing in smartphones and laptops. Features include user authentication, multiple payment methods (Cash on Delivery, M-Pesa, Mastercard), product reviews, wishlist functionality, and comprehensive admin management.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse smartphones and laptops with advanced filtering and search
- **User Authentication**: Secure registration and login with JWT tokens
- **Shopping Cart**: Add/remove items with quantity management
- **Multiple Payment Methods**:
  - Cash on Delivery (COD)
  - M-Pesa integration
  - Mastercard/Credit Card payments via Stripe
- **Product Reviews**: Rate and review products with verified purchase badges
- **Wishlist**: Save favorite products for later
- **Order Tracking**: Track order status from processing to delivery
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Admin Features
- **Dashboard**: Overview of sales, orders, and inventory
- **Product Management**: Add, edit, and manage product catalog
- **Order Management**: Process orders and update shipping status
- **User Management**: Manage customer accounts and permissions
- **Inventory Tracking**: Monitor stock levels and low inventory alerts
- **Analytics**: Sales reports and customer insights

### Technical Features
- **RESTful API**: Well-structured API with proper error handling
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with refresh tokens
- **Payment Processing**: Integrated Stripe and M-Pesa APIs
- **Search**: Advanced product search with filters and sorting
- **File Upload**: Image upload for products
- **Email Notifications**: Order confirmations and updates
- **Security**: Input validation, rate limiting, and CORS protection

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Wouter** - Routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Stripe** - Payment processing
- **Cors** - Cross-origin resource sharing
- **Helmet** - Security headers


## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/front-market.git
cd front-market
```

### 2. Install Dependencies

```bash
# Install all dependencies (both client and server)
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/frontmarket
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/frontmarket

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Payment Configuration
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORTCODE=your-mpesa-shortcode
MPESA_PASSKEY=your-mpesa-passkey

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### 4. Start the Application

```bash
# Development mode (starts both client and server)
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
front-market/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and API
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Express backend
│   ├── config/             # Database and app configuration
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic services
│   └── utils/              # Utility functions
├── shared/                 # Shared types and schemas
├── .env                    # Environment variables
├── package.json            # Root package.json
└── README.md
```

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Database Setup

1. **Local MongoDB**: Install MongoDB locally and ensure it's running on port 27017
2. **MongoDB Atlas**: Create a cluster and update the `MONGODB_URI_PROD` in your `.env` file

### Payment Setup

#### Stripe (Credit/Debit Cards)
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Add them to your `.env` file

#### M-Pesa (Kenya)
1. Register for Safaricom Daraja API
2. Get your consumer key, consumer secret, and other credentials
3. Add them to your `.env` file

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the client:
```bash
cd client && npm run build
```

2. Deploy the `client/dist` folder to your hosting platform

### Backend Deployment (Railway/Heroku/DigitalOcean)

1. Set up environment variables on your hosting platform
2. Deploy the server code
3. Ensure MongoDB is accessible from your hosting platform

### Database Deployment

- **MongoDB Atlas**: Recommended for production
- **Self-hosted**: Set up MongoDB on your server

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Product Endpoints

- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured` - Get featured products

### Order Endpoints

- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/user/me` - Get user orders

### Payment Endpoints

- `POST /api/payments/card` - Process card payment
- `POST /api/payments/mpesa` - Process M-Pesa payment
- `POST /api/payments/cod` - Process cash on delivery

### Admin Endpoints

- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/products` - Manage products
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/users` - Manage users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/front-market/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the database
- Stripe for payment processing
- Safaricom for M-Pesa API
- All open-source contributors

---

**Built with ❤️ by [Your Name]**

