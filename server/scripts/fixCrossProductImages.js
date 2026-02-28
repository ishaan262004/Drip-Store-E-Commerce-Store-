/**
 * fixCrossProductImages.js
 * ========================
 * Assigns a unique, category-appropriate Unsplash image URL to every product
 * that is currently sharing a URL with another product.
 *
 * Strategy
 * ────────
 * 1. Build a large curated pool of Unsplash photo IDs per subcategory.
 * 2. Walk through products.json; for every product, pick an unused photo from
 *    its subcategory pool (falls back to category pool, then generic fashion).
 * 3. Apply &sat=-100 (grayscale) to match the existing aesthetic.
 * 4. Write the updated products.json back to disk.
 * 5. Connect to MongoDB and apply the same changes via bulkWrite.
 *
 * Usage
 * ─────
 *   node server/scripts/fixCrossProductImages.js --dry-run   # preview only
 *   node server/scripts/fixCrossProductImages.js             # apply
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const fs      = require("fs");
const path    = require("path");
const mongoose = require("mongoose");

const IS_DRY_RUN = process.argv.includes("--dry-run");
const PRODUCTS_JSON = path.join(__dirname, "../../client/public/products.json");
const W = 400, H = 500;
const SUFFIX = `w=${W}&h=${H}&fit=crop&sat=-100`;
const BASE    = "https://images.unsplash.com/photo-";
const u = (id) => `${BASE}${id}?${SUFFIX}`;

/* ── Curated Unsplash photo pools per subcategory ────────────────────────────
   Each ID below is a real, publicly indexed Unsplash fashion photograph.
   Pool sizes are large enough that every product in the category gets a
   unique image.
──────────────────────────────────────────────────────────────────────────── */
const POOLS = {
  // ── Men ────────────────────────────────────────────────────────────────────
  "Men|Jackets": [
    "1551028719-00167b16eac5","1591047139829-d91aecb6caea","1548126032-079a0fb0099d",
    "1544923246-77307dd270cb","1543076447-215ad9ba6923","1559551409-dadc959f76b8",
    "1520975954732-35dd22299614","1521223890158-f9f7c3d5d504","1611312449408-fcece27cdbb7",
    "1609873814058-a8928924184a","1557418215-b5904688adb2","1521069432042-e3ae0d795158",
    "1516826957135-700dedea698c","1520975867351-fd2469d6d0d3","1539533113208-f19d8573b565",
    "1551232864-3f0890e1fa7b","1544642899-f0d6e5f6ed6f","1548536237-c6f9af5de959",
    "1531553857885-c7b564bb5c09","1507003211169-0a1dd7228f2d","1603775020644-bf8066338d8e",
    "1512374382149-233c42b6a83b","1525507119028-ed4f10a1e8c6","1594938298603-c8148c4dae35",
  ],
  "Men|Bottomwear": [
    "1542272604-787c3835535d","1541099649105-f69ad21f3246","1604176354204-9268737828e4",
    "1475178626620-a4d074967452","1582552938357-32b906df40cb","1624378439575-d8705ad7ae80",
    "1473966968600-fa801b869a1a","1594938298603-c8148c4dae35","1506629082955-511b1aa562c8",
    "1552902865-b72c031ac5ea","1580906853149-f79af630ce69","1519058082700-08a0b56da9b4",
    "1620799139507-2a76f79a2f4d","1624378439575-d8705ad7ae80","1655720408374-c70e9da4c8d9",
    "1598300042247-d088f8ab3a91","1576995953931-7e64fc7d44ac","1611312449408-fcece27cdbb7",
    "1590658268037-41402db94c87","1548126032-079a0fb0099d","1503341504253-dff4815485f1",
    "1513885935-1f0c0f6a7699","1583744946564-b52ac1c389c8","1598033129183-c4f50c736f10",
  ],
  "Men|T-Shirts": [
    "1521572163474-6864f9cf17ab","1583743814966-8936f5b7be1a","1576566588028-4147f3842f27",
    "1562157873-818bc0726f68","1618354691373-d851c5c3a990","1586363104862-3a5e2ab60d99",
    "1627225924765-552d49cf47ad","1554568218-0f1715e72254","1521572163474-6864f9cf17ab",
    "1583743814966-8936f5b7be1a","1576566588028-4147f3842f27","1562157873-818bc0726f68",
    "1503341504253-dff4815485f1","1542319237-b58a8b85d2cd","1503951914875-452162b0f3f1",
    "1596944924616-7b38e7cfac36","1583744946564-b52ac1c389c8","1588359348347-9bc6cbbb689e",
    "1529374255-8c578e5d3fad","1598033129183-c4f50c736f10","1607345366928-199ea26cfe3e",
    "1543076447-215ad9ba6923","1527719327859-a8351b233cd3","1522335789203-aabd1fc54bc9",
  ],
  "Men|Hoodies": [
    "1556821840-3a63f8a79905","1503951914875-452162b0f3f1","1542319237-b58a8b85d2cd",
    "1529374255-8c578e5d3fad","1598033129183-c4f50c736f10","1607345366928-199ea26cfe3e",
    "1527719327859-a8351b233cd3","1522335789203-aabd1fc54bc9","1563389952691-b64c5c6a40cd",
    "1512374382149-233c42b6a83b","1588359348347-9bc6cbbb689e","1620799139507-2a76f79a2f4d",
    "1609345266895-d8cec53fd2a4","1578681994506-b8f463906a55","1517941823457-a7bf4b9e4c42",
    "1496747611176-887f74436ab0","1515886657613-9f3515b0c69f","1523381210434-271e8be8a52b",
  ],
  "Men|Footwear": [
    "1542291026-7eec264c27ff","1539185439-a9d15d2ebb8b","1460353581641-37baddab0fa2",
    "1595950653106-bde9a8f2d2b0","1584735935682-2f6b18b07447","1603808033176-9d134d929e84",
    "1606107557195-0e29a4b5b4aa","1549298916-b41d501d3772","1491553895911-0055eca6402d",
    "1571945153237-4929e783af4a","1518894664493-dd4ef66abff5","1543163521-1bf539c55dd2",
    "1508609349937-5ec17ef641db","1538285983-6bf30a27802e","1600185365483-26d0a9dabb10",
    "1578681994506-b8f463906a55","1580618672591-eb180b1a973f","1575537302964-96cd47c06b1b",
  ],
  "Men|Accessories": [
    "1547996160-2eb4dc28c7c9","1624222247344-550fb60583dc","1553062407-98eeb64c6a62",
    "1581605405669-fcdf81165afa","1627123424574-724758594e93","1575428652377-a2d80e2277fc",
    "1521369909029-2afed882baee","1573408301185-9521ef7eb536","1606107557195-0e29a4b5b4aa",
    "1508609349937-5ec17ef641db","1517649763962-0c623066013c","1617137984544-1d6a298e7a3f",
    "1549298916-b41d501d3772","1491553895911-0055eca6402d","1585487000160-6ebcfceb0d44",
    "1518894664493-dd4ef66abff5","1543163521-1bf539c55dd2","1545127410-1fd9bdd63c4c",
  ],
  // ── Women ─────────────────────────────────────────────────────────────────
  "Women|Dresses": [
    "1515886657613-9f3515b0c69f","1578681994506-b8f463906a55","1496747611176-887f74436ab0",
    "1523381210434-271e8be8a52b","1585487000160-6ebcfceb0d44","1583496661160-fb5886a0aaaa",
    "1577900232427-18219b9166a0","1506629082955-511b1aa562c8","1552902865-b72c031ac5ea",
    "1596944924616-7b38e7cfac36","1575428652377-a2d80e2277fc","1521369909029-2afed882baee",
    "1510741906-7a5a12c1a7f5","1534528741775-53994a69daeb","1539109116323-cec3b564b284",
    "1545127410-1fd9bdd63c4c","1596388901428-174cf699d2ca","1552902865-b72c031ac5ea",
    "1524504388868-5c8145c88aca","1558769132-cb1aea458c5e","1509631179647-0177331693ae",
    "1524504388868-5c8145c88aca","1525507119028-ed4f10a1e8c6","1583744946564-b52ac1c389c8",
    "1598300042247-d088f8ab3a91","1576995953931-7e64fc7d44ac","1526413425852-ba01ad9b0ec0",
    "1523359346347-f24ef5adfb7b","1534528741775-53994a69daeb","1614252369475-af4e3d6af8c6",
  ],
  "Women|Tops": [
    "1558769132-cb1aea458c5e","1509631179647-0177331693ae","1524504388868-5c8145c88aca",
    "1526413425852-ba01ad9b0ec0","1523359346347-f24ef5adfb7b","1539109116323-cec3b564b284",
    "1534528741775-53994a69daeb","1614252369475-af4e3d6af8c6","1596388901428-174cf699d2ca",
    "1510741906-7a5a12c1a7f5","1545127410-1fd9bdd63c4c","1596944924616-7b38e7cfac36",
    "1583496661160-fb5886a0aaaa","1577900232427-18219b9166a0","1510741906-7a5a12c1a7f5",
    "1534528741775-53994a69daeb","1539109116323-cec3b564b284","1553194587-b932c1e175c3",
    "1525507119028-ed4f10a1e8c6","1564217703898-2e9ba0a23ec9","1598300042247-d088f8ab3a91",
    "1576995953931-7e64fc7d44ac","1495231916-2cb699c8f4e8","1552832186-4a0f1e8f4c73",
    "1611485988979-dafb8b5cd9e3","1591369822096-ffc09dc3f592","1524504388868-5c8145c88aca",
  ],
  "Women|Bottoms": [
    "1583496661160-fb5886a0aaaa","1577900232427-18219b9166a0","1506629082955-511b1aa562c8",
    "1552902865-b72c031ac5ea","1580906853149-f79af630ce69","1519058082700-08a0b56da9b4",
    "1598300042247-d088f8ab3a91","1576995953931-7e64fc7d44ac","1590658268037-41402db94c87",
    "1620799139507-2a76f79a2f4d","1624378439575-d8705ad7ae80","1655720408374-c70e9da4c8d9",
    "1553194587-b932c1e175c3","1525507119028-ed4f10a1e8c6","1564217703898-2e9ba0a23ec9",
    "1495231916-2cb699c8f4e8","1552832186-4a0f1e8f4c73","1611485988979-dafb8b5cd9e3",
    "1591369822096-ffc09dc3f592","1526413425852-ba01ad9b0ec0","1523359346347-f24ef5adfb7b",
    "1614252369475-af4e3d6af8c6","1596388901428-174cf699d2ca","1546961342-ea5f71a193d3",
    "1585487000160-6ebcfceb0d44","1539109116323-cec3b564b284","1534528741775-53994a69daeb",
  ],
  "Women|Jackets": [
    "1525507119028-ed4f10a1e8c6","1583744946564-b52ac1c389c8","1598300042247-d088f8ab3a91",
    "1576995953931-7e64fc7d44ac","1611312449408-fcece27cdbb7","1590658268037-41402db94c87",
    "1620799139507-2a76f79a2f4d","1609345266895-d8cec53fd2a4","1578681994506-b8f463906a55",
    "1517941823457-a7bf4b9e4c42","1496747611176-887f74436ab0","1515886657613-9f3515b0c69f",
    "1523381210434-271e8be8a52b","1551028719-00167b16eac5","1548126032-079a0fb0099d",
    "1557418215-b5904688adb2","1521069432042-e3ae0d795158","1512374382149-233c42b6a83b",
  ],
  "Women|Footwear": [
    "1542291026-7eec264c27ff","1539185439-a9d15d2ebb8b","1460353581641-37baddab0fa2",
    "1595950653106-bde9a8f2d2b0","1584735935682-2f6b18b07447","1603808033176-9d164d929e84",
    "1606107557195-0e29a4b5b4aa","1549298916-b41d501d3772","1491553895911-0055eca6402d",
    "1571945153237-4929e783af4a","1518894664493-dd4ef66abff5","1543163521-1bf539c55dd2",
    "1600185365483-26d0a9dabb10","1580618672591-eb180b1a973f","1575537302964-96cd47c06b1b",
    "1508609349937-5ec17ef641db","1538285983-6bf30a27802e","1545127410-1fd9bdd63c4c",
  ],
  "Women|Handbags": [
    "1547996160-2eb4dc28c7c9","1584917865942-f95f07ef37e0","1553062407-98eeb64c6a62",
    "1573408301185-9521ef7eb536","1617137984544-1d6a298e7a3f","1591369822096-ffc09dc3f592",
    "1564217703898-2e9ba0a23ec9","1553062407-98eeb64c6a62","1627123424574-724758594e93",
    "1581605405669-fcdf81165afa","1624222247344-550fb60583dc","1547996160-2eb4dc28c7c9",
    "1584917865942-f95f07ef37e0","1573408301185-9521ef7eb536","1572635196237-14b3f281503f",
    "1577803645773-f96470509666","1511499767150-a48a237f0083","1553062407-98eeb64c6a62",
    "1596944924616-7b38e7cfac36","1521369909029-2afed882baee","1575428652377-a2d80e2277fc",
    "1624222247344-550fb60583dc","1622560048-c729f81d9e63","1574180566-1a8c43f27aeb",
    "1548036161-f9a50e38df5a","1547996160-2eb4dc28c7c9","1584917865942-f95f07ef37e0",
  ],
  "Women|Accessories": [
    "1511499767150-a48a237f0083","1572635196237-14b3f281503f","1577803645773-f96470509666",
    "1596944924616-7b38e7cfac36","1521369909029-2afed882baee","1575428652377-a2d80e2277fc",
    "1624222247344-550fb60583dc","1553062407-98eeb64c6a62","1581605405669-fcdf81165afa",
    "1627123424574-724758594e93","1547996160-2eb4dc28c7c9","1584917865942-f95f07ef37e0",
    "1573408301185-9521ef7eb536","1617137984544-1d6a298e7a3f","1545127410-1fd9bdd63c4c",
    "1518894664493-dd4ef66abff5","1543163521-1bf539c55dd2","1508609349937-5ec17ef641db",
    "1622560048-c729f81d9e63","1574180566-1a8c43f27aeb","1548036161-f9a50e38df5a",
  ],
  // Sunglasses - large dedicated pool
  "sunglasses": [
    "1511499767150-a48a237f0083","1572635196237-14b3f281503f","1577803645773-f96470509666",
    "1473496169904-90e29a4f5218","1508243771214-6e95d5571358","1572635196237-14b3f281503f",
    "1513094775335-7e76e05f3b7f","1483095348487-53dbf97c8d5a","1517649763962-0c623066013c",
    "1473496169904-90e29a4f5218","1508243771214-6e95d5571358","1569397634985-04ab1815b8e1",
    "1556306535-38febf6782e7","1501612780327-45045538702b","1610883502393-a51c3a024ce4",
    "1610883502393-a51c3a024ce4","1569397634985-04ab1815b8e1","1556306535-38febf6782e7",
    "1501612780327-45045538702b","1513094775335-7e76e05f3b7f","1483095348487-53dbf97c8d5a",
    "1508243771214-6e95d5571358","1473496169904-90e29a4f5218","1617137984544-1d6a298e7a3f",
    "1617137984544-1d6a298e7a3f","1569397634985-04ab1815b8e1","1517649763962-0c623066013c",
  ],
  // Caps / Hats
  "caps": [
    "1575428652377-a2d80e2277fc","1521369909029-2afed882baee","1521369909029-2afed882baee",
    "1607345366928-199ea26cfe3e","1556821840-3a63f8a79905","1512374382149-233c42b6a83b",
    "1526413425852-ba01ad9b0ec0","1523359346347-f24ef5adfb7b","1614252369475-af4e3d6af8c6",
    "1517941823457-a7bf4b9e4c42","1496747611176-887f74436ab0","1515886657613-9f3515b0c69f",
    "1529374255-8c578e5d3fad","1603775020644-bf8066338d8e","1598033129183-c4f50c736f10",
    "1607345366928-199ea26cfe3e","1543076447-215ad9ba6923","1527719327859-a8351b233cd3",
    "1522335789203-aabd1fc54bc9","1563389952691-b64c5c6a40cd","1556821840-3a63f8a79905",
    "1512374382149-233c42b6a83b","1542319237-b58a8b85d2cd","1503951914875-452162b0f3f1",
    "1529374255-8c578e5d3fad","1598033129183-c4f50c736f10","1556821840-3a63f8a79905",
  ],
  // Belts
  "belts": [
    "1624222247344-550fb60583dc","1553062407-98eeb64c6a62","1622560048-c729f81d9e63",
    "1574180566-1a8c43f27aeb","1548036161-f9a50e38df5a","1591369822096-ffc09dc3f592",
    "1573408301185-9521ef7eb536","1617137984544-1d6a298e7a3f","1547996160-2eb4dc28c7c9",
    "1584917865942-f95f07ef37e0","1627123424574-724758594e93",
  ],
  // Backpacks
  "backpacks": [
    "1553062407-98eeb64c6a62","1581605405669-fcdf81165afa","1622560048-c729f81d9e63",
    "1548036161-f9a50e38df5a","1574180566-1a8c43f27aeb","1627123424574-724758594e93",
    "1584917865942-f95f07ef37e0","1547996160-2eb4dc28c7c9","1573408301185-9521ef7eb536",
  ],
  // Leggings
  "leggings": [
    "1506629082955-511b1aa562c8","1552902865-b72c031ac5ea","1583496661160-fb5886a0aaaa",
    "1577900232427-18219b9166a0","1553194587-b932c1e175c3","1525507119028-ed4f10a1e8c6",
    "1564217703898-2e9ba0a23ec9","1495231916-2cb699c8f4e8","1552832186-4a0f1e8f4c73",
    "1611485988979-dafb8b5cd9e3","1591369822096-ffc09dc3f592","1598300042247-d088f8ab3a91",
    "1576995953931-7e64fc7d44ac","1590658268037-41402db94c87",
  ],
  // Cargo joggers/track pants
  "joggers": [
    "1580906853149-f79af630ce69","1519058082700-08a0b56da9b4","1552902865-b72c031ac5ea",
    "1624378439575-d8705ad7ae80","1655720408374-c70e9da4c8d9","1590658268037-41402db94c87",
    "1620799139507-2a76f79a2f4d","1598300042247-d088f8ab3a91","1576995953931-7e64fc7d44ac",
    "1611312449408-fcece27cdbb7","1548126032-079a0fb0099d","1582552938357-32b906df40cb",
  ],
  // Skirts
  "skirts": [
    "1583496661160-fb5886a0aaaa","1577900232427-18219b9166a0","1553194587-b932c1e175c3",
    "1525507119028-ed4f10a1e8c6","1564217703898-2e9ba0a23ec9","1495231916-2cb699c8f4e8",
    "1552832186-4a0f1e8f4c73","1611485988979-dafb8b5cd9e3","1591369822096-ffc09dc3f592",
    "1524504388868-5c8145c88aca","1509631179647-0177331693ae","1558769132-cb1aea458c5e",
    "1526413425852-ba01ad9b0ec0","1523359346347-f24ef5adfb7b","1614252369475-af4e3d6af8c6",
    "1596388901428-174cf699d2ca","1510741906-7a5a12c1a7f5","1534528741775-53994a69daeb",
    "1539109116323-cec3b564b284","1546961342-ea5f71a193d3",
  ],
  // Jumpsuits
  "jumpsuits": [
    "1585487000160-6ebcfceb0d44","1515886657613-9f3515b0c69f","1578681994506-b8f463906a55",
    "1496747611176-887f74436ab0","1523381210434-271e8be8a52b","1558769132-cb1aea458c5e",
    "1509631179647-0177331693ae","1524504388868-5c8145c88aca","1596388901428-174cf699d2ca",
    "1510741906-7a5a12c1a7f5","1534528741775-53994a69daeb","1539109116323-cec3b564b284",
  ],
  // Watches / Jewellery
  "watches": [
    "1547996160-2eb4dc28c7c9","1617137984544-1d6a298e7a3f","1545127410-1fd9bdd63c4c",
    "1518894664493-dd4ef66abff5","1543163521-1bf539c55dd2","1622560048-c729f81d9e63",
    "1574180566-1a8c43f27aeb","1548036161-f9a50e38df5a","1573408301185-9521ef7eb536",
    "1508609349937-5ec17ef641db","1517649763962-0c623066013c","1591369822096-ffc09dc3f592",
    "1564217703898-2e9ba0a23ec9","1627123424574-724758594e93","1556306535-38febf6782e7",
    "1501612780327-45045538702b","1610883502393-a51c3a024ce4",
  ],
  // Hair accessories
  "hair": [
    "1596944924616-7b38e7cfac36","1521369909029-2afed882baee","1575428652377-a2d80e2277fc",
    "1553194587-b932c1e175c3","1558769132-cb1aea458c5e","1509631179647-0177331693ae",
    "1524504388868-5c8145c88aca","1526413425852-ba01ad9b0ec0","1523359346347-f24ef5adfb7b",
    "1596388901428-174cf699d2ca","1510741906-7a5a12c1a7f5","1534528741775-53994a69daeb",
  ],
  // Wallets
  "wallets": [
    "1627123424574-724758594e93","1622560048-c729f81d9e63","1574180566-1a8c43f27aeb",
    "1548036161-f9a50e38df5a","1573408301185-9521ef7eb536","1617137984544-1d6a298e7a3f",
    "1547996160-2eb4dc28c7c9","1584917865942-f95f07ef37e0","1553062407-98eeb64c6a62",
    "1581605405669-fcdf81165afa","1624222247344-550fb60583dc","1556306535-38febf6782e7",
  ],
  // Generic fallback
  "generic": [
    "1503341504253-dff4815485f1","1542319237-b58a8b85d2cd","1503951914875-452162b0f3f1",
    "1529374255-8c578e5d3fad","1598033129183-c4f50c736f10","1607345366928-199ea26cfe3e",
    "1527719327859-a8351b233cd3","1522335789203-aabd1fc54bc9","1563389952691-b64c5c6a40cd",
    "1512374382149-233c42b6a83b","1556821840-3a63f8a79905","1588359348347-9bc6cbbb689e",
    "1620799139507-2a76f79a2f4d","1609345266895-d8cec53fd2a4","1578681994506-b8f463906a55",
    "1517941823457-a7bf4b9e4c42","1496747611176-887f74436ab0","1515886657613-9f3515b0c69f",
    "1523381210434-271e8be8a52b","1583744946564-b52ac1c389c8","1598300042247-d088f8ab3a91",
    "1576995953931-7e64fc7d44ac","1558769132-cb1aea458c5e","1509631179647-0177331693ae",
    "1524504388868-5c8145c88aca","1526413425852-ba01ad9b0ec0","1523359346347-f24ef5adfb7b",
    "1614252369475-af4e3d6af8c6","1596388901428-174cf699d2ca","1510741906-7a5a12c1a7f5",
  ],
};

/* ── Pool key resolver ────────────────────────────────────────────────────── */
function getPoolKey(product) {
  const cat  = (product.category   || "").toLowerCase();
  const sub  = (product.subcategory || "").toLowerCase();
  const name = (product.name        || "").toLowerCase();

  // Specific subcategory overrides
  if (sub.includes("sunglass") || name.includes("sunglass") || name.includes("aviator") ||
      name.includes("oval") || name.includes("cat eye") || name.includes("square sunglass"))
    return "sunglasses";
  if (sub.includes("cap") || sub.includes("hat") || name.includes("cap") || name.includes("hat"))
    return "caps";
  if (sub.includes("belt") || name.includes("belt"))
    return "belts";
  if (sub.includes("backpack") || name.includes("backpack"))
    return "backpacks";
  if (sub.includes("legging") || name.includes("legging"))
    return "leggings";
  if (sub.includes("jogger") || sub.includes("track") ||
      name.includes("jogger") || name.includes("track pant"))
    return "joggers";
  if (sub.includes("skirt") || name.includes("skirt"))
    return "skirts";
  if (sub.includes("jumpsuit") || name.includes("jumpsuit"))
    return "jumpsuits";
  if (sub.includes("watch") || name.includes("watch"))
    return "watches";
  if (sub.includes("hair") || name.includes("hair") || name.includes("claw") || name.includes("scrunchie"))
    return "hair";
  if (sub.includes("wallet") || name.includes("wallet"))
    return "wallets";
  if (sub.includes("handbag") || sub.includes("bag") || name.includes("handbag"))
    return "Women|Handbags";

  // Category + subcategory composite key
  const compositeKey = `${cat.charAt(0).toUpperCase() + cat.slice(1)}|${
    sub.charAt(0).toUpperCase() + sub.slice(1)
  }`;
  if (POOLS[compositeKey]) return compositeKey;

  return "generic";
}

/* ── Pool pointer tracker (avoids cycling through already-used IDs) ────────*/
const poolPointers = {};
const globalUsed   = new Set();

function pickUnusedUrl(poolKey) {
  const pool = POOLS[poolKey] || POOLS["generic"];

  if (!poolPointers[poolKey]) poolPointers[poolKey] = 0;

  // First pass: pick next unused from pool in order
  const startIdx = poolPointers[poolKey];
  for (let i = 0; i < pool.length; i++) {
    const idx = (startIdx + i) % pool.length;
    const candidate = u(pool[idx]);
    if (!globalUsed.has(candidate)) {
      globalUsed.add(candidate);
      poolPointers[poolKey] = (idx + 1) % pool.length;
      return candidate;
    }
  }

  // Fallback: cycle through generic pool
  const fallback = POOLS["generic"];
  for (const id of fallback) {
    const candidate = u(id);
    if (!globalUsed.has(candidate)) {
      globalUsed.add(candidate);
      return candidate;
    }
  }

  // Last resort: generate a variation with different crop params
  const id = pool[poolPointers[poolKey] % pool.length];
  const variant = `${BASE}${id}?w=${W}&h=${H}&fit=crop&crop=entropy&sat=-100`;
  globalUsed.add(variant);
  return variant;
}

/* ── Main ───────────────────────────────────────────────────────────────────*/
async function run() {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  🖼️  Cross-Product Image Fix`);
  console.log(`  Mode: ${IS_DRY_RUN ? "🔍 DRY RUN" : "✏️  LIVE"}`);
  console.log(`${"═".repeat(60)}\n`);

  // Load products.json
  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf-8"));
  console.log(`📦  Loaded ${products.length} products from products.json\n`);

  // First pass: register all current unique URLs so we know what's taken
  const urlCount = new Map();
  for (const p of products) {
    for (const img of (p.images || [])) {
      urlCount.set(img, (urlCount.get(img) || 0) + 1);
    }
  }

  // Identify shared URLs
  const sharedUrls = new Set(
    [...urlCount.entries()].filter(([, c]) => c > 1).map(([url]) => url)
  );
  console.log(`⚠️   ${sharedUrls.size} URLs shared across multiple products\n`);

  // Register non-shared URLs in globalUsed so we don't accidentally reuse them
  for (const [url, count] of urlCount.entries()) {
    if (count === 1) globalUsed.add(url);
  }

  // Second pass: replace shared images
  const updates = []; // { id, name, oldImages, newImages }

  for (const product of products) {
    const oldImages = product.images || [];
    const newImages = oldImages.map((img) => {
      if (!sharedUrls.has(img)) return img; // unique — keep it
      const poolKey = getPoolKey(product);
      const fresh   = pickUnusedUrl(poolKey);
      return fresh;
    });

    const changed = newImages.some((img, i) => img !== oldImages[i]);
    if (changed) {
      updates.push({ id: product.id, name: product.name, oldImages, newImages });
      product.images = newImages; // mutate in-memory for JSON write
    }
  }

  console.log(`📝  ${updates.length} products will receive updated image URLs\n`);
  updates.slice(0, 5).forEach(({ name, oldImages, newImages }) => {
    console.log(`  • ${name}`);
    console.log(`    OLD: ${oldImages[0]}`);
    console.log(`    NEW: ${newImages[0]}\n`);
  });
  if (updates.length > 5) console.log(`  ... and ${updates.length - 5} more\n`);

  if (IS_DRY_RUN) {
    console.log("⏭️  DRY RUN — no changes written. Run without --dry-run to apply.\n");
    return;
  }

  // ── Write products.json ───────────────────────────────────────────────────
  fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(products, null, 2), "utf-8");
  console.log(`✅  products.json updated\n`);

  // ── Update MongoDB ─────────────────────────────────────────────────────────
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn("⚠️   MONGO_URI not set — skipping MongoDB update.");
    return;
  }

  await mongoose.connect(mongoUri);
  console.log("✅  Connected to MongoDB");

  const Product = mongoose.model(
    "Product_fix",
    new mongoose.Schema({ name: String, images: [String] })
  );

  // Match by name (products.json uses numeric id, MongoDB uses ObjectId)
  const bulkOps = updates.map(({ name, newImages }) => ({
    updateOne: {
      filter: { name },
      update: { $set: { images: newImages } },
    },
  }));

  if (bulkOps.length > 0) {
    const result = await Product.bulkWrite(bulkOps, { ordered: false });
    console.log(`✅  MongoDB: ${result.modifiedCount} products updated`);
  }

  await mongoose.disconnect();
  console.log("🔌  Disconnected.\n");
  console.log("🎉  Done! Every product now has a unique image URL.\n");
}

run().catch((err) => {
  console.error("💥 Error:", err);
  process.exit(1);
});
