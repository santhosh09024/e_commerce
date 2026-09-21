const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Helper to recalculate product rating
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId, isApproved: true });
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
    return;
  }

  const sum = reviews.reduce((acc, item) => acc + item.rating, 0);
  const avgRating = Number((sum / reviews.length).toFixed(1));

  await Product.findByIdAndUpdate(productId, {
    rating: avgRating,
    reviewCount: reviews.length,
  });
};

// @desc    Get reviews for a product with breakdown
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach(r => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
      sum += r.rating;
    });

    const averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;

    res.json({
      success: true,
      total,
      averageRating,
      distribution,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create review for product
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment, images = [] } = req.body;

    if (!rating || !title || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide rating, title, and comment' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({ product: productId, user: req.user._id });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this product' });
    }

    // Check verified purchase: has the user purchased and received this product?
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: { $in: ['Delivered', 'Confirmed', 'Shipped', 'Out for delivery'] },
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      title,
      comment,
      images,
      isVerifiedPurchase: !!hasPurchased,
      isApproved: true,
    });

    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const userIdStr = req.user._id.toString();
    const alreadyMarked = review.helpfulUsers.some(u => u.toString() === userIdStr);

    if (alreadyMarked) {
      review.helpfulUsers.pull(req.user._id);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulUsers.push(req.user._id);
      review.helpfulCount += 1;
    }

    await review.save();
    res.json({ success: true, helpfulCount: review.helpfulCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all reviews
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
const getAdminReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name slug images')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: toggle approval status
// @route   PUT /api/reviews/admin/:id/approve
// @access  Private/Admin
const moderateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    await updateProductRating(review.product);

    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);

    res.json({ success: true, message: 'Review removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  markHelpful,
  getAdminReviews,
  moderateReview,
  deleteReview,
};
