#!/usr/bin/env python3
"""
Cloudinary Image Migration Script for DRIP STORE
=================================================
Uploads ALL website images to Cloudinary and updates products.json
and outputs a mapping for the remaining component updates.

Usage:
    python3 cloudinary_upload.py
"""

import cloudinary
import cloudinary.uploader
import cloudinary.api
import json
import os
import sys
import time
import logging
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# ─── Config ──────────────────────────────────────────────────────────────────
CLOUD_NAME = "dzewuyhhx"
API_KEY = "652796586467642"
API_SECRET = "7eHFtH80ttUnD6svLzI2pOCumv0"

PROJECT_ROOT = Path(__file__).resolve().parent
CLIENT_PUBLIC = PROJECT_ROOT / "client" / "public"
PRODUCTS_JSON = CLIENT_PUBLIC / "products.json"

# Cloudinary folder structure
FOLDER_PRODUCTS = "drip-store/products"
FOLDER_HERO = "drip-store/hero"
FOLDER_CATEGORIES = "drip-store/categories"
FOLDER_MISC = "drip-store/misc"

# Number of parallel upload threads
MAX_WORKERS = 10

# ─── Logging ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ─── Initialize Cloudinary ───────────────────────────────────────────────────
cloudinary.config(
    cloud_name=CLOUD_NAME,
    api_key=API_KEY,
    api_secret=API_SECRET,
    secure=True,
)


# ─── Helper Functions ────────────────────────────────────────────────────────

def upload_url(url: str, folder: str, public_id: str, retries: int = 3) -> str | None:
    """Upload a remote URL to Cloudinary. Returns the secure URL or None."""
    for attempt in range(retries):
        try:
            result = cloudinary.uploader.upload(
                url,
                folder=folder,
                public_id=public_id,
                overwrite=True,
                resource_type="image",
                timeout=30,
            )
            return result["secure_url"]
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                log.error(f"  ✗ Failed to upload {public_id}: {e}")
                return None


def upload_local(file_path: str, folder: str, public_id: str, retries: int = 3) -> str | None:
    """Upload a local file to Cloudinary. Returns the secure URL or None."""
    for attempt in range(retries):
        try:
            result = cloudinary.uploader.upload(
                file_path,
                folder=folder,
                public_id=public_id,
                overwrite=True,
                resource_type="image",
                timeout=60,
            )
            return result["secure_url"]
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                log.error(f"  ✗ Failed to upload {public_id}: {e}")
                return None


def cloudinary_grayscale_url(base_url: str) -> str:
    """Insert e_grayscale transformation into a Cloudinary URL.
    
    Cloudinary URLs are: https://res.cloudinary.com/<cloud>/image/upload/<path>
    We insert e_grayscale after 'upload/':
    https://res.cloudinary.com/<cloud>/image/upload/e_grayscale/<path>
    """
    return base_url.replace("/image/upload/", "/image/upload/e_grayscale/")


# ─── Step 1: Upload Product Images ──────────────────────────────────────────

def upload_products():
    """Upload all product images and update products.json."""
    log.info("Loading products.json...")
    with open(PRODUCTS_JSON) as f:
        products = json.load(f)

    log.info(f"Found {len(products)} products")

    # Build upload tasks: (index, product_id, url)
    tasks = []
    for i, p in enumerate(products):
        images = p.get("images", [])
        if images and images[0]:
            url = images[0]
            pid = p.get("id", i)
            tasks.append((i, pid, url))

    log.info(f"Queued {len(tasks)} product images for upload")

    # Upload in parallel
    success = 0
    failed = 0
    results = {}  # index -> cloudinary_url

    def _upload_one(task):
        idx, pid, url = task
        public_id = f"product_{pid}"
        cloud_url = upload_url(url, FOLDER_PRODUCTS, public_id)
        return idx, cloud_url

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(_upload_one, t): t for t in tasks}
        for i, future in enumerate(as_completed(futures), 1):
            idx, cloud_url = future.result()
            if cloud_url:
                # Apply grayscale transform
                results[idx] = cloudinary_grayscale_url(cloud_url)
                success += 1
            else:
                failed += 1
            if i % 25 == 0 or i == len(tasks):
                log.info(f"  Products: {i}/{len(tasks)} uploaded ({success} ok, {failed} fail)")

    # Update products.json
    for idx, cloud_url in results.items():
        products[idx]["images"] = [cloud_url]

    # Backup and save
    backup_path = str(PRODUCTS_JSON) + ".backup_cloudinary"
    with open(backup_path, "w") as f:
        json.dump(json.load(open(PRODUCTS_JSON)), f, indent=2)
    log.info(f"Backup saved: {backup_path}")

    with open(PRODUCTS_JSON, "w") as f:
        json.dump(products, f, indent=2)
    log.info(f"Updated products.json with {success} Cloudinary URLs")

    return success, failed


# ─── Step 2: Upload Hero Slides ─────────────────────────────────────────────

def upload_hero_slides():
    """Upload 5 hero slide PNGs to Cloudinary."""
    log.info("\nUploading hero slides...")
    mapping = {}

    for i in range(1, 6):
        filename = f"hero-slide-{i}.png"
        file_path = str(CLIENT_PUBLIC / filename)
        if not os.path.exists(file_path):
            log.warning(f"  Hero file not found: {file_path}")
            continue

        public_id = f"hero-slide-{i}"
        cloud_url = upload_local(file_path, FOLDER_HERO, public_id)
        if cloud_url:
            mapping[f"/{filename}"] = cloud_url
            log.info(f"  ✓ {filename} → Cloudinary")
        else:
            log.error(f"  ✗ {filename} failed")

    return mapping


# ─── Step 3: Upload Category Images ─────────────────────────────────────────

def upload_category_images():
    """Upload the 4 category images from Home.jsx"""
    log.info("\nUploading category images...")
    category_images = {
        "men": "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&h=500&fit=crop&sat=-100",
        "women": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop&sat=-100",
        "accessories": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=500&fit=crop&sat=-100",
        "new-arrivals": "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=500&fit=crop&sat=-100",
    }

    mapping = {}
    for name, url in category_images.items():
        cloud_url = upload_url(url, FOLDER_CATEGORIES, name)
        if cloud_url:
            mapping[url] = cloudinary_grayscale_url(cloud_url)
            log.info(f"  ✓ {name} → Cloudinary")
        else:
            log.error(f"  ✗ {name} failed")

    return mapping


# ─── Step 4: Upload Placeholder & Logo ───────────────────────────────────────

def upload_misc():
    """Upload the luxury placeholder image and the logo."""
    log.info("\nUploading misc assets...")
    mapping = {}

    # Placeholder
    placeholder_url = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=1000&fit=crop&q=80"
    cloud_url = upload_url(placeholder_url, FOLDER_MISC, "luxury-placeholder")
    if cloud_url:
        mapping["placeholder"] = cloudinary_grayscale_url(cloud_url)
        log.info(f"  ✓ luxury-placeholder → Cloudinary")

    # Logo
    logo_path = str(CLIENT_PUBLIC / "drip-logo.png")
    if os.path.exists(logo_path):
        cloud_url = upload_local(logo_path, FOLDER_MISC, "drip-logo")
        if cloud_url:
            mapping["logo"] = cloud_url
            log.info(f"  ✓ drip-logo → Cloudinary")

    return mapping


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    log.info("=" * 60)
    log.info("DRIP STORE — Cloudinary Image Migration")
    log.info("=" * 60)
    log.info(f"Cloud: {CLOUD_NAME}")
    log.info(f"Products JSON: {PRODUCTS_JSON}")
    log.info("")

    # Test connection
    try:
        cloudinary.api.ping()
        log.info("✓ Cloudinary connection OK\n")
    except Exception as e:
        log.error(f"✗ Cloudinary connection failed: {e}")
        sys.exit(1)

    start = time.time()

    # Step 1: Products
    prod_ok, prod_fail = upload_products()

    # Step 2: Hero slides
    hero_map = upload_hero_slides()

    # Step 3: Category images
    cat_map = upload_category_images()

    # Step 4: Misc
    misc_map = upload_misc()

    elapsed = time.time() - start

    # Output summary
    log.info(f"\n{'=' * 60}")
    log.info("MIGRATION COMPLETE")
    log.info(f"{'=' * 60}")
    log.info(f"Products:   {prod_ok} uploaded, {prod_fail} failed")
    log.info(f"Hero:       {len(hero_map)} uploaded")
    log.info(f"Categories: {len(cat_map)} uploaded")
    log.info(f"Misc:       {len(misc_map)} uploaded")
    log.info(f"Time:       {elapsed:.1f}s ({elapsed / 60:.1f}min)")

    # Save mapping file for component updates
    all_mappings = {
        "hero": hero_map,
        "categories": cat_map,
        "misc": misc_map,
    }
    mapping_path = PROJECT_ROOT / "cloudinary_mapping.json"
    with open(mapping_path, "w") as f:
        json.dump(all_mappings, f, indent=2)
    log.info(f"\nMapping file saved: {mapping_path}")
    log.info("Use this file to update HeroBanner.jsx, Home.jsx, and placeholder URLs.")


if __name__ == "__main__":
    main()
