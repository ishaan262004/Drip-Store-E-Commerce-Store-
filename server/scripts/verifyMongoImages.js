/**
 * verifyMongoImages.js — check how many cross-product duplicate image URLs
 * remain in MongoDB after the cleanDuplicateImages.js run.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product  = require("../models/Product");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({}, "name images").lean();

  const urlCount = new Map();
  for (const p of products) {
    for (const img of (p.images || [])) {
      urlCount.set(img, (urlCount.get(img) || 0) + 1);
    }
  }

  const shared = [...urlCount.entries()].filter(([, c]) => c > 1);

  console.log(`\nProducts in MongoDB : ${products.length}`);
  console.log(`Unique image URLs   : ${urlCount.size}`);
  console.log(`Cross-product dups  : ${shared.length}`);

  if (shared.length > 0) {
    console.log("\nTop shared URLs:");
    shared.slice(0, 10).forEach(([url, cnt]) =>
      console.log(`  ${cnt}x  ${url.slice(0, 80)}`)
    );
  } else {
    console.log("\n✅  No cross-product duplicate image URLs found in MongoDB!");
  }

  await mongoose.disconnect();
}
run().catch(console.error);
