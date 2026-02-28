const express = require("express");
const router = express.Router();
const { getAdminUsers, getAdminStats } = require("../controllers/adminController");
const { getAllOrders } = require("../controllers/orderController");
const { getProducts } = require("../controllers/productController");
const { protect, attachUser, isAdmin } = require("../middleware/auth");

router.use(protect, attachUser, isAdmin);

router.get("/users", getAdminUsers);
router.get("/stats", getAdminStats);
router.get("/orders", getAllOrders);
router.get("/products", getProducts);

module.exports = router;
