require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

// Models
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Brand = require('../src/models/Brand');
const Product = require('../src/models/Product');
const Coupon = require('../src/models/Coupon');
const Banner = require('../src/models/Banner');
const Review = require('../src/models/Review');
const FAQ = require('../src/models/FAQ');
const Settings = require('../src/models/Settings');
const InventoryHistory = require('../src/models/InventoryHistory');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Brand.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Banner.deleteMany({}),
      Review.deleteMany({}),
      FAQ.deleteMany({}),
      Settings.deleteMany({}),
      InventoryHistory.deleteMany({}),
    ]);

    console.log('👤 Seeding Users (Admin & Customer)...');
    const adminUser = await User.create({
      name: 'Admin Chief',
      email: 'admin@ecommerce.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      verified: true,
      addresses: [
        {
          fullName: 'Admin Operations',
          phone: '9876543210',
          address: '42 Cyber City, DLF Phase 2',
          city: 'Gurugram',
          state: 'Haryana',
          country: 'India',
          pincode: '122002',
          isDefault: true,
        },
      ],
    });

    const customerUser = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@ecommerce.com',
      phone: '9876543211',
      password: 'customer123',
      role: 'customer',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      verified: true,
      addresses: [
        {
          fullName: 'Rahul Sharma',
          phone: '9876543211',
          address: 'B-104, Green Glen Layout, Bellandur',
          apartment: 'Prestige Ozone',
          city: 'Bengaluru',
          state: 'Karnataka',
          country: 'India',
          pincode: '560103',
          isDefault: true,
        },
      ],
    });

    console.log('🏷️ Seeding Brands...');
    const brands = await Brand.create([
      { name: 'Apple', slug: 'apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80', description: 'Think Different - Cutting-edge personal technology' },
      { name: 'Samsung', slug: 'samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80', description: 'Do What You Can\'t - World leading electronics' },
      { name: 'Sony', slug: 'sony', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80', description: 'Be Moved - High fidelity audio and entertainment' },
      { name: 'Nike', slug: 'nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80', description: 'Just Do It - Performance athletic apparel and sneakers' },
      { name: 'Zara', slug: 'zara', logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=200&q=80', description: 'Contemporary high-street fashion and trends' },
      { name: 'Philips', slug: 'philips', logo: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=200&q=80', description: 'Innovation and you - Smart home and personal appliances' },
    ]);

    const brandMap = {};
    brands.forEach(b => { brandMap[b.slug] = b._id; });

    console.log('📂 Seeding Categories & Subcategories...');
    // Main Categories
    const catElectronics = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
      description: 'Laptops, smartphones, audio and smart gadgets',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    });

    const catFashion = await Category.create({
      name: 'Fashion',
      slug: 'fashion',
      description: 'Trendy clothing, luxury watches and footwear',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80',
    });

    const catHome = await Category.create({
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Modern furniture, decor lighting and kitchen essentials',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
    });

    // Subcategories
    const subSmartphones = await Category.create({
      name: 'Smartphones',
      slug: 'smartphones',
      parent: catElectronics._id,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    });

    const subLaptops = await Category.create({
      name: 'Laptops',
      slug: 'laptops',
      parent: catElectronics._id,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    });

    const subAudio = await Category.create({
      name: 'Audio & Headphones',
      slug: 'audio-headphones',
      parent: catElectronics._id,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    });

    const subMen = await Category.create({
      name: 'Men',
      slug: 'men',
      parent: catFashion._id,
      image: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=600&q=80',
    });

    const subWomen = await Category.create({
      name: 'Women',
      slug: 'women',
      parent: catFashion._id,
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    });

    const subFurniture = await Category.create({
      name: 'Furniture',
      slug: 'furniture',
      parent: catHome._id,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    });

    const subKitchen = await Category.create({
      name: 'Kitchen',
      slug: 'kitchen',
      parent: catHome._id,
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    });

    console.log('📦 Seeding 24 Commercial Products...');
    const productsData = [
      // 1. iPhone 15 Pro
      {
        name: 'Apple iPhone 15 Pro (256GB, Titanium)',
        slug: 'apple-iphone-15-pro-titanium',
        description: 'iPhone 15 Pro is forged in titanium and features the groundbreaking A17 Pro chip, customizable Action button, and the most versatile camera system ever in an iPhone.',
        features: ['Aerospace-grade titanium design', 'A17 Pro chip with 6-core GPU', '48MP Main camera with next-gen portraits', 'Super Retina XDR display with ProMotion 120Hz', 'USB-C with USB 3 speeds'],
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80'
        ],
        category: catElectronics._id,
        subcategory: subSmartphones._id,
        brand: brandMap['apple'],
        sku: 'APL-IP15P-256',
        price: 134900,
        comparePrice: 144900,
        discount: 7,
        costPrice: 110000,
        variants: [
          { size: '128GB', color: 'Natural Titanium', colorCode: '#8d867c', sku: 'APL-IP15P-128-NAT', price: 124900, stock: 15 },
          { size: '256GB', color: 'Natural Titanium', colorCode: '#8d867c', sku: 'APL-IP15P-256-NAT', price: 134900, stock: 20 },
          { size: '256GB', color: 'Blue Titanium', colorCode: '#2f3844', sku: 'APL-IP15P-256-BLU', price: 134900, stock: 12 },
        ],
        specifications: [
          { name: 'Display', value: '6.1-inch Super Retina XDR OLED' },
          { name: 'Processor', value: 'Apple A17 Pro (3nm)' },
          { name: 'RAM', value: '8 GB' },
          { name: 'Storage', value: '256 GB' },
          { name: 'Battery', value: '3274 mAh with Fast Charging' },
        ],
        stock: 32,
        rating: 4.8,
        reviewCount: 42,
        featured: true,
        isTrending: true,
        isBestSeller: true,
      },

      // 2. MacBook Pro 16 M3 Max
      {
        name: 'Apple MacBook Pro 16" (M3 Max, 36GB Unified Memory, 1TB SSD)',
        slug: 'apple-macbook-pro-16-m3-max',
        description: 'The 16-inch MacBook Pro blasts forward with M3 Max, an extraordinarily advanced chip that brings serious speed and capability for extreme workflows.',
        features: ['Liquid Retina XDR display with 1600 nits peak brightness', 'Up to 22 hours battery life', '16-core CPU, 40-core GPU', 'Spatial audio sound system', 'Thunderbolt 4, HDMI, SDXC card slot'],
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80'
        ],
        category: catElectronics._id,
        subcategory: subLaptops._id,
        brand: brandMap['apple'],
        sku: 'APL-MBP16-M3M',
        price: 349900,
        comparePrice: 379900,
        discount: 8,
        costPrice: 290000,
        variants: [
          { size: '36GB / 1TB', color: 'Space Black', colorCode: '#1d1d1f', sku: 'APL-MBP16-BLK', price: 349900, stock: 10 },
          { size: '48GB / 1TB', color: 'Silver', colorCode: '#e0e0e0', sku: 'APL-MBP16-SLV', price: 389900, stock: 6 },
        ],
        specifications: [
          { name: 'Screen', value: '16.2-inch Liquid Retina XDR (3456x2234)' },
          { name: 'Processor', value: 'Apple M3 Max 16-Core' },
          { name: 'Memory', value: '36 GB Unified' },
          { name: 'Storage', value: '1 TB PCIe Gen 4 SSD' },
        ],
        stock: 16,
        rating: 4.9,
        reviewCount: 28,
        featured: true,
        isBestSeller: false,
      },

      // 3. Sony WH-1000XM5 Noise Canceling Headphones
      {
        name: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones',
        slug: 'sony-wh-1000xm5-wireless-headphones',
        description: 'Industry-leading noise cancellation optimized to you. Magnificent Sound, engineered to perfection with the new Integrated Processor V1 and HD Noise Cancelling Processor QN1.',
        features: ['Auto NC Optimizer adjusts according to wearing conditions', 'Up to 30-hour battery life with quick charging', 'Ultra-comfortable, lightweight design with soft fit leather', 'Multipoint connection allows swift device switching'],
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
        ],
        category: catElectronics._id,
        subcategory: subAudio._id,
        brand: brandMap['sony'],
        sku: 'SNY-WH1000XM5-BLK',
        price: 29990,
        comparePrice: 34990,
        discount: 14,
        costPrice: 21000,
        variants: [
          { size: 'Standard', color: 'Black', colorCode: '#111111', sku: 'SNY-XM5-BLK', price: 29990, stock: 35 },
          { size: 'Standard', color: 'Silver', colorCode: '#d3d3d3', sku: 'SNY-XM5-SLV', price: 29990, stock: 18 },
          { size: 'Standard', color: 'Midnight Blue', colorCode: '#182945', sku: 'SNY-XM5-BLU', price: 31990, stock: 10 },
        ],
        specifications: [
          { name: 'Driver Unit', value: '30mm, Carbon Fiber Composite' },
          { name: 'Frequency Response', value: '4 Hz - 40,000 Hz' },
          { name: 'Battery Life', value: '30 Hours (NC ON)' },
          { name: 'Bluetooth', value: 'v5.2, LDAC, AAC, SBC' },
        ],
        stock: 63,
        rating: 4.7,
        reviewCount: 65,
        featured: true,
        isTrending: true,
        isBestSeller: true,
        isFlashSale: true,
        flashSaleEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },

      // 4. Samsung Galaxy S24 Ultra
      {
        name: 'Samsung Galaxy S24 Ultra 5G (12GB RAM, 512GB Storage, Titanium Gray)',
        slug: 'samsung-galaxy-s24-ultra-titanium',
        description: 'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8 inch flat display screen. An absolute marvel of design.',
        features: ['Galaxy AI features: Circle to Search, Live Translate', '200MP Main Camera with AI zoom', 'Snapdragon 8 Gen 3 for Galaxy', 'Built-in S Pen stylus'],
        images: [
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'
        ],
        category: catElectronics._id,
        subcategory: subSmartphones._id,
        brand: brandMap['samsung'],
        sku: 'SAM-S24U-512',
        price: 139999,
        comparePrice: 149999,
        discount: 7,
        costPrice: 115000,
        variants: [
          { size: '256GB', color: 'Titanium Gray', colorCode: '#737373', sku: 'SAM-S24U-256', price: 129999, stock: 20 },
          { size: '512GB', color: 'Titanium Black', colorCode: '#1a1a1a', sku: 'SAM-S24U-512', price: 139999, stock: 15 },
        ],
        specifications: [
          { name: 'Display', value: '6.8-inch Dynamic AMOLED 2X, 120Hz' },
          { name: 'Processor', value: 'Snapdragon 8 Gen 3 (4nm)' },
          { name: 'Battery', value: '5000 mAh' },
        ],
        stock: 35,
        rating: 4.6,
        reviewCount: 34,
        isNewArrival: true,
      },

      // 5. Nike Air Jordan 1 Retro High
      {
        name: 'Nike Air Jordan 1 Retro High OG "Chicago"',
        slug: 'nike-air-jordan-1-retro-high-chicago',
        description: 'Familiar shape, fresh colorway. The Air Jordan 1 Retro High remakes the classic sneaker, giving you fresh look with premium leather cushioning.',
        features: ['Full-grain leather upper provides durability', 'Encapsulated Air-Sole unit delivers lightweight cushioning', 'Solid rubber outsole with deep flex grooves'],
        images: [
          'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
        ],
        category: catFashion._id,
        subcategory: subMen._id,
        brand: brandMap['nike'],
        sku: 'NKE-AJ1-CHI',
        price: 16995,
        comparePrice: 19995,
        discount: 15,
        costPrice: 9000,
        variants: [
          { size: 'UK 7', color: 'Varsity Red/Black', colorCode: '#b91c1c', sku: 'NKE-AJ1-7', price: 16995, stock: 8 },
          { size: 'UK 8', color: 'Varsity Red/Black', colorCode: '#b91c1c', sku: 'NKE-AJ1-8', price: 16995, stock: 12 },
          { size: 'UK 9', color: 'Varsity Red/Black', colorCode: '#b91c1c', sku: 'NKE-AJ1-9', price: 16995, stock: 14 },
          { size: 'UK 10', color: 'Varsity Red/Black', colorCode: '#b91c1c', sku: 'NKE-AJ1-10', price: 16995, stock: 5 },
        ],
        specifications: [
          { name: 'Material', value: 'Genuine Leather' },
          { name: 'Sole', value: 'Air Cushion Rubber' },
          { name: 'Closure', value: 'Lace-Up' },
        ],
        stock: 39,
        rating: 4.9,
        reviewCount: 89,
        featured: true,
        isTrending: true,
        isBestSeller: true,
      },

      // 6. Nike Dri-FIT Club Fleece Hoodie
      {
        name: 'Nike Sportswear Club Fleece Pullover Hoodie',
        slug: 'nike-club-fleece-pullover-hoodie',
        description: 'A closet staple, the Nike Sportswear Club Fleece Pullover Hoodie combines classic style with the soft comfort of brushed-back fleece for an elevated, everyday look.',
        features: ['Brushed-back fleece fabric feels soft and smooth against skin', 'Hood with drawstring offers adjustable coverage', 'Ribbed hem and cuffs keep hoodie in place'],
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'
        ],
        category: catFashion._id,
        subcategory: subMen._id,
        brand: brandMap['nike'],
        sku: 'NKE-HOOD-CF',
        price: 3495,
        comparePrice: 4295,
        discount: 18,
        costPrice: 1800,
        variants: [
          { size: 'S', color: 'Heather Grey', colorCode: '#9ca3af', sku: 'NKE-HOOD-GRY-S', price: 3495, stock: 15 },
          { size: 'M', color: 'Heather Grey', colorCode: '#9ca3af', sku: 'NKE-HOOD-GRY-M', price: 3495, stock: 25 },
          { size: 'L', color: 'Black', colorCode: '#000000', sku: 'NKE-HOOD-BLK-L', price: 3495, stock: 20 },
          { size: 'XL', color: 'Black', colorCode: '#000000', sku: 'NKE-HOOD-BLK-XL', price: 3495, stock: 10 },
        ],
        specifications: [
          { name: 'Fit', value: 'Standard relaxed fit' },
          { name: 'Fabric', value: '80% cotton / 20% polyester' },
          { name: 'Care', value: 'Machine wash warm' },
        ],
        stock: 70,
        rating: 4.5,
        reviewCount: 31,
      },

      // 7. Zara Structured Double Breasted Blazer
      {
        name: 'Zara Tailored Structured Double-Breasted Blazer',
        slug: 'zara-tailored-double-breasted-blazer',
        description: 'Sharp lapels and tailored lines define this classic double-breasted blazer. Designed for timeless elegance in business, formal, and evening settings.',
        features: ['Peak lapel collar with flap front pockets', 'Pronounced shoulders with internal lining', 'Embossed metallic gold-tone buttons'],
        images: [
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
        ],
        category: catFashion._id,
        subcategory: subWomen._id,
        brand: brandMap['zara'],
        sku: 'ZRA-BLZ-DB01',
        price: 7990,
        comparePrice: 9990,
        discount: 20,
        costPrice: 4200,
        variants: [
          { size: 'XS', color: 'Oatmeal Beige', colorCode: '#d6c7b2', sku: 'ZRA-BLZ-BGE-XS', price: 7990, stock: 8 },
          { size: 'S', color: 'Oatmeal Beige', colorCode: '#d6c7b2', sku: 'ZRA-BLZ-BGE-S', price: 7990, stock: 12 },
          { size: 'M', color: 'Midnight Navy', colorCode: '#0f172a', sku: 'ZRA-BLZ-NVY-M', price: 7990, stock: 14 },
          { size: 'L', color: 'Midnight Navy', colorCode: '#0f172a', sku: 'ZRA-BLZ-NVY-L', price: 7990, stock: 9 },
        ],
        specifications: [
          { name: 'Composition', value: '64% Polyester, 32% Viscose, 4% Elastane' },
          { name: 'Lining', value: '100% Acetate' },
        ],
        stock: 43,
        rating: 4.7,
        reviewCount: 19,
        featured: true,
      },

      // 8. Zara Silk Touch Satin Midi Dress
      {
        name: 'Zara Elegant Drape Satin Midi Slip Dress',
        slug: 'zara-drape-satin-midi-slip-dress',
        description: 'Fluid midi dress featuring a cowl neckline and thin adjustable crossed straps at the back. Slanted hem with side slit for graceful movement.',
        features: ['Luxurious fluid satin weave with radiant sheen', 'Subtle cowl drape at neckline', 'Concealed side zipper fastening'],
        images: [
          'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
        ],
        category: catFashion._id,
        subcategory: subWomen._id,
        brand: brandMap['zara'],
        sku: 'ZRA-DRS-SAT',
        price: 4990,
        comparePrice: 5990,
        discount: 16,
        costPrice: 2400,
        variants: [
          { size: 'S', color: 'Emerald Green', colorCode: '#065f46', sku: 'ZRA-DRS-GRN-S', price: 4990, stock: 10 },
          { size: 'M', color: 'Emerald Green', colorCode: '#065f46', sku: 'ZRA-DRS-GRN-M', price: 4990, stock: 15 },
          { size: 'L', color: 'Champagne Rose', colorCode: '#fbcfe8', sku: 'ZRA-DRS-RSE-L', price: 4990, stock: 8 },
        ],
        specifications: [
          { name: 'Length', value: 'Midi (Below Knee)' },
          { name: 'Care', value: 'Dry Clean Recommended' },
        ],
        stock: 33,
        rating: 4.8,
        reviewCount: 24,
        isTrending: true,
      },

      // 9. Philips Smart Hue Ambience Lamp
      {
        name: 'Philips Smart Wi-Fi LED Color Ambiance Table Lamp',
        slug: 'philips-smart-wifi-led-ambiance-lamp',
        description: 'Transform your room atmosphere with 16 million colors and preset dynamic light modes. Controllable via WiZ app, Alexa, and Google Assistant.',
        features: ['16 million colors plus tunable warm-to-cool white light', 'Voice control with Alexa & Google Assistant', 'Schedules, biorhythm sleep and wake-up lighting'],
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80'
        ],
        category: catHome._id,
        subcategory: subFurniture._id,
        brand: brandMap['philips'],
        sku: 'PHL-HUE-TBL',
        price: 4499,
        comparePrice: 5999,
        discount: 25,
        costPrice: 2800,
        variants: [
          { size: 'Standard', color: 'Matte White', colorCode: '#ffffff', sku: 'PHL-HUE-WHT', price: 4499, stock: 45 },
          { size: 'Standard', color: 'Space Grey', colorCode: '#4b5563', sku: 'PHL-HUE-GRY', price: 4499, stock: 30 },
        ],
        specifications: [
          { name: 'Wattage', value: '13W (Equivalent to 60W bulb)' },
          { name: 'Luminous Flux', value: '800 Lumens' },
          { name: 'Connectivity', value: 'Wi-Fi 2.4GHz + Bluetooth' },
        ],
        stock: 75,
        rating: 4.6,
        reviewCount: 52,
        featured: true,
      },

      // 10. Philips Air Fryer XXL 7.2L
      {
        name: 'Philips Premium Digital Airfryer XXL with Rapid Air Technology (7.2L)',
        slug: 'philips-digital-airfryer-xxl-7l',
        description: 'Great tasting fries with up to 90% less fat. Fry, bake, grill, roast and even reheat with rapid hot air circulating all around your favorite dishes.',
        features: ['Rapid Air Technology for healthier cooking', 'Digital touch screen with 7 presets', 'Keep warm mode for up to 30 mins', 'Dishwasher safe removable parts'],
        images: [
          'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
        ],
        category: catHome._id,
        subcategory: subKitchen._id,
        brand: brandMap['philips'],
        sku: 'PHL-AFR-XXL',
        price: 12999,
        comparePrice: 17999,
        discount: 27,
        costPrice: 8500,
        variants: [
          { size: '7.2L Family Size', color: 'Glossy Black', colorCode: '#111111', sku: 'PHL-AFR-72L', price: 12999, stock: 24 },
        ],
        specifications: [
          { name: 'Capacity', value: '7.2 Litres (1.4 kg capacity)' },
          { name: 'Power', value: '2000 Watts' },
          { name: 'Warranty', value: '2 Years Manufacturer Warranty' },
        ],
        stock: 24,
        rating: 4.9,
        reviewCount: 118,
        isBestSeller: true,
        isTrending: true,
      },

      // 11. Mid-Century Velvet Accent Armchair
      {
        name: 'Nordic Mid-Century Velvet Lounge Accent Chair with Gold Brass Legs',
        slug: 'nordic-mid-century-velvet-accent-chair',
        description: 'Indulge in pure relaxation with this ergonomic accent armchair. High-resilience foam wrapped in sumptuous velvet fabric over powder-coated gold stiletto legs.',
        features: ['Ergonomic barrel backrest design with diamond tufting', 'High-density resilient foam for anti-sag comfort', 'Anti-scratch non-slip rubber pads on legs'],
        images: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
        ],
        category: catHome._id,
        subcategory: subFurniture._id,
        brand: null,
        sku: 'FURN-ACC-CHR',
        price: 18499,
        comparePrice: 24999,
        discount: 26,
        costPrice: 11000,
        variants: [
          { size: 'Single Seater', color: 'Royal Emerald', colorCode: '#064e3b', sku: 'FURN-CHR-GRN', price: 18499, stock: 10 },
          { size: 'Single Seater', color: 'Burnt Ochre Yellow', colorCode: '#d97706', sku: 'FURN-CHR-YLW', price: 18499, stock: 8 },
          { size: 'Single Seater', color: 'Dusty Slate Blue', colorCode: '#475569', sku: 'FURN-CHR-BLU', price: 18499, stock: 6 },
        ],
        specifications: [
          { name: 'Dimensions', value: '78cm H x 72cm W x 68cm D' },
          { name: 'Frame Material', value: 'Solid Hardwood & Steel' },
          { name: 'Weight Capacity', value: 'Up to 150 kg' },
        ],
        stock: 24,
        rating: 4.7,
        reviewCount: 38,
        featured: true,
      },

      // 12. Minimalist Solid Teak Dining Table
      {
        name: 'Scandi Minimalist 6-Seater Solid Teak Wood Dining Table',
        slug: 'scandi-minimalist-solid-teak-dining-table',
        description: 'Crafted from sustainable Grade-A seasoned teak wood with a natural satin oil finish that highlights organic grain variations. Seats 6 adults comfortably.',
        features: ['100% Solid Seasoned Teak Wood (No MDF or Particle Board)', 'Beveled soft-touch edges for child-safe dining', 'Heavy-duty steel reinforcement brackets beneath top'],
        images: [
          'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'
        ],
        category: catHome._id,
        subcategory: subFurniture._id,
        brand: null,
        sku: 'FURN-TEAK-TBL6',
        price: 42999,
        comparePrice: 54999,
        discount: 21,
        costPrice: 28000,
        variants: [
          { size: '6-Seater (180cm)', color: 'Natural Teak Finish', colorCode: '#b45309', sku: 'TBL-TEAK-NAT', price: 42999, stock: 7 },
          { size: '8-Seater (220cm)', color: 'Natural Teak Finish', colorCode: '#b45309', sku: 'TBL-TEAK-NAT8', price: 54999, stock: 4 },
        ],
        specifications: [
          { name: 'Dimensions', value: '180 cm L x 90 cm W x 76 cm H' },
          { name: 'Seating Capacity', value: '6 Persons' },
          { name: 'Wood Type', value: 'Grade-A Plantation Teak' },
        ],
        stock: 11,
        rating: 4.9,
        reviewCount: 15,
      },

      // 13. Sony Alpha A7 IV Mirrorless Camera
      {
        name: 'Sony Alpha 7 IV Full-Frame Mirrorless Camera (Body Only)',
        slug: 'sony-alpha-7-iv-mirrorless-camera',
        description: 'With groundbreaking performance in both still and movie recording, the α7 IV is the ideal hybrid camera, providing breathtaking imagery alongside on-the-spot delivery.',
        features: ['33MP Full-Frame Exmor R CMOS sensor', 'BIONZ XR processor with 8x more processing power', '4K 60p 10-bit 4:2:2 recording with S-Cinetone', '759 phase-detection AF points with Real-time Eye AF'],
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80'
        ],
        category: catElectronics._id,
        subcategory: subLaptops._id,
        brand: brandMap['sony'],
        sku: 'SNY-A7M4-BODY',
        price: 218990,
        comparePrice: 242990,
        discount: 9,
        costPrice: 185000,
        variants: [
          { size: 'Body Only', color: 'Black', colorCode: '#111111', sku: 'SNY-A7M4-BD', price: 218990, stock: 9 },
          { size: 'With 28-70mm Lens Kit', color: 'Black', colorCode: '#111111', sku: 'SNY-A7M4-KT', price: 236990, stock: 6 },
        ],
        specifications: [
          { name: 'Sensor', value: '35.9 x 23.9 mm Full-Frame' },
          { name: 'ISO Range', value: '100 - 51,200 (Exp to 204,800)' },
          { name: 'Stabilization', value: '5-axis in-body image stabilization' },
        ],
        stock: 15,
        rating: 4.8,
        reviewCount: 41,
        featured: true,
      },

      // 14. Samsung 65-inch OLED 4K Smart TV
      {
        name: 'Samsung 65" Class OLED S90D 4K AI Smart TV',
        slug: 'samsung-65-oled-s90d-4k-smart-tv',
        description: 'See sensational color and deep, infinite contrast with OLED powered by Quantum Dot. The NQ4 AI Gen2 Processor drives AI 4K upscaling for breathtaking fidelity.',
        features: ['OLED with HDR Pro and Pantone Validated colors', 'Motion Xcelerator 144Hz for silky smooth gaming', 'Dolby Atmos and Object Tracking Sound Lite', 'LaserSlim Design with bezel-less frame'],
        images: [
          'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80'
        ],
        category: catElectronics._id,
        subcategory: null,
        brand: brandMap['samsung'],
        sku: 'SAM-TV65-OLED',
        price: 189990,
        comparePrice: 229990,
        discount: 17,
        costPrice: 145000,
        variants: [
          { size: '55 Inch', color: 'Titan Black', colorCode: '#1a1a1a', sku: 'SAM-TV55-S90', price: 144990, stock: 12 },
          { size: '65 Inch', color: 'Titan Black', colorCode: '#1a1a1a', sku: 'SAM-TV65-S90', price: 189990, stock: 8 },
        ],
        specifications: [
          { name: 'Resolution', value: '4K Ultra HD (3840 x 2160)' },
          { name: 'Refresh Rate', value: '144 Hz Native' },
          { name: 'Audio Output', value: '40W 2.1 Channel with Dolby Atmos' },
        ],
        stock: 20,
        rating: 4.9,
        reviewCount: 56,
        featured: true,
        isBestSeller: true,
      },

      // 15. Apple Watch Ultra 2
      {
        name: 'Apple Watch Ultra 2 (GPS + Cellular, 49mm Titanium)',
        slug: 'apple-watch-ultra-2-titanium-49mm',
        description: 'The most rugged and capable Apple Watch pushes the limits again. Featuring the all-new S9 SiP, a magical new gesture interaction, and brightest display ever.',
        features: ['Corrosion-resistant 49mm titanium case', 'Precision dual-frequency GPS for accurate distance and pacing', 'Up to 36 hours of battery life, 72 hours in Low Power Mode', '100m water resistance and certified EN13319 dive gauge'],
        images: [
          'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
        ],
        category: catElectronics._id,
        subcategory: null,
        brand: brandMap['apple'],
        sku: 'APL-AWU2-49',
        price: 89900,
        comparePrice: 94900,
        discount: 5,
        costPrice: 72000,
        variants: [
          { size: '49mm Case', color: 'Orange Ocean Band', colorCode: '#ea580c', sku: 'APL-AWU2-ORG', price: 89900, stock: 14 },
          { size: '49mm Case', color: 'Blue Alpine Loop', colorCode: '#1e3a8a', sku: 'APL-AWU2-BLU', price: 89900, stock: 12 },
          { size: '49mm Case', color: 'Titanium Milanese', colorCode: '#94a3b8', sku: 'APL-AWU2-MLN', price: 99900, stock: 8 },
        ],
        specifications: [
          { name: 'Case Size', value: '49 mm' },
          { name: 'Display', value: 'Always-On Retina OLED, 3000 nits' },
          { name: 'Sensors', value: 'ECG, Blood Oxygen, Depth Gauge & Water Temp' },
        ],
        stock: 34,
        rating: 4.8,
        reviewCount: 37,
        isTrending: true,
      },

      // 16. Nike Metcon 9 Training Shoes
      {
        name: 'Nike Metcon 9 Workout Cross Training Shoes',
        slug: 'nike-metcon-9-workout-shoes',
        description: 'Whatever your "why" is for working out, the Metcon 9 makes it all worth it. We improved on the 8 with a larger Hyperlift plate and added rubber rope wrap.',
        features: ['Larger Hyperlift plate in the heel gives stability for tough lifts', 'Dual-density foam midsole provides responsive cushioning', 'Full rubber outsole provides durable traction for dynamic movements'],
        images: [
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
        ],
        category: catFashion._id,
        subcategory: subMen._id,
        brand: brandMap['nike'],
        sku: 'NKE-MTC9-ALL',
        price: 11495,
        comparePrice: 13995,
        discount: 17,
        costPrice: 6200,
        variants: [
          { size: 'UK 8', color: 'Smoke Grey/Volt', colorCode: '#84cc16', sku: 'MTC9-8-GRY', price: 11495, stock: 12 },
          { size: 'UK 9', color: 'Smoke Grey/Volt', colorCode: '#84cc16', sku: 'MTC9-9-GRY', price: 11495, stock: 15 },
          { size: 'UK 10', color: 'Triple Black', colorCode: '#000000', sku: 'MTC9-10-BLK', price: 11495, stock: 11 },
        ],
        specifications: [
          { name: 'Closure', value: 'Lace lock system to prevent untying' },
          { name: 'Best for', value: 'CrossFit, Weightlifting, HIIT' },
        ],
        stock: 38,
        rating: 4.7,
        reviewCount: 29,
      },

      // 17. Zara Linen Blend Overshirt
      {
        name: 'Zara Relaxed Fit 100% Breathable Linen Overshirt',
        slug: 'zara-relaxed-fit-linen-overshirt',
        description: 'Casual overshirt crafted from 100% European flax linen. Cut in an easy relaxed fit with chest patch pockets and horn effect button fastening.',
        features: ['100% Pure European Flax Linen', 'Camp collar with front button placket', 'Breathable and lightweight for warm climates'],
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80'
        ],
        category: catFashion._id,
        subcategory: subMen._id,
        brand: brandMap['zara'],
        sku: 'ZRA-LIN-OVS',
        price: 3990,
        comparePrice: 4990,
        discount: 20,
        costPrice: 2000,
        variants: [
          { size: 'M', color: 'Sand Khaki', colorCode: '#d4b996', sku: 'ZRA-LIN-KHK-M', price: 3990, stock: 16 },
          { size: 'L', color: 'Sand Khaki', colorCode: '#d4b996', sku: 'ZRA-LIN-KHK-L', price: 3990, stock: 20 },
          { size: 'M', color: 'Sky Blue', colorCode: '#7dd3fc', sku: 'ZRA-LIN-BLU-M', price: 3990, stock: 14 },
        ],
        specifications: [
          { name: 'Material', value: '100% Linen' },
          { name: 'Fit', value: 'Relaxed Casual Fit' },
        ],
        stock: 50,
        rating: 4.5,
        reviewCount: 22,
        isNewArrival: true,
      },

      // 18. Professional Damascus Chef Knife 8"
      {
        name: 'Artisan 67-Layer Japanese VG-10 Damascus Steel Chef Knife (8 Inch)',
        slug: 'artisan-67-layer-damascus-chef-knife-8-inch',
        description: 'Forged from authentic 67-layer Japanese VG-10 super steel. Mirror polished with ergonomic pakkawood handle for razor-sharp culinary precision.',
        features: ['67 layers of Damascus steel folded around a VG-10 core', '60±2 Rockwell Hardness rating for exceptional edge retention', '15-degree double bevel blade for surgical slicing'],
        images: [
          'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
        ],
        category: catHome._id,
        subcategory: subKitchen._id,
        brand: null,
        sku: 'KTCH-KNF-DM8',
        price: 6499,
        comparePrice: 8999,
        discount: 27,
        costPrice: 3200,
        variants: [
          { size: '8 Inch', color: 'Blue Resin Pakkawood', colorCode: '#1e40af', sku: 'KNF-DM8-BLU', price: 6499, stock: 22 },
        ],
        specifications: [
          { name: 'Steel Core', value: 'VG-10 Japanese Super Steel' },
          { name: 'Blade Length', value: '20.3 cm (8 inches)' },
          { name: 'Hardness', value: '60±2 HRC' },
        ],
        stock: 22,
        rating: 4.9,
        reviewCount: 46,
        isTrending: true,
      },

      // 19. Ceramic Non-Stick Cookware Set 10-Piece
      {
        name: 'Granite Stone Non-Stick 10-Piece Induction Cookware Set',
        slug: 'granite-stone-non-stick-cookware-set-10-piece',
        description: 'Complete non-toxic ceramic granite cookware set with mineral reinforced coating. 100% free of PTFE, PFOA, lead, and cadmium for healthy daily cooking.',
        features: ['Cast aluminum core distributes heat quickly and evenly', 'Oven safe up to 250°C (with tempered glass lids up to 180°C)', 'Compatible with gas, electric, ceramic, and induction stoves'],
        images: [
          'https://images.unsplash.com/photo-1584990347449-399d21a2243d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
        ],
        category: catHome._id,
        subcategory: subKitchen._id,
        brand: null,
        sku: 'KTCH-CW-10PC',
        price: 9999,
        comparePrice: 14999,
        discount: 33,
        costPrice: 5600,
        variants: [
          { size: '10-Piece Set', color: 'Matte Cream White', colorCode: '#fef3c7', sku: 'CW-10PC-WHT', price: 9999, stock: 15 },
          { size: '10-Piece Set', color: 'Charcoal Grey', colorCode: '#374151', sku: 'CW-10PC-GRY', price: 9999, stock: 12 },
        ],
        specifications: [
          { name: 'Pieces Included', value: 'Frying pans, saucepans, stockpot, silicone utensils' },
          { name: 'Base', value: 'Heavy Gauge Magnetic Induction Base' },
        ],
        stock: 27,
        rating: 4.7,
        reviewCount: 39,
        isBestSeller: true,
      },

      // 20. Philips Sonicare DiamondClean Smart Toothbrush
      {
        name: 'Philips Sonicare DiamondClean Smart 9700 Electric Toothbrush',
        slug: 'philips-sonicare-diamondclean-9700-electric-toothbrush',
        description: 'Our best ever toothbrush for complete oral care. Smart sensor technology gives you personalized feedback and coaching to achieve optimal gum health.',
        features: ['Removes up to 10x more plaque than manual toothbrush', 'Smart sensors monitor pressure, location and scrub intensity', 'Wireless charging glass and premium USB travel case'],
        images: [
          'https://images.unsplash.com/photo-1559591937-e179e8e58a2e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80'
        ],
        category: catElectronics._id,
        subcategory: null,
        brand: brandMap['philips'],
        sku: 'PHL-SNCR-9700',
        price: 21999,
        comparePrice: 27999,
        discount: 21,
        costPrice: 14000,
        variants: [
          { size: 'Standard Kit', color: 'Lunar Blue', colorCode: '#1e3a8a', sku: 'SNCR-BLU', price: 21999, stock: 18 },
          { size: 'Standard Kit', color: 'Rose Gold', colorCode: '#fb7185', sku: 'SNCR-RSG', price: 21999, stock: 14 },
        ],
        specifications: [
          { name: 'Speed', value: 'Up to 62,000 brush movement/min' },
          { name: 'Modes', value: 'Clean, White+, Gum Health, Deep Clean+, TongueCare+' },
          { name: 'Battery', value: 'Lithium-ion up to 14 days per charge' },
        ],
        stock: 32,
        rating: 4.8,
        reviewCount: 33,
      },

      // 21. Hand-Knotted Geometric Wool Area Rug
      {
        name: 'Boho Moroccan Hand-Tufted Geometric Soft Wool Rug (5x7 Ft)',
        slug: 'boho-moroccan-hand-tufted-wool-rug-5x7',
        description: 'Woven by artisan weavers from plush New Zealand wool yarn. Featuring clean tribal geometric patterns that add warm textural depth to living rooms.',
        features: ['100% Hand-spun New Zealand wool with cotton canvas backing', '1.2-inch high pile for ultra soft underfoot cushioning', 'Naturally stain resistant and durable for high traffic zones'],
        images: [
          'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'
        ],
        category: catHome._id,
        subcategory: subFurniture._id,
        brand: null,
        sku: 'DECR-RUG-5X7',
        price: 14999,
        comparePrice: 21999,
        discount: 31,
        costPrice: 8500,
        variants: [
          { size: '5 x 7 Feet', color: 'Ivory / Charcoal Black', colorCode: '#f8fafc', sku: 'RUG-5X7-IVR', price: 14999, stock: 12 },
          { size: '8 x 10 Feet', color: 'Ivory / Charcoal Black', colorCode: '#f8fafc', sku: 'RUG-8X10-IVR', price: 24999, stock: 6 },
        ],
        specifications: [
          { name: 'Pile Height', value: '30 mm High Pile' },
          { name: 'Material', value: '80% Wool, 20% Cotton' },
        ],
        stock: 18,
        rating: 4.6,
        reviewCount: 19,
      },

      // 22. Luxury Velvet Blackout Curtains (Set of 2)
      {
        name: 'Thermal Insulated Velvet Heavy Blackout Drapes (Set of 2 Panels)',
        slug: 'thermal-insulated-velvet-heavy-blackout-curtains',
        description: 'Block 99% of sunlight and harmful UV rays with these opulent velvet curtain panels. Keeps bedrooms dark, quiet, and thermally insulated year-round.',
        features: ['High-density 330 GSM velvet fabric with silky drape', 'Rust-proof bronze metal grommets fit up to 1.6 inch curtain rods', 'Blocks drafts and dampens exterior street noise'],
        images: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'
        ],
        category: catHome._id,
        subcategory: subFurniture._id,
        brand: null,
        sku: 'DECR-CURT-VLV',
        price: 3499,
        comparePrice: 4999,
        discount: 30,
        costPrice: 1800,
        variants: [
          { size: '84 Inch Length', color: 'Forest Green', colorCode: '#14532d', sku: 'CURT-84-GRN', price: 3499, stock: 25 },
          { size: '96 Inch Length', color: 'Forest Green', colorCode: '#14532d', sku: 'CURT-96-GRN', price: 3999, stock: 18 },
          { size: '84 Inch Length', color: 'Champagne Gold', colorCode: '#eab308', sku: 'CURT-84-GLD', price: 3499, stock: 20 },
        ],
        specifications: [
          { name: 'Quantity', value: '2 Panels (52" W x 84" L each)' },
          { name: 'Opacity', value: '100% Total Blackout' },
        ],
        stock: 63,
        rating: 4.8,
        reviewCount: 26,
      },

      // 23. Sony PlayStation 5 Slim Console
      {
        name: 'Sony PlayStation 5 Slim Console (1TB SSD, Disc Edition)',
        slug: 'sony-playstation-5-slim-console-1tb',
        description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers and 3D Audio.',
        features: ['Slimmer, more compact design with 1TB SSD built-in', 'Ray tracing with support for up to 120 fps at 4K output', 'DualSense Wireless Controller with adaptive triggers included'],
        images: [
          'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
        ],
        category: catElectronics._id,
        subcategory: null,
        brand: brandMap['sony'],
        sku: 'SNY-PS5-SLM',
        price: 54990,
        comparePrice: 59990,
        discount: 8,
        costPrice: 46000,
        variants: [
          { size: '1TB Disc Edition', color: 'White / Black', colorCode: '#ffffff', sku: 'PS5-SLM-DSC', price: 54990, stock: 15 },
        ],
        specifications: [
          { name: 'CPU', value: 'x86-64-AMD Ryzen Zen 2, 8 Cores / 16 Threads' },
          { name: 'GPU', value: 'AMD Radeon RDNA 2-based graphics engine, 10.3 TFLOPS' },
          { name: 'Storage', value: '1 TB Custom NVMe SSD' },
        ],
        stock: 15,
        rating: 4.9,
        reviewCount: 94,
        featured: true,
        isBestSeller: true,
        isTrending: true,
      },

      // 24. Samsung Galaxy Tab S9 Ultra
      {
        name: 'Samsung Galaxy Tab S9 Ultra (14.6" Dynamic AMOLED, S Pen Included, 256GB)',
        slug: 'samsung-galaxy-tab-s9-ultra-256gb',
        description: 'Our largest tablet with an expansive 14.6-inch Dynamic AMOLED 2X display. IP68 water and dust resistance, Snapdragon 8 Gen 2, and ultra-low latency S Pen.',
        features: ['Massive 14.6-inch Dynamic AMOLED 2X with Vision Booster', 'IP68 water and dust resistance on tablet and S Pen', 'Quad speakers tuned by AKG with Dolby Atmos surround sound'],
        images: [
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80'
        ],
        category: catElectronics._id,
        subcategory: null,
        brand: brandMap['samsung'],
        sku: 'SAM-TAB-S9U',
        price: 108999,
        comparePrice: 121999,
        discount: 10,
        costPrice: 88000,
        variants: [
          { size: '12GB / 256GB Wi-Fi', color: 'Graphite', colorCode: '#262626', sku: 'TAB-S9U-256-WIFI', price: 108999, stock: 10 },
          { size: '12GB / 512GB 5G', color: 'Graphite', colorCode: '#262626', sku: 'TAB-S9U-512-5G', price: 129999, stock: 6 },
        ],
        specifications: [
          { name: 'Display', value: '14.6-inch 2960 x 1848 pixels, 120Hz' },
          { name: 'Battery', value: '11,200 mAh with 45W Fast Charging' },
          { name: 'Stylus', value: 'Bi-directional charging S Pen included' },
        ],
        stock: 16,
        rating: 4.8,
        reviewCount: 27,
      },
    ];

    const insertedProducts = await Product.insertMany(productsData);

    console.log('📝 Creating initial inventory audit logs...');
    for (const p of insertedProducts) {
      await InventoryHistory.create({
        product: p._id,
        previousQuantity: 0,
        newQuantity: p.stock,
        quantityChanged: p.stock,
        action: 'seed',
        user: adminUser._id,
        notes: 'Initial seed stock',
      });
    }

    console.log('🎟️ Seeding Coupons...');
    await Coupon.create([
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 999,
        maxDiscount: 1000,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 5000,
        userUsageLimit: 1,
        isActive: true,
      },
      {
        code: 'FLASHSALE20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 2999,
        maxDiscount: 2500,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        userUsageLimit: 2,
        isActive: true,
      },
      {
        code: 'FREESHIP',
        discountType: 'fixed',
        discountValue: 99,
        minOrderValue: 499,
        maxDiscount: 99,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 10000,
        userUsageLimit: 5,
        isActive: true,
      },
      {
        code: 'FESTIVE500',
        discountType: 'fixed',
        discountValue: 500,
        minOrderValue: 2500,
        maxDiscount: 500,
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        usageLimit: 1000,
        userUsageLimit: 1,
        isActive: true,
      }
    ]);

    console.log('🖼️ Seeding Marketing Banners...');
    await Banner.create([
      {
        title: 'Elevate Your Digital Life',
        subtitle: 'Unleash the next generation of tech innovations with exclusive discounts up to 30%',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'Explore Electronics',
        link: '/shop?category=electronics',
        type: 'home_hero',
        order: 1,
        isActive: true,
      },
      {
        title: 'Spring / Summer Runway',
        subtitle: 'Curated premium fashion, sneakers, and modern tailored silhouettes for effortless luxury',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'Discover Fashion',
        link: '/shop?category=fashion',
        type: 'home_hero',
        order: 2,
        isActive: true,
      },
      {
        title: 'Scandinavian Living & Interiors',
        subtitle: 'Transform your home with mid-century teak furniture and ambient smart lighting',
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'Shop Home Decor',
        link: '/shop?category=home-living',
        type: 'home_hero',
        order: 3,
        isActive: true,
      },
    ]);

    console.log('⭐ Seeding Reviews...');
    const iphoneProduct = insertedProducts[0];
    const sonyHeadphones = insertedProducts[2];

    await Review.create([
      {
        product: iphoneProduct._id,
        user: customerUser._id,
        rating: 5,
        title: 'Best smartphone in the market today!',
        comment: 'The natural titanium finish feels unbelievable in hand. Weight reduction over the 14 Pro is noticeable immediately, and the camera zoom is astonishingly crisp.',
        isVerifiedPurchase: true,
        helpfulCount: 14,
        isApproved: true,
      },
      {
        product: sonyHeadphones._id,
        user: customerUser._id,
        rating: 5,
        title: 'The Noise Cancellation is supernatural',
        comment: 'I take regular flights and the XM5 literally silences airplane engines into a whisper. Soundstage is wide and the mic quality on Zoom calls is crystal clear.',
        isVerifiedPurchase: true,
        helpfulCount: 22,
        isApproved: true,
      }
    ]);

    console.log('❓ Seeding FAQs...');
    await FAQ.create([
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept Razorpay (Credit/Debit Cards, UPI, Net Banking, PayTM, PhonePe, Google Pay, Wallets) as well as Cash on Delivery (COD) for eligible pincodes and orders under ₹20,000.',
        category: 'Payments',
        order: 1,
      },
      {
        question: 'How long will delivery take?',
        answer: 'Standard shipping takes 3 to 5 business days across India. Metro cities (Delhi, Mumbai, Bengaluru, Chennai, Hyderabad) typically receive orders within 2 business days.',
        category: 'Shipping',
        order: 2,
      },
      {
        question: 'What is your return policy?',
        answer: 'We offer a hassle-free 7-day return window from the date of delivery for all genuine items in original condition with packaging intact. You can initiate a return directly from your My Account > Orders tab.',
        category: 'Returns',
        order: 3,
      },
      {
        question: 'Are all products authentic and covered by warranty?',
        answer: 'Yes, 100%! All our products are sourced directly from authorized brand distributors with genuine manufacturer warranties valid across authorized service centers nationwide.',
        category: 'General',
        order: 4,
      },
    ]);

    console.log('⚙️ Seeding Store Settings...');
    await Settings.create({
      storeName: 'ShopEase',
      storeEmail: 'support@shopease.com',
      storePhone: '+91 98765 43210',
      currency: 'INR',
      currencySymbol: '₹',
      freeShippingThreshold: 999,
      standardShippingFee: 99,
      taxPercentage: 18,
      codEnabled: true,
      maxCodAmount: 20000,
      restrictedCodPincodes: ['110000', '999999'],
      allowGuestCheckout: true,
    });

    console.log('🎉 Seed process completed successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 Demo Admin Credentials:');
    console.log('   Email: admin@ecommerce.com');
    console.log('   Password: admin123');
    console.log('🔑 Demo Customer Credentials:');
    console.log('   Email: customer@ecommerce.com');
    console.log('   Password: customer123');
    console.log('🎟️ Available Coupons: WELCOME10, FLASHSALE20, FREESHIP, FESTIVE500');
    console.log('----------------------------------------------------');

    return true;
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedData;

