const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const { orderConfirmationEmail } = require("../utils/sendEmail");

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { products, shippingAddress, paymentMethod, totalPrice, couponCode, stripePaymentIntentId } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "No products in order" });
    }

    let discount = 0;
    let couponApplied = null;

    // Validate coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!coupon || coupon.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: "Invalid or expired coupon" });
      }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
      }
      if (totalPrice < coupon.minOrderAmount) {
        return res.status(400).json({ success: false, message: `Minimum order amount is $${coupon.minOrderAmount}` });
      }

      discount =
        coupon.discountType === "percentage"
          ? (totalPrice * coupon.discountValue) / 100
          : coupon.discountValue;

      couponApplied = coupon._id;
      coupon.usedCount += 1;
      await coupon.save();
    }

    const order = await Order.create({
      userId: req.user._id,
      products,
      shippingAddress,
      paymentMethod,
      stripePaymentIntentId: stripePaymentIntentId || undefined,
      paymentStatus: stripePaymentIntentId ? "Paid" : "Pending",
      totalPrice: totalPrice - discount,
      discount,
      couponApplied,
    });

    // Reduce stock for each ordered product by matching name
    for (const item of products) {
      if (item.name) {
        await Product.updateOne(
          { name: item.name, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    // Send confirmation email (non-blocking)
    orderConfirmationEmail(order, req.user.email).catch((err) =>
      console.error("Email error:", err.message)
    );

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders for a user
// @route   GET /api/orders/:userId
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("products.productId", "name images price")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("products.productId", "name images price")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order (admin)
// @route   DELETE /api/orders/:id
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    await order.deleteOne();
    res.status(200).json({ success: true, message: "Order deleted" });
  } catch (error) {
    next(error);
  }
};
