const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");
const { protect, attachUser, isAdmin } = require("../middleware/auth");

router.route("/").post(protect, attachUser, createOrder).get(protect, attachUser, isAdmin, getAllOrders);

router.get("/:userId", protect, getUserOrders);

router
  .route("/:id")
  .put(protect, attachUser, isAdmin, updateOrderStatus)
  .delete(protect, attachUser, isAdmin, deleteOrder);

module.exports = router;
