const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} = require("../controllers/productController");
const { protect, attachUser, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

router
  .route("/")
  .get(getProducts)
  .post(protect, attachUser, isAdmin, upload.array("images", 5), createProduct);

router
  .route("/:id")
  .get(getProduct)
  .put(protect, attachUser, isAdmin, upload.array("images", 5), updateProduct)
  .delete(protect, attachUser, isAdmin, deleteProduct);

router.post("/:id/review", protect, attachUser, addReview);

module.exports = router;
