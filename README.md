 Front Market - Premium E-commerce Platform

Front Market is a modern, responsive e-commerce website specializing in smartphones and laptops. Built with React, TypeScript, and Express.js, it offers a seamless shopping experience with multiple payment options including Cash on Delivery, M-Pesa, and Credit/Debit Cards.

 Features

 Shopping Experience
- Product Catalog: Browse smartphones and laptops with advanced filtering
- Search & Filter: Find products by category, brand, price range, and specifications
- Product Details: Comprehensive product information with specifications and reviews
- Shopping Cart: Add, remove, and update quantities with persistent storage
- Multi-step Checkout: Streamlined checkout process with order review

  Payment Options
- Cash on Delivery (COD): Pay when your order arrives
- M-Pesa: Instant mobile money payments
- Credit/Debit Cards: Secure card payments (Mastercard, Visa)


 🛠 Technology Stack
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form management with validation



## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/front-market.git
   cd front-market
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

 Application Structure

 Pages
- Home Page (`/`) - Hero section, featured products, and category navigation
- Products Page (`/products`) - Product catalog with filtering and search
- Product Detail (`/products/:id`) - Individual product pages with specifications
- Checkout (`/checkout`) - Multi-step checkout process


Features
- **Shopping Cart** - Persistent cart with localStorage
- **Product Filtering** - Filter by category, brand, and price range
- **Search** - Text-based product search
- **Payment Methods** - COD, M-Pesa, and card payment options
- **Responsive Design** - Mobile-first approach with Tailwind CSS



Project Structure
```
front-market/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript type definitions
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage layer
│   └── vite.ts            # Vite integration
├── shared/                 # Shared schemas and types
└── components.json         # Shadcn UI configuration
```

 Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checking



Production Build
```bash
npm run build
npm run start
```



 Sample Data

The application includes sample data for development:
- 9 products across smartphones and laptops
- 2 categories (Smartphones, Laptops)
- 7 brands (Apple, Samsung, Google, OnePlus, Dell, HP, ASUS)
- Product specifications and ratings



Sydney Walter
- GitHub: [@sydney-walter](https://github.com/sydney-software)
- Email: sydneywalter29@gmail.com

