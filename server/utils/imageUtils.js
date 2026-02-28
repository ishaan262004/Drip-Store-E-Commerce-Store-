/**
 * imageUtils.js
 * =============
 * Shared utilities for image URL validation and deduplication.
 * Used by the Product model (pre-save hook) and product controller.
 */

const PLACEHOLDER_PATTERNS = [
  "placeholder.com",
  "via.placeholder",
  "dummyimage.com",
  "picsum.photos",
  "loremflickr.com",
  "fakeimg.pl",
  "placeimg.com",
  "1521572163474", // Unsplash white t-shirt — confirmed generic placeholder
];

/**
 * Normalise a URL for deduplication comparison.
 * Strips trailing slashes, lowercases the host, and removes common tracking params.
 *
 * @param {string} url
 * @returns {string}
 */
function normaliseUrl(url) {
  if (typeof url !== "string") return "";
  try {
    const u = new URL(url.trim());
    // Remove common cache-busting / tracking query params
    ["cb", "ts", "t", "_", "v", "utm_source", "utm_medium"].forEach((p) =>
      u.searchParams.delete(p)
    );
    return u.toString().toLowerCase().replace(/\/$/, "");
  } catch {
    return url.trim().toLowerCase();
  }
}

/**
 * Check if a URL is a known placeholder / generic image.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isPlaceholder(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

/**
 * Check if a URL is a base64 data URI.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isBase64(url) {
  return typeof url === "string" && url.startsWith("data:");
}

/**
 * Returns true if the URL looks like a valid remote image URL.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isValidImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (isBase64(trimmed)) return false;
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://"))
    return false;
  if (isPlaceholder(trimmed)) return false;
  return true;
}

/**
 * Remove duplicate image URLs from an array.
 * Comparison is case-insensitive and normalised (strips tracking params).
 * Invalid URLs (base64, placeholders, non-http) are also removed.
 *
 * @param {string[]} images - Raw images array from a product document.
 * @returns {string[]}      - Cleaned array with unique, valid URLs only.
 */
function dedupeImages(images) {
  if (!Array.isArray(images)) return [];

  const seen = new Set();
  const result = [];

  for (const url of images) {
    if (!isValidImageUrl(url)) continue;

    const key = normaliseUrl(url);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(url.trim());
    }
  }

  return result;
}

module.exports = { dedupeImages, isValidImageUrl, isPlaceholder, normaliseUrl };
