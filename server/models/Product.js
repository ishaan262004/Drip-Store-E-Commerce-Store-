const mongoose = require("mongoose");
const { dedupeImages } = require("../utils/imageUtils");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true },
    category: { type: String, required: [true, "Category is required"], trim: true },
    price: { type: Number, required: [true, "Price is required"], min: 0 },
    description: { type: String, trim: true },
    brand: { type: String, trim: true },
    images: [{ type: String }],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

/**
 * Pre-save hook: deduplicate the images array before every write.
 * This is the last line of defence — it fires regardless of where
 * the data originated (controller, seed script, direct DB write, etc.).
 */
productSchema.pre("save", function (next) {
  if (this.isModified("images")) {
    this.images = dedupeImages(this.images);
  }
  next();
});

/**
 * Also runs dedup when using findByIdAndUpdate / findOneAndUpdate,
 * because those bypass the pre("save") hook by default.
 */
productSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  const update = this.getUpdate();
  if (update && update.images) {
    update.images = dedupeImages(update.images);
  }
  if (update && update.$set && update.$set.images) {
    update.$set.images = dedupeImages(update.$set.images);
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
