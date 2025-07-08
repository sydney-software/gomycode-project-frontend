// MongoDB initialization script
db = db.getSiblingDB('frontmarket');

// Create application user
db.createUser({
  user: 'frontmarket_user',
  pwd: 'frontmarket_password',
  roles: [
    {
      role: 'readWrite',
      db: 'frontmarket'
    }
  ]
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

db.products.createIndex({ name: "text", description: "text", tags: "text" });
db.products.createIndex({ category: 1 });
db.products.createIndex({ brand: 1 });
db.products.createIndex({ featured: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ rating: -1 });
db.products.createIndex({ slug: 1 }, { unique: true });

db.categories.createIndex({ slug: 1 }, { unique: true });
db.brands.createIndex({ slug: 1 }, { unique: true });

db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ user: 1 });
db.orders.createIndex({ email: 1 });
db.orders.createIndex({ orderStatus: 1 });
db.orders.createIndex({ paymentStatus: 1 });
db.orders.createIndex({ createdAt: -1 });

db.reviews.createIndex({ user: 1, product: 1 }, { unique: true });
db.reviews.createIndex({ product: 1 });
db.reviews.createIndex({ rating: -1 });

db.wishlists.createIndex({ user: 1 }, { unique: true });

print('Database initialized successfully!');
