const Product = require("../models/Product");
const { dedupeImages } = require("../utils/imageUtils");

// @desc    Get all products (with filters, search, pagination)
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search, sort, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category) query.category = { $regex: category, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.name = { $regex: search, $options: "i" };

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "rating") sortOption = { ratings: -1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortOption).skip(skip).limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.userId", "name");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const { name, category, price, description, brand, sizes, colors, stock } = req.body;

    // Handle uploaded images — store URLs (dedupe at controller level for safety)
    const rawImages = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];
    const images = dedupeImages(rawImages);

    // Parse sizes and colors if they come as JSON strings
    const parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes || [];
    const parsedColors = typeof colors === "string" ? JSON.parse(colors) : colors || [];

    const product = await Product.create({
      name,
      category,
      price,
      description,
      brand,
      images,
      sizes: parsedSizes,
      colors: parsedColors,
      stock,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // If new images uploaded, merge with existing and dedupe
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      req.body.images = dedupeImages([...(product.images || []), ...newImages]);
    } else if (req.body.images) {
      // Dedupe if images array was sent directly in the request body
      req.body.images = dedupeImages(
        Array.isArray(req.body.images) ? req.body.images : [req.body.images]
      );
    }

    // Parse sizes/colors if needed
    if (typeof req.body.sizes === "string") req.body.sizes = JSON.parse(req.body.sizes);
    if (typeof req.body.colors === "string") req.body.colors = JSON.parse(req.body.colors);

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update a review
// @route   POST /api/products/:id/review
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      product.reviews.push({ userId: req.user._id, rating, comment });
    }

    // Recalculate average rating
    product.numReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(200).json({ success: true, message: "Review submitted", product });
  } catch (error) {
    next(error);
  }
};
