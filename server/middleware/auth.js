const { ClerkExpressRequireAuth, clerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

// Protect routes — require valid Clerk session
const protect = ClerkExpressRequireAuth({});

// Resolve Clerk session → MongoDB user. Sets req.user.
const attachUser = async (req, res, next) => {
  try {
    const clerkId = req.auth?.userId;
    if (!clerkId) {
      return res.status(401).json({ success: false, message: 'No user ID in session' });
    }

    // 1) Fast path: find by clerkId
    let user = await User.findOne({ clerkId });

    // 2) If not found by clerkId, resolve email and match
    if (!user) {
      let email = null;

      // Try Clerk API to get email
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        if (clerkUser) {
          const primary = clerkUser.emailAddresses?.find(
            (e) => e.id === clerkUser.primaryEmailAddressId
          );
          email = primary?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;
        }
      } catch (clerkErr) {
        console.error('Clerk API error:', clerkErr.message);
      }

      // Match by email in MongoDB
      if (email) {
        user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
          // Link clerkId for future fast lookups
          try {
            user.clerkId = clerkId;
            await user.save();
          } catch (saveErr) {
            // If save fails (e.g. duplicate key), just continue with the user we found
            console.error('clerkId link error:', saveErr.message);
          }
        }
      }

      // 3) Auto-create if still not found
      if (!user) {
        user = await User.create({
          clerkId,
          name: 'User',
          email: email || `${clerkId}@clerk.user`,
        });
      }
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('attachUser error:', err.message, err.stack);
    return res.status(500).json({ success: false, message: 'Auth check failed' });
  }
};

// Admin-only middleware — must be used AFTER attachUser
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

module.exports = { protect, attachUser, isAdmin };
