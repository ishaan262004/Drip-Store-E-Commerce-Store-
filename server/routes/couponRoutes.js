const express = require("express");
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  getCoupon,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const { protect, isAdmin } = require("../middleware/auth");

router.post("/validate", protect, validateCoupon);

router
  .route("/")
  .get(protect, isAdmin, getCoupons)
  .post(protect, isAdmin, createCoupon);

router
  .route("/:id")
  .get(protect, isAdmin, getCoupon)
  .put(protect, isAdmin, updateCoupon)
  .delete(protect, isAdmin, deleteCoupon);

module.exports = router;
