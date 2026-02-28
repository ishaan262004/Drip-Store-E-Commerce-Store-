const express = require("express");
const router = express.Router();
const { getMe, updateMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

module.exports = router;
