require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const Product = require('./models/Product');
const seedData = require('../database/seed');

const PORT = process.env.PORT || 5000;

// Connect to Database and start Server
connectDB().then(async () => {
  // Auto-seed if database has 0 products
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('🌱 Database is empty. Running automatic seed with sample catalog...');
      await seedData();
    }
  } catch (seedErr) {
    console.warn('Auto-seed check warning:', seedErr.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 ShopEase Backend Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
  });
}).catch((err) => {
  console.error(`Database connection error: ${err.message}`);
});

