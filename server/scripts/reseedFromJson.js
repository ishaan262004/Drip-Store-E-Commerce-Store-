/**
 * reseedFromJson.js
 * =================
 * Clears the MongoDB products collection and re-seeds it from
 * client/public/products.json, which already contains 500 unique image URLs.
 *
 * This resolves all remaining cross-product duplicate image URLs in MongoDB.
 *
 * Usage:
 *   node server/scripts/reseedFromJson.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const fs       = require("fs");
const path     = require("path");
const { dedupeImages } = require("../utils/imageUtils");

const PRODUCTS_JSON = path.join(__dirname, "../../client/public/products.json");

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌  MONGO_URI not found in server/.env");
    process.exit(1);
  }

  console.log("\n════════════════════════════════════════════════════");
  console.log("  🌱 Re-seeding MongoDB from products.json");
  console.log("════════════════════════════════════════════════════\n");

  // Load and validate source
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf-8"));
  console.log(`📦  Loaded ${products.length} products from products.json`);

  // Pre-check uniqueness
  const urlSet = new Set();
  let conflicts = 0;
  for (const p of products) {
    for (const img of (p.images || [])) {
      if (urlSet.has(img)) conflicts++;
      else urlSet.add(img);
    }
  }
  console.log(`🖼️   Image URLs: ${urlSet.size} unique, ${conflicts} conflicts in source file`);

  await mongoose.connect(mongoUri);
  console.log("✅  Connected to MongoDB\n");

  // Use raw collection to avoid schema differences with the seed's simplified schema
  const col = mongoose.connection.collection("products");

  // Clear existing
  const deleted = await col.deleteMany({});
  console.log(`🗑️   Cleared ${deleted.deletedCount} existing products`);

  // Prepare documents — dedupe images as a final safety net
  const docs = products.map((p) => ({
    ...p,
    images: dedupeImages(p.images || []),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // Insert
  const result = await col.insertMany(docs);
  console.log(`✅  Inserted ${result.insertedCount} products\n`);

  // Post-seed verification
  const seeded = await col.find({}, { projection: { images: 1 } }).toArray();
  const seededUrls = new Map();
  for (const p of seeded) {
    for (const img of (p.images || [])) {
      seededUrls.set(img, (seededUrls.get(img) || 0) + 1);
    }
  }
  const shared = [...seededUrls.entries()].filter(([, c]) => c > 1);

  console.log("📊  Post-seed verification:");
  console.log(`    Products        : ${seeded.length}`);
  console.log(`    Unique image URLs: ${seededUrls.size}`);
  console.log(`    Cross-product dups: ${shared.length}`);

  if (shared.length === 0) {
    console.log("\n🎉  All product images are now unique in MongoDB!\n");
  } else {
    console.log(`\n⚠️   ${shared.length} cross-product duplicate URLs remain (may be from products.json itself).\n`);
  }

  // Category breakdown
  const categories = {};
  for (const p of products) {
    categories[p.category] = (categories[p.category] || 0) + 1;
  }
  console.log("📂  Products by category:", categories);

  await mongoose.disconnect();
  console.log("\n🔌  Disconnected. Done.\n");
}

run().catch((err) => {
  console.error("💥  Error:", err);
  process.exit(1);
});
