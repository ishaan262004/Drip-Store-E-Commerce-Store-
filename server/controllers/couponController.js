const Coupon = require("../models/Coupon");

// @desc    Create coupon (admin)
// @route   POST /api/coupons
exports.createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;

    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxUses,
      expiresAt,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single coupon
// @route   GET /api/coupons/:id
exports.getCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate coupon code (public)
// @route   POST /api/coupons/validate
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid coupon code" });
    }
    if (coupon.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }
    if (orderAmount && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount is $${coupon.minOrderAmount}` });
    }

    const discount =
      coupon.discountType === "percentage"
        ? (orderAmount * coupon.discountValue) / 100
        : coupon.discountValue;

    res.status(200).json({ success: true, coupon, discount: Math.min(discount, orderAmount) });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon (admin)
// @route   PUT /api/coupons/:id
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon (admin)
// @route   DELETE /api/coupons/:id
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    await coupon.deleteOne();
    res.status(200).json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    next(error);
  }
};
