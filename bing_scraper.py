#!/usr/bin/env python3
"""
bing_scraper.py — Production-grade Selenium Bing Image scraper for DRIP STORE.

Scrapes HD, relevant, non-repeating product images from Bing Images and
updates client/public/products.json with the results.

Architecture:
  1. Reads products.json to extract all 500 products grouped by subcategory.
  2. For each subcategory, builds optimized search queries.
  3. Uses headless Chrome (Selenium) to scrape high-res image URLs from Bing.
  4. Applies 3-layer deduplication (URL hash, content hash, perceptual hash).
  5. Validates image quality (min 800×800, no banners, no stock domains).
  6. Assigns unique images to each product and saves the updated products.json.

Usage:
  python3 bing_scraper.py

Dependencies:
  pip3 install selenium webdriver-manager imagehash Pillow requests
"""

import json
import re
import os
import sys
import time
import random
import hashlib
import logging
from io import BytesIO
from urllib.parse import urlparse, urlencode
from collections import defaultdict
from datetime import datetime

import requests
import imagehash
from PIL import Image
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# ─── Configuration ───────────────────────────────────────────────────────────

PRODUCTS_JSON = os.path.join(os.path.dirname(__file__), "client", "public", "products.json")
IMAGES_PER_PRODUCT = 1          # How many images to assign per product
IMAGES_TO_SCRAPE = 50           # How many candidates to scrape per subcategory search
MIN_WIDTH = 800
MIN_HEIGHT = 800
MAX_ASPECT_RATIO = 3.0          # Reject banners with ratio > 3:1
MIN_FILE_SIZE = 5 * 1024        # 5KB minimum
PHASH_DISTANCE_THRESHOLD = 8    # Minimum Hamming distance for perceptual dedup
REQUEST_TIMEOUT = 12            # Seconds for image download timeout
SCROLL_PAUSE = 1.5              # Seconds between scrolls
MAX_SCROLL_ATTEMPTS = 8         # How many scroll attempts per search

# User agent for stealth
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
)

# Blocked stock photo domains
BLOCKED_DOMAINS = frozenset([
    "pinterest.com", "pinimg.com", "tumblr.com",
    "shutterstock.com", "istockphoto.com", "gettyimages.com",
    "alamy.com", "123rf.com", "dreamstime.com", "depositphotos.com",
    "vectorstock.com", "bigstockphoto.com", "photobucket.com",
    "flickr.com", "staticflickr.com",
])

# ─── Logging ─────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("bing_scraper")

# ─── Global Deduplication State ──────────────────────────────────────────────

USED_URL_HASHES: set[str] = set()           # SHA-256 of canonical URL
CONTENT_HASH_REGISTRY: list[imagehash.ImageHash] = []  # Perceptual hashes


def canonical_url(url: str) -> str:
    """Normalize a URL by stripping query params for dedup purposes."""
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}{parsed.path}"


def url_hash(url: str) -> str:
    """SHA-256 hash of the canonical URL."""
    return hashlib.sha256(canonical_url(url).encode()).hexdigest()


def is_url_duplicate(url: str) -> bool:
    """Check if this URL (canonicalized) has been used before."""
    h = url_hash(url)
    if h in USED_URL_HASHES:
        return True
    return False


def register_url(url: str) -> None:
    """Mark a URL as used globally."""
    USED_URL_HASHES.add(url_hash(url))


def is_domain_blocked(url: str) -> bool:
    """Check if the URL belongs to a blocked stock-photo domain."""
    try:
        host = urlparse(url).netloc.lower()
        for blocked in BLOCKED_DOMAINS:
            if blocked in host:
                return True
    except Exception:
        return True
    return False


def is_perceptually_duplicate(phash: imagehash.ImageHash) -> bool:
    """Check if the perceptual hash is too close to any previously seen image."""
    for existing in CONTENT_HASH_REGISTRY:
        if abs(phash - existing) < PHASH_DISTANCE_THRESHOLD:
            return True
    return False


def register_phash(phash: imagehash.ImageHash) -> None:
    """Store a perceptual hash in the global registry."""
    CONTENT_HASH_REGISTRY.append(phash)


# ─── Image Validation ───────────────────────────────────────────────────────

def validate_image(url: str) -> bool:
    """
    Download an image in memory and validate:
      - Dimensions >= 800×800
      - Aspect ratio not extreme (banner)
      - File size >= 5KB
      - Perceptual hash not duplicate
    Returns True if image passes all checks.
    """
    try:
        headers = {"User-Agent": USER_AGENT}
        resp = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT, stream=False)
        if resp.status_code != 200:
            return False

        data = resp.content
        if len(data) < MIN_FILE_SIZE:
            log.debug(f"  Rejected (too small: {len(data)} bytes): {url[:60]}")
            return False

        img = Image.open(BytesIO(data))
        w, h = img.size

        if w < MIN_WIDTH or h < MIN_HEIGHT:
            log.debug(f"  Rejected (dims {w}×{h}): {url[:60]}")
            img.close()
            return False

        ratio = max(w, h) / max(min(w, h), 1)
        if ratio > MAX_ASPECT_RATIO:
            log.debug(f"  Rejected (aspect {ratio:.1f}): {url[:60]}")
            img.close()
            return False

        # Perceptual hash deduplication
        phash = imagehash.phash(img)
        img.close()

        if is_perceptually_duplicate(phash):
            log.debug(f"  Rejected (perceptual dup): {url[:60]}")
            return False

        # All passed — register
        register_phash(phash)
        register_url(url)
        return True

    except Exception as e:
        log.debug(f"  Validation failed for {url[:60]}: {e}")
        return False


# ─── Selenium WebDriver Setup ───────────────────────────────────────────────

def create_driver() -> webdriver.Chrome:
    """Create a headless Chrome driver with anti-detection flags."""
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--disable-blink-features=AutomationControlled")
    opts.add_argument(f"--user-agent={USER_AGENT}")
    opts.add_argument("--window-size=1920,1080")
    opts.add_experimental_option("excludeSwitches", ["enable-automation"])
    opts.add_experimental_option("useAutomationExtension", False)

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=opts)

    # Remove webdriver flag from navigator
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    })

    driver.set_page_load_timeout(30)
    return driver


# ─── Bing Image Scraping ────────────────────────────────────────────────────

def build_search_query(product_name: str, subcategory: str, category: str) -> str:
    """Build an optimized Bing Images search query for fashion relevance."""
    base = f"{product_name} {subcategory} product photo"
    negatives = "-pinterest -stock -collage -wallpaper -meme -unsplash -cartoon -drawing -clipart"
    return f"{base} {negatives}"


def scrape_bing_images(driver: webdriver.Chrome, query: str, max_images: int = 50) -> list[str]:
    """
    Scrape image URLs from Bing Images for a given search query.
    Returns a list of full-resolution image URLs.
    """
    urls = []
    seen_in_search = set()

    try:
        # Navigate to Bing Images
        search_url = f"https://www.bing.com/images/search?q={requests.utils.quote(query)}&qft=+filterui:imagesize-large&form=IRFLTR"
        driver.get(search_url)
        time.sleep(random.uniform(2.0, 3.0))

        # Scroll to load more results
        for scroll_i in range(MAX_SCROLL_ATTEMPTS):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(random.uniform(SCROLL_PAUSE, SCROLL_PAUSE + 1.0))

            # Try clicking "See more images" button if it exists
            try:
                see_more = driver.find_elements(By.CSS_SELECTOR, "a.btn_seemore, input[value='See more images']")
                if see_more:
                    see_more[0].click()
                    time.sleep(random.uniform(1.0, 2.0))
            except Exception:
                pass

        # Extract image URLs from the page
        # Method 1: Parse 'a' tags with 'm' attribute containing JSON
        link_elements = driver.find_elements(By.CSS_SELECTOR, "a.iusc")
        for elem in link_elements:
            if len(urls) >= max_images:
                break
            try:
                m_attr = elem.get_attribute("m")
                if m_attr:
                    m_data = json.loads(m_attr)
                    murl = m_data.get("murl", "")
                    if murl and murl.startswith("http"):
                        can = canonical_url(murl)
                        if can not in seen_in_search:
                            seen_in_search.add(can)
                            urls.append(murl)
            except (json.JSONDecodeError, Exception):
                continue

        # Method 2: Fallback — parse img.mimg tags
        if len(urls) < max_images:
            img_elements = driver.find_elements(By.CSS_SELECTOR, "img.mimg")
            for img_elem in img_elements:
                if len(urls) >= max_images:
                    break
                try:
                    src = img_elem.get_attribute("src") or ""
                    data_src = img_elem.get_attribute("data-src") or ""
                    # Prefer data-src (usually higher res)
                    url = data_src if data_src.startswith("http") else src
                    if url and url.startswith("http") and "th?id=" not in url:
                        can = canonical_url(url)
                        if can not in seen_in_search:
                            seen_in_search.add(can)
                            urls.append(url)
                except Exception:
                    continue

        # Method 3: Also try .imgpt containers
        if len(urls) < max_images:
            containers = driver.find_elements(By.CSS_SELECTOR, ".imgpt a")
            for container in containers:
                if len(urls) >= max_images:
                    break
                try:
                    href = container.get_attribute("href") or ""
                    m_attr = container.get_attribute("m")
                    if m_attr:
                        m_data = json.loads(m_attr)
                        murl = m_data.get("murl", "")
                        if murl and murl.startswith("http"):
                            can = canonical_url(murl)
                            if can not in seen_in_search:
                                seen_in_search.add(can)
                                urls.append(murl)
                except Exception:
                    continue

    except Exception as e:
        log.error(f"Bing scrape error for query '{query[:40]}': {e}")

    return urls


def scrape_for_subcategory(
    driver: webdriver.Chrome,
    products: list[dict],
    category: str,
    subcategory: str,
) -> dict[int, list[str]]:
    """
    Scrape images for all products in a given subcategory.
    Returns a dict mapping product_id -> list of validated image URLs.
    """
    result: dict[int, list[str]] = {}
    needed = len(products) * IMAGES_PER_PRODUCT

    log.info(f"  Scraping for [{category}/{subcategory}] — {len(products)} products, need {needed} images")

    # Collect validated image URLs — try multiple search queries
    validated_urls: list[str] = []

    # Strategy 1: Subcategory-level search
    query1 = build_search_query(subcategory, category, category)
    raw_urls = scrape_bing_images(driver, query1, max_images=IMAGES_TO_SCRAPE)
    log.info(f"    Search 1 returned {len(raw_urls)} raw URLs")

    for url in raw_urls:
        if len(validated_urls) >= needed:
            break
        if is_url_duplicate(url):
            continue
        if is_domain_blocked(url):
            continue
        if validate_image(url):
            validated_urls.append(url)
            log.info(f"    ✓ Validated [{len(validated_urls)}/{needed}]")

    # Strategy 2: If we don't have enough, try more specific queries
    if len(validated_urls) < needed:
        # Group products into batches and search by product name
        remaining_products = [p for p in products if p["id"] not in result or not result[p["id"]]]
        for batch_start in range(0, len(remaining_products), 5):
            if len(validated_urls) >= needed:
                break
            batch = remaining_products[batch_start:batch_start + 5]
            # Pick first product name as representative
            rep_name = batch[0]["name"]
            query2 = build_search_query(rep_name, subcategory, category)
            raw_urls2 = scrape_bing_images(driver, query2, max_images=20)
            log.info(f"    Search 2 ({rep_name[:25]}) returned {len(raw_urls2)} raw URLs")

            for url in raw_urls2:
                if len(validated_urls) >= needed:
                    break
                if is_url_duplicate(url):
                    continue
                if is_domain_blocked(url):
                    continue
                if validate_image(url):
                    validated_urls.append(url)
                    log.info(f"    ✓ Validated [{len(validated_urls)}/{needed}]")

            time.sleep(random.uniform(1.0, 2.0))

    # Assign images to products
    url_index = 0
    for product in products:
        assigned = []
        for _ in range(IMAGES_PER_PRODUCT):
            if url_index < len(validated_urls):
                assigned.append(validated_urls[url_index])
                url_index += 1
        result[product["id"]] = assigned

    log.info(f"  ✅ [{category}/{subcategory}] assigned {url_index}/{needed} images to {len(products)} products")
    return result


# ─── Main Pipeline ───────────────────────────────────────────────────────────

def main():
    """Main entry point — orchestrates the full scraping and update pipeline."""
    start_time = time.time()

    # ── Load products.json ────────────────────────────────────────────────
    log.info(f"Loading products from: {PRODUCTS_JSON}")
    if not os.path.exists(PRODUCTS_JSON):
        log.error(f"products.json not found at {PRODUCTS_JSON}")
        sys.exit(1)

    with open(PRODUCTS_JSON) as f:
        products = json.load(f)

    log.info(f"Loaded {len(products)} products")

    # ── Group products by subcategory ─────────────────────────────────────
    subcategory_groups: dict[str, list[dict]] = defaultdict(list)
    for p in products:
        key = f"{p.get('category', 'Unknown')}/{p.get('subcategory', 'General')}"
        subcategory_groups[key].append(p)

    log.info(f"Found {len(subcategory_groups)} subcategories:")
    for key, prods in sorted(subcategory_groups.items()):
        log.info(f"  {key}: {len(prods)} products")

    # ── Initialize Selenium ───────────────────────────────────────────────
    log.info("Launching headless Chrome...")
    driver = create_driver()

    try:
        # ── Scrape images for each subcategory ────────────────────────────
        all_assignments: dict[int, list[str]] = {}
        total_subcats = len(subcategory_groups)

        for idx, (subcat_key, subcat_products) in enumerate(sorted(subcategory_groups.items()), 1):
            category, subcategory = subcat_key.split("/", 1)
            
            # Skip if already scraped (no unsplash.com images left)
            needs_scraping = any(
                p.get("images") and "unsplash.com" in p["images"][0] 
                for p in subcat_products
            )
            if not needs_scraping:
                log.info(f"[{idx}/{total_subcats}] Skipping {subcat_key} (already scraped)")
                for p in subcat_products:
                    all_assignments[p["id"]] = p.get("images", [])
                continue
            
            log.info(f"\n{'='*60}")
            log.info(f"[{idx}/{total_subcats}] Processing: {subcat_key}")
            log.info(f"{'='*60}")

            try:
                assignments = scrape_for_subcategory(driver, subcat_products, category, subcategory)
                all_assignments.update(assignments)
            except Exception as e:
                log.error(f"Failed to scrape {subcat_key}: {e}")
                # Keep old images for this subcategory
                for p in subcat_products:
                    all_assignments[p["id"]] = p.get("images", [])

            # Anti-detection delay between subcategories
            time.sleep(random.uniform(2.0, 4.0))

    finally:
        log.info("Shutting down Chrome...")
        driver.quit()

    # ── Update products.json ──────────────────────────────────────────────
    updated_count = 0
    kept_count = 0
    for p in products:
        pid = p["id"]
        if pid in all_assignments and all_assignments[pid]:
            p["images"] = all_assignments[pid]
            updated_count += 1
        else:
            # Keep existing image if scraping failed
            kept_count += 1

    # ── Create backup and save ────────────────────────────────────────────
    backup_path = PRODUCTS_JSON + f".backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    import shutil
    shutil.copy2(PRODUCTS_JSON, backup_path)
    log.info(f"Backup saved: {backup_path}")

    with open(PRODUCTS_JSON, "w") as f:
        json.dump(products, f, indent=2)

    # ── Final Report ──────────────────────────────────────────────────────
    elapsed = time.time() - start_time
    log.info(f"\n{'='*60}")
    log.info(f"SCRAPING COMPLETE")
    log.info(f"{'='*60}")
    log.info(f"Total products:      {len(products)}")
    log.info(f"Images updated:      {updated_count}")
    log.info(f"Images kept (old):   {kept_count}")
    log.info(f"Global unique URLs:  {len(USED_URL_HASHES)}")
    log.info(f"Perceptual hashes:   {len(CONTENT_HASH_REGISTRY)}")
    log.info(f"Time elapsed:        {elapsed:.1f}s ({elapsed/60:.1f}min)")
    log.info(f"Output: {PRODUCTS_JSON}")

    # ── Validation check ──────────────────────────────────────────────────
    all_urls = [p["images"][0] for p in products if p.get("images")]
    unique_urls = set(all_urls)
    log.info(f"\nValidation:")
    log.info(f"  Products with images: {len(all_urls)}/{len(products)}")
    log.info(f"  Unique URLs:          {len(unique_urls)}")
    dupes = len(all_urls) - len(unique_urls)
    if dupes:
        log.warning(f"  ⚠ Duplicate URLs found: {dupes}")
    else:
        log.info(f"  ✅ Zero URL duplicates!")


if __name__ == "__main__":
    main()
