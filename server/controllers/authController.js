const User = require("../models/User");

// @desc    Sync/create user from Clerk session
// @route   GET /api/auth/me
// @access  Protected (Clerk)
exports.getMe = async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;

    if (!clerkId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Find or create user by Clerk ID
    let user = await User.findOne({ clerkId }).populate("wishlist");

    if (!user) {
      // Auto-create user on first API call after Clerk sign-in
      // Clerk session claims contain basic user info
      const { sessionClaims } = req.auth;
      user = await User.create({
        clerkId,
        name: sessionClaims?.name || sessionClaims?.firstName || "User",
        email: sessionClaims?.email || `${clerkId}@clerk.user`,
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Protected (Clerk)
exports.updateMe = async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    const { name, addresses } = req.body;

    const user = await User.findOneAndUpdate(
      { clerkId },
      { ...(name && { name }), ...(addresses && { addresses }) },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
