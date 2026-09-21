const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const InventoryHistory = require('../models/InventoryHistory');
const slugify = require('slugify');

// @desc    Get all products with advanced search, filters & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      rating,
      inStock,
      discount,
      size,
      color,
      sort,
      page = 1,
      limit = 12,
      featured,
      isTrending,
      isBestSeller,
      isNewArrival,
      isFlashSale
    } = req.query;

    const query = { status: 'published' };

    // Text / Keyword Search
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { sku: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Category filter (supports either ObjectId or Category slug)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const catObj = await Category.findOne({ slug: category });
        if (catObj) {
          query.category = catObj._id;
        }
      }
    }

    // Subcategory filter
    if (subcategory) {
      if (subcategory.match(/^[0-9a-fA-F]{24}$/)) {
        query.subcategory = subcategory;
      } else {
        const subCatObj = await Category.findOne({ slug: subcategory });
        if (subCatObj) {
          query.subcategory = subCatObj._id;
        }
      }
    }

    // Brand filter (supports either ObjectId or Brand slug)
    if (brand) {
      if (brand.match(/^[0-9a-fA-F]{24}$/)) {
        query.brand = brand;
      } else {
        const brandObj = await Brand.findOne({ slug: brand });
        if (brandObj) {
          query.brand = brandObj._id;
        }
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // In Stock filter
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
    }

    // Discount filter
    if (discount) {
      query.discount = { $gte: Number(discount) };
    }

    // Variant Size filter
    if (size) {
      query['variants.size'] = size;
    }

    // Variant Color filter
    if (color) {
      query['variants.color'] = { $regex: new RegExp(`^${color}$`, 'i') };
    }

    // Featured flags
    if (featured === 'true') query.featured = true;
    if (isTrending === 'true') query.isTrending = true;
    if (isBestSeller === 'true') query.isBestSeller = true;
    if (isNewArrival === 'true') query.isNewArrival = true;
    if (isFlashSale === 'true') query.isFlashSale = true;

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price-low-high' || sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high-low' || sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'highest-rated' || sort === 'rating-desc') {
      sortOption = { rating: -1 };
    } else if (sort === 'best-selling') {
      sortOption = { isBestSeller: -1, reviewCount: -1 };
    } else if (sort === 'discount') {
      sortOption = { discount: -1 };
    } else if (sort === 'relevance' && keyword) {
      sortOption = { name: 1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get autocomplete search suggestions
// @route   GET /api/products/suggestions
// @access  Public
const getSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ success: true, data: [] });
    }

    const suggestions = await Product.find({
      name: { $regex: q, $options: 'i' },
      status: 'published',
    })
      .select('name slug price images category brand')
      .populate('category', 'name')
      .populate('brand', 'name')
      .limit(8);

    res.json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [
        { slug: req.params.slug },
        ...(req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.slug }] : [])
      ]
    })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('brand', 'name slug logo');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch related products from the same category
    const relatedProducts = await Product.find({
      category: product.category?._id,
      _id: { $ne: product._id },
      status: 'published'
    })
      .limit(4)
      .select('name slug price comparePrice discount images rating reviewCount');

    res.json({
      success: true,
      data: product,
      relatedProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    if (!productData.slug && productData.name) {
      productData.slug = slugify(productData.name, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 7);
    }

    if (!productData.sku) {
      productData.sku = 'SKU-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    }

    if (productData.comparePrice && productData.comparePrice > productData.price) {
      productData.discount = Math.round(((productData.comparePrice - productData.price) / productData.comparePrice) * 100);
    }

    const product = await Product.create(productData);

    // Record initial inventory history
    await InventoryHistory.create({
      product: product._id,
      previousQuantity: 0,
      newQuantity: product.stock,
      quantityChanged: product.stock,
      action: 'restock',
      user: req.user._id,
      notes: 'Initial inventory creation',
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const oldStock = product.stock;
    const updateData = { ...req.body };

    if (updateData.comparePrice && updateData.price && updateData.comparePrice > updateData.price) {
      updateData.discount = Math.round(((updateData.comparePrice - updateData.price) / updateData.comparePrice) * 100);
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // Record inventory change if stock was adjusted
    if (updateData.stock !== undefined && updateData.stock !== oldStock) {
      await InventoryHistory.create({
        product: updatedProduct._id,
        previousQuantity: oldStock,
        newQuantity: updateData.stock,
        quantityChanged: updateData.stock - oldStock,
        action: 'manual_adjustment',
        user: req.user._id,
        notes: req.body.inventoryNote || 'Admin stock update',
      });
    }

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getSuggestions,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
