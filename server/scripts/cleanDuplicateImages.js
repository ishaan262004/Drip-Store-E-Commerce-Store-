/**
 * cleanDuplicateImages.js
 * =======================
 * One-shot maintenance script to clean duplicate image URLs already stored
 * in MongoDB.
 *
 * What it does
 * ────────────
 *  1. Removes duplicate URLs *within* a single product's images array.
 *  2. Removes invalid URLs (base64, placeholders, non-http).
 *  3. Detects and logs image URLs that are *shared across multiple products*
 *     (does not auto-remove — sharing may be intentional for product variants).
 *
 * Usage
 * ─────
 *  Preview what would change (no DB writes):
 *    node server/scripts/cleanDuplicateImages.js --dry-run
 *
 *  Apply fixes:
 *    node server/scripts/cleanDuplicateImages.js
 *
 * The script reads MONGO_URI from server/.env automatically.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mongoose = require("mongoose");
const Product = require("../models/Product");
const { dedupeImages, normaliseUrl } = require("../utils/imageUtils");

const IS_DRY_RUN = process.argv.includes("--dry-run");

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(msg);
}

function pluralise(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌  MONGO_URI not found in environment. Check server/.env");
    process.exit(1);
  }

  log(`\n${"═".repeat(60)}`);
  log(`  🧹 Duplicate Image Cleanup Script`);
  log(`  Mode: ${IS_DRY_RUN ? "🔍 DRY RUN (no changes will be written)" : "✏️  LIVE (changes WILL be written)"}`);
  log(`${"═".repeat(60)}\n`);

  await mongoose.connect(mongoUri);
  log("✅  Connected to MongoDB\n");

  const products = await Product.find({}).lean();
  log(`📦  Found ${pluralise(products.length, "product")}\n`);

  // ── Step 1: Per-product deduplication ──────────────────────────────────────
  let totalCleaned = 0;
  let totalUrlsRemoved = 0;
  const updates = [];                    // { id, newImages } — applied only in live mode

  for (const product of products) {
    const original = product.images || [];
    const cleaned  = dedupeImages(original);

    const removed = original.length - cleaned.length;

    if (removed > 0) {
      totalCleaned++;
      totalUrlsRemoved += removed;

      log(`📝  [${product.name}]`);
      log(`    Before: ${pluralise(original.length, "image")}`);
      log(`    After : ${pluralise(cleaned.length, "image")}`);
      log(`    Removed: ${removed}`);

      // Show which URLs were dropped
      const cleanedSet = new Set(cleaned.map(normaliseUrl));
      original
        .filter((u) => !cleanedSet.has(normaliseUrl(u)))
        .forEach((u) => log(`      ✂️  ${u}`));

      log("");
      updates.push({ id: product._id, newImages: cleaned });
    }
  }

  if (totalCleaned === 0) {
    log("🎉  No intra-product duplicates found!\n");
  } else {
    log(`\n📊  Summary (intra-product):`);
    log(`    Products cleaned : ${totalCleaned}`);
    log(`    URLs removed     : ${totalUrlsRemoved}\n`);
  }

  // ── Step 2: Cross-product duplicate detection ──────────────────────────────
  log("🔍  Scanning for cross-product duplicate URLs...\n");

  // Map: normalised URL → list of product names that use it
  const urlToProducts = new Map();
  for (const product of products) {
    for (const url of (product.images || [])) {
      const key = normaliseUrl(url);
      if (!key) continue;
      if (!urlToProducts.has(key)) urlToProducts.set(key, []);
      urlToProducts.get(key).push(product.name);
    }
  }

  let crossDupCount = 0;
  for (const [url, names] of urlToProducts.entries()) {
    if (names.length > 1) {
      crossDupCount++;
      log(`⚠️   Shared URL detected:`);
      log(`    URL      : ${url}`);
      log(`    Products : ${names.join(", ")}`);
      log("");
    }
  }

  if (crossDupCount === 0) {
    log("🎉  No cross-product duplicate URLs found!\n");
  } else {
    log(
      `\n⚠️   ${pluralise(crossDupCount, "URL")} shared across multiple products.\n` +
      `    These were NOT auto-removed (may be intentional for variants).\n` +
      `    Review the list above and manually resolve if needed.\n`
    );
  }

  // ── Step 3: Write changes ──────────────────────────────────────────────────
  if (!IS_DRY_RUN && updates.length > 0) {
    log(`\n💾  Writing ${pluralise(updates.length, "update")} to MongoDB...`);

    const bulkOps = updates.map(({ id, newImages }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { images: newImages } },
      },
    }));

    const result = await Product.bulkWrite(bulkOps);
    log(`✅  ${pluralise(result.modifiedCount, "product")} updated.`);
  } else if (IS_DRY_RUN && updates.length > 0) {
    log(`\n⏭️   DRY RUN — no changes written. Run without --dry-run to apply.`);
  }

  await mongoose.disconnect();
  log("\n🔌  Disconnected. Done.\n");
}

run().catch((err) => {
  console.error("💥 Script error:", err);
  process.exit(1);
});
