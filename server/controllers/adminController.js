const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { clerkClient } = require("@clerk/clerk-sdk-node");

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
exports.getAdminUsers = async (req, res, next) => {
  try {
    // Sync Clerk users → MongoDB so everyone shows up
    try {
      const clerkUsers = await clerkClient.users.getUserList({ limit: 100 });
      const list = Array.isArray(clerkUsers) ? clerkUsers : clerkUsers.data || [];

      for (const cu of list) {
        const primary = cu.emailAddresses?.find((e) => e.id === cu.primaryEmailAddressId);
        const email = (primary?.emailAddress || cu.emailAddresses?.[0]?.emailAddress || "").toLowerCase();
        if (!email) continue;

        const existing = await User.findOne({ $or: [{ clerkId: cu.id }, { email }] });
        if (!existing) {
          await User.create({
            clerkId: cu.id,
            name: [cu.firstName, cu.lastName].filter(Boolean).join(" ") || "User",
            email,
          });
        } else if (!existing.clerkId) {
          existing.clerkId = cu.id;
          if (existing.name === "User") {
            existing.name = [cu.firstName, cu.lastName].filter(Boolean).join(" ") || existing.name;
          }
          await existing.save().catch(() => {});
        }
      }
    } catch (syncErr) {
      console.error("Clerk sync error:", syncErr.message);
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });

    // Get order counts per user
    const orderCounts = await Order.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 }, totalSpent: { $sum: "$totalPrice" } } },
    ]);

    const countMap = {};
    orderCounts.forEach((o) => {
      countMap[o._id.toString()] = { count: o.count, totalSpent: o.totalSpent };
    });

    const enriched = users.map((u) => {
      const stats = countMap[u._id.toString()] || { count: 0, totalSpent: 0 };
      return { ...u.toObject(), orderCount: stats.count, totalSpent: stats.totalSpent };
    });

    res.json({ success: true, count: enriched.length, users: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin analytics stats
// @route   GET /api/admin/stats
// @access  Admin
exports.getAdminStats = async (req, res, next) => {
  try {
    const [totalOrders, totalUsers, totalProducts, revenueAgg, statusAgg, topProducts] =
      await Promise.all([
        Order.countDocuments(),
        User.countDocuments(),
        Product.countDocuments(),
        Order.aggregate([
          { $match: { paymentStatus: "Paid" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
        Order.aggregate([
          { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
        ]),
        Order.aggregate([
          { $unwind: "$products" },
          {
            $group: {
              _id: "$products.productId",
              name: { $first: "$products.name" },
              totalQty: { $sum: "$products.quantity" },
              totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
            },
          },
          { $sort: { totalQty: -1 } },
          { $limit: 5 },
        ]),
        // Monthly revenue for last 6 months
      ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    // Pending orders (Processing)
    const pendingCount = statusAgg.find((s) => s._id === "Processing")?.count || 0;

    // Order status breakdown
    const statusBreakdown = {};
    statusAgg.forEach((s) => { statusBreakdown[s._id] = s.count; });

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: "Paid", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalRevenue,
        pendingCount,
        statusBreakdown,
        topProducts,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};
