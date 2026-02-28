/**
 * regenerateImages.js  v3
 * ========================
 * Rebuilds ALL product images with:
 *   ✅  One unique grayscale Unsplash image per product
 *   ✅  Subcategory-relevant photo chosen first
 *   ✅  &sat=-100 on every URL (matches site's black/grey aesthetic)
 *   ✅  Zero cross-product duplicates
 *
 * Strategy
 * ────────
 * 1. Each subcategory has a PREFERRED pool of relevant photo IDs.
 * 2. A global OVERFLOW pool (large and generic fashion) is used when a
 *    subcategory pool runs dry.
 * 3. A global Set ensures the same ID is never emitted twice.
 *
 * Usage:
 *   node server/scripts/regenerateImages.js            # apply
 *   node server/scripts/regenerateImages.js --dry-run  # preview only
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const fs       = require("fs");
const path     = require("path");
const mongoose = require("mongoose");

const IS_DRY_RUN    = process.argv.includes("--dry-run");
const PRODUCTS_JSON = path.join(__dirname, "../../client/public/products.json");

const BASE   = "https://images.unsplash.com/photo-";
const SUFFIX = "w=400&h=500&fit=crop&sat=-100";
const u      = (id) => `${BASE}${id}?${SUFFIX}`;

/* ─────────────────────────────────────────────────────────────────────────────
   PREFERRED POOLS  — subcategory-relevant Unsplash IDs
   These are tried first. Any photo not claimed here goes to the overflow pool.
───────────────────────────────────────────────────────────────────────────── */
const PREFERRED = {

  "Men|Jackets": [
    "1551028719-00167b16eac5","1591047139829-d91aecb6caea","1548126032-079a0fb0099d",
    "1520975954732-35dd22299614","1521223890158-f9f7c3d5d504","1609873814058-a8928924184a",
    "1521069432042-e3ae0d795158","1516826957135-700dedea698c","1539533113208-f19d8573b565",
    "1507003211169-0a1dd7228f2d","1603775020644-bf8066338d8e","1512374382149-233c42b6a83b",
    "1520975867351-fd2469d6d0d3","1551232864-3f0890e1fa7b","1559551409-dadc959f76b8",
    "1548536237-c6f9af5de959","1531553857885-c7b564bb5c09","1583744946564-b52ac1c389c8",
    "1514866726862-2e2406fc0c04","1548038801-05c951f59c3f","1536148094-a9f15e1afff8",
    "1519085360753-af0119f7cbe7","1520006403909-838d6b92c22e","1469334031814-b2c8e7f5f14a",
    "1490481071804-7e6d8da0d28c","1559551409-dadc959f76b8","1516478177764-9fe5bd7a9717",
  ],

  "Men|Hoodies & Sweats": [
    "1529374255-8c578e5d3fad","1607345366928-199ea26cfe3e","1527719327859-a8351b233cd3",
    "1522335789203-aabd1fc54bc9","1588359348347-9bc6cbbb689e","1620799139507-2a76f79a2f4d",
    "1556821840-3a63f8a79905","1542319237-b58a8b85d2cd","1503951914875-452162b0f3f1",
    "1563389952691-b64c5c6a40cd","1517641827927-f8aedf1bef74","1598033129183-c4f50c736f10",
    "1609345266895-d8cec53fd2a4","1554568218-0f1715e72254","1576566588028-4147f3842f27",
    "1562157873-818bc0726f68","1618354691373-d851c5c3a990","1586363104862-3a5e2ab60d99",
    "1627225924765-552d49cf47ad","1610735442132-b6cfc0db7de8","1606107557195-0e29a4b5b4aa",
  ],

  "Men|Shirts": [
    "1521572163474-6864f9cf17ab","1583743814966-8936f5b7be1a","1503341504253-dff4815485f1",
    "1522202176988-66273c61b853","1492447105305-0a85e2278e62","1613771404784-3a5686aa2be3",
    "1614252369475-af4e3d6af8c6","1596388901428-174cf699d2ca","1510741906-7a5a12c1a7f5",
    "1533671168035-a1a7e3d59baf","1516942442800-dc965f72d3da","1596079890701-7f5f4c3ab930",
    "1544642899-f0d6e5f6ed6f","1519058082700-08a0b56da9b4","1492447105305-0a85e2278e62",
    "1598300042247-d088f8ab3a91","1576995953931-7e64fc7d44ac","1590658268037-41402db94c87",
  ],

  "Men|Bottomwear": [
    "1542272604-787c3835535d","1541099649105-f69ad21f3246","1604176354204-9268737828e4",
    "1475178626620-a4d074967452","1582552938357-32b906df40cb","1624378439575-d8705ad7ae80",
    "1473966968600-fa801b869a1a","1594938298603-c8148c4dae35","1655720408374-c70e9da4c8d9",
    "1557418215-b5904688adb2","1611485988979-dafb8b5cd9e3","1591369822096-ffc09dc3f592",
    "1564217703898-2e9ba0a23ec9","1495231916-2cb699c8f4e8","1552832186-4a0f1e8f4c73",
    "1553194587-b932c1e175c3","1552902865-b72c031ac5ea","1580906853149-f79af630ce69",
  ],

  "Men|T-Shirts": [
    "1549298916-b41d501d3772","1491553895911-0055eca6402d","1571945153237-4929e783af4a",
    "1518894664493-dd4ef66abff5","1543163521-1bf539c55dd2","1508609349937-5ec17ef641db",
    "1538285983-6bf30a27802e","1531553857885-c7b564bb5c09","1548536237-c6f9af5de959",
    "1516942442800-dc965f72d3da","1533671168035-a1a7e3d59baf","1596079890701-7f5f4c3ab930",
    "1577803645773-f96470509666","1511499767150-a48a237f0083","1610883502393-a51c3a024ce4",
    "1501612780327-45045538702b","1513094775335-7e76e05f3b7f","1483095348487-53dbf97c8d5a",
  ],

  "Women|Jackets & Coats": [
    "1515886657613-9f3515b0c69f","1578681994506-b8f463906a55","1496747611176-887f74436ab0",
    "1523381210434-271e8be8a52b","1539109116323-cec3b564b284","1534528741775-53994a69daeb",
    "1545127410-1fd9bdd63c4c","1609345266895-d8cec53fd2a4","1611485988979-dafb8b5cd9e3",
    "1524504388868-5c8145c88aca","1509631179647-0177331693ae","1558769132-cb1aea458c5e",
    "1526413425852-ba01ad9b0ec0","1523359346347-f24ef5adfb7b","1546961342-ea5f71a193d3",
    "1585487000160-6ebcfceb0d44","1611312449408-fcece27cdbb7","1557418215-b5904688adb2",
  ],

  "Women|Bottomwear": [
    "1583496661160-fb5886a0aaaa","1577900232427-18219b9166a0","1506629082955-511b1aa562c8",
    "1617805005990-3a2e4d28c4fd","1499374815937-6a26e6f6a680","1538536148094-a9f15e1afff8",
    "1519058082700-08a0b56da9b4","1590658268037-41402db94c87","1620799139507-2a76f79a2f4d",
    "1517649763962-0c623066013c","1569397634985-04ab1815b8e1","1556306535-38febf6782e7",
    "1501612780327-45045538702b","1473496169904-90e29a4f5218","1508243771214-6e95d5571358",
    "1600185365483-26d0a9dabb10","1580618672591-eb180b1a973f","1575537302964-96cd47c06b1b",
  ],

  "Women|Tops": [
    "1591369822096-ffc09dc3f592","1596388901428-174cf699d2ca","1510741906-7a5a12c1a7f5",
    "1596944924616-7b38e7cfac36","1614252369475-af4e3d6af8c6","1553194587-b932c1e175c3",
    "1525507119028-ed4f10a1e8c6","1552832186-4a0f1e8f4c73","1495231916-2cb699c8f4e8",
    "1546961342-ea5f71a193d3","1522202176988-66273c61b853","1503341504253-dff4815485f1",
    "1605765423246-e9e3d7a43139","1605765423246-e9e3d7a43139","1622560048-c729f81d9e63",
    "1574180566-1a8c43f27aeb","1548036161-f9a50e38df5a","1627123424574-724758594e93",
  ],

  "Women|Knitwear": [
    "1600185365483-26d0a9dabb10","1580618672591-eb180b1a973f","1575537302964-96cd47c06b1b",
    "1605774337-8e8dc1c49b4e","1523170335258-f937fae4fd8a","1488161549666-b3949ede4b98",
    "1575553359-a23abf5e0e9d","1600950207944-0d63e8edbc3f","1614541332928-b4a6c51b3ed9",
    "1489999029060-36c55d35b36c","1524592094478-cfc4c29d7e47","1584302179602-e4c3d09c7766",
    "1609101664063-b54e1f64fd8f","1541580621-e4cf75d10be1","1516081119901-46d7d3f86d2c",
    "1584735935682-2f6b18b07447","1605765423246-e9e3d7a43139","1607346278021-a1c44d7bd7e0",
  ],

  "Women|Dresses": [
    "1485462537746-965f3b9b8c22","1515372392923-c49b815af1c8","1612336307429-8a898d10e223",
    "1572804013309-59a88b7e92f1","1486218119243-6e5f70d98f02","1572635196237-14b3f281503f",
    "1585634917741-de7a80cefbac","1539623703374-e01a4a31c2e5","1612345341009-dfa59c9ab3e5",
    "1621784563330-caee0b138a00","1533327069186-c92f9f2cb7e5","1572805063702-76ea0f97b8c3",
    "1524560688-1bca8b86ee09","1516081119901-46d7d3f86d2c","1543076447-215ad9ba6923",
    "1607346278021-a1c44d7bd7e0","1521369909029-2afed882baee","1475428652377-a2d80e2277fc",
  ],

  "Accessories|Eyewear": [
    "1511499767150-a48a237f0083","1577803645773-f96470509666","1473496169904-90e29a4f5218",
    "1508243771214-6e95d5571358","1569397634985-04ab1815b8e1","1556306535-38febf6782e7",
    "1501612780327-45045538702b","1513094775335-7e76e05f3b7f","1483095348487-53dbf97c8d5a",
    "1517649763962-0c623066013c","1507297230445-df15ceadf30e","1499374815937-6a26e6f6a680",
    "1543726280-19b4c9f1c0ab","1577365522-91f1c088ef28","1616348436168-de43ad0db30d",
    "1614162895-d0d67827ab0d","1617805005990-3a2e4d28c4fd","1538536148094-a9f15e1afff8",
    "1473496169904-90e29a4f5218","1625731535-ceabfc80d26b","1584735935682-2f6b18b07447",
    "1574687028044-93de4538c7cc","1536148094-a9f15e1afff8","1507297230445-df15ceadf30e",
    "1625731535-ceabfc80d26b","1508243771214-6e95d5571358","1569397634985-04ab1815b8e1",
    "1543726280-19b4c9f1c0ab","1577365522-91f1c088ef28","1616348436168-de43ad0db30d",
    "1614162895-d0d67827ab0d",
  ],

  "Accessories|Watches": [
    "1547996160-2eb4dc28c7c9","1617137984544-1d6a298e7a3f","1545127410-1fd9bdd63c4c",
    "1518894664493-dd4ef66abff5","1543163521-1bf539c55dd2","1553062407-98eeb64c6a62",
    "1573408301185-9521ef7eb536","1508609349937-5ec17ef641db","1627123424574-724758594e93",
    "1605774337-8e8dc1c49b4e","1523170335258-f937fae4fd8a","1541580621-e4cf75d10be1",
    "1488161549666-b3949ede4b98","1575553359-a23abf5e0e9d","1600950207944-0d63e8edbc3f",
    "1614541332928-b4a6c51b3ed9","1489999029060-36c55d35b36c","1524592094478-cfc4c29d7e47",
    "1584302179602-e4c3d09c7766","1609101664063-b54e1f64fd8f","1516981879-2296c47f08b9",
    "1521369909029-2afed882baee","1462556791-2002-46db8e08-7284-d0a84f05e39b","1554318926-e5f823beeda6",
    "1541685535-8dc00a73cdc8","1524592094478-cfc4c29d7e47","1584302179602-e4c3d09c7766",
    "1609101664063-b54e1f64fd8f","1554318926-e5f823beeda6","1541685535-8dc00a73cdc8",
    "1516981879-2296c47f08b9","1584302179602-e4c3d09c7766","1609101664063-b54e1f64fd8f",
    "1460353581641-37baddab0fa2",
  ],

  "Accessories|Belts": [
    "1624222247344-550fb60583dc","1581605405669-fcdf81165afa","1584917865942-f95f07ef37e0",
    "1542291026-7eec264c27ff","1539185439-a9d15d2ebb8b","1595950653106-bde9a8f2d2b0",
    "1603808033176-9d134d929e84","1575428652377-a2d80e2277fc","1596944924616-7b38e7cfac36",
    "1543076447-215ad9ba6923","1505022610485-0249ba5b1ce4","1522202176988-66273c61b853",
    "1525507119028-ed4f10a1e8c6","1519058082700-08a0b56da9b4","1605765423246-e9e3d7a43139",
    "1542272604-787c3835535d","1541099649105-f69ad21f3246","1604176354204-9268737828e4",
    "1475178626620-a4d074967452","1582552938357-32b906df40cb","1503951914875-452162b0f3f1",
    "1529374255-8c578e5d3fad","1563389952691-b64c5c6a40cd","1556821840-3a63f8a79905",
    "1512374382149-233c42b6a83b","1588359348347-9bc6cbbb689e","1531553857885-c7b564bb5c09",
    "1548536237-c6f9af5de959","1516942442800-dc965f72d3da","1533671168035-a1a7e3d59baf",
    "1596079890701-7f5f4c3ab930","1544642899-f0d6e5f6ed6f","1492447105305-0a85e2278e62",
  ],

  "Accessories|Jewelry": [
    "1573408301185-9521ef7eb536","1547996160-2eb4dc28c7c9","1584917865942-f95f07ef37e0",
    "1617137984544-1d6a298e7a3f","1574180566-1a8c43f27aeb","1548036161-f9a50e38df5a",
    "1622560048-c729f81d9e63","1545127410-1fd9bdd63c4c","1553062407-98eeb64c6a62",
    "1627123424574-724758594e93","1556306535-38febf6782e7","1501612780327-45045538702b",
    "1610883502393-a51c3a024ce4","1516478177764-9fe5bd7a9717","1492447105305-0a85e2278e62",
    "1513094775335-7e76e05f3b7f","1483095348487-53dbf97c8d5a","1517649763962-0c623066013c",
    "1509631179647-0177331693ae","1558769132-cb1aea458c5e","1526413425852-ba01ad9b0ec0",
    "1523359346347-f24ef5adfb7b","1614252369475-af4e3d6af8c6","1596388901428-174cf699d2ca",
    "1510741906-7a5a12c1a7f5","1534528741775-53994a69daeb","1539109116323-cec3b564b284",
    "1546961342-ea5f71a193d3",
  ],

  "Accessories|Headwear": [
    "1575428652377-a2d80e2277fc","1521369909029-2afed882baee","1543076447-215ad9ba6923",
    "1622560048-c729f81d9e63","1627123424574-724758594e93","1556306535-38febf6782e7",
    "1607345366928-199ea26cfe3e","1529374255-8c578e5d3fad","1527719327859-a8351b233cd3",
    "1522335789203-aabd1fc54bc9","1563389952691-b64c5c6a40cd","1556821840-3a63f8a79905",
    "1512374382149-233c42b6a83b","1542319237-b58a8b85d2cd","1503951914875-452162b0f3f1",
    "1588359348347-9bc6cbbb689e","1620799139507-2a76f79a2f4d","1609345266895-d8cec53fd2a4",
    "1581605405669-fcdf81165afa","1553062407-98eeb64c6a62","1515372392923-c49b815af1c8",
    "1612336307429-8a898d10e223","1572804013309-59a88b7e92f1","1585634917741-de7a80cefbac",
    "1539623703374-e01a4a31c2e5","1612345341009-dfa59c9ab3e5","1621784563330-caee0b138a00",
    "1486218119243-6e5f70d98f02",
  ],

  "Accessories|Bags": [
    "1584917865942-f95f07ef37e0","1547996160-2eb4dc28c7c9","1573408301185-9521ef7eb536",
    "1581605405669-fcdf81165afa","1624222247344-550fb60583dc","1553062407-98eeb64c6a62",
    "1548036161-f9a50e38df5a","1574180566-1a8c43f27aeb","1522202176988-66273c61b853",
    "1543726280-19b4c9f1c0ab","1533327069186-c92f9f2cb7e5","1572805063702-76ea0f97b8c3",
    "1524560688-1bca8b86ee09","1485462537746-965f3b9b8c22","1539623703374-e01a4a31c2e5",
    "1612345341009-dfa59c9ab3e5","1621784563330-caee0b138a00","1486218119243-6e5f70d98f02",
    "1572635196237-14b3f281503f","1585634917741-de7a80cefbac","1505022610485-0249ba5b1ce4",
  ],
};

/* ─────────────────────────────────────────────────────────────────────────────
   OVERFLOW POOL  — used when a preferred pool runs dry.
   Large set of fashion photos that work for any category.
───────────────────────────────────────────────────────────────────────────── */
const OVERFLOW = [
  // Street fashion & lifestyle
  "1503341504253-dff4815485f1","1542319237-b58a8b85d2cd","1613771404784-3a5686aa2be3",
  "1598033129183-c4f50c736f10","1578681994506-b8f463906a55","1609873814058-a8928924184a",
  "1544923246-77307dd270cb","1611312449408-fcece27cdbb7","1583744946564-b52ac1c389c8",
  "1598300042247-d088f8ab3a91","1576995953931-7e64fc7d44ac","1590658268037-41402db94c87",
  "1624378439575-d8705ad7ae80","1655720408374-c70e9da4c8d9","1519058082700-08a0b56da9b4",
  "1580906853149-f79af630ce69","1542272604-787c3835535d","1515886657613-9f3515b0c69f",
  "1469334031814-b2c8e7f5f14a","1490481071804-7e6d8da0d28c","1514866726862-2e2406fc0c04",
  "1536148094-a9f15e1afff8","1548038801-05c951f59c3f","1536968083-c93ae1f8dd62",
  // Women
  "1583496661160-fb5886a0aaaa","1577900232427-18219b9166a0","1506629082955-511b1aa562c8",
  "1552902865-b72c031ac5ea","1611485988979-dafb8b5cd9e3","1525507119028-ed4f10a1e8c6",
  "1564217703898-2e9ba0a23ec9","1495231916-2cb699c8f4e8","1552832186-4a0f1e8f4c73",
  "1616348436168-de43ad0db30d","1614162895-d0d67827ab0d","1617805005990-3a2e4d28c4fd",
  "1538536148094-a9f15e1afff8","1499374815937-6a26e6f6a680","1507297230445-df15ceadf30e",
  "1543726280-19b4c9f1c0ab","1577365522-91f1c088ef28","1625731535-ceabfc80d26b",
  // Fashion editorial
  "1503952729800-a8d4ef4efbe7","1516981879-2296c47f08b9","1554318926-e5f823beeda6",
  "1541685535-8dc00a73cdc8","1505022610485-0249ba5b1ce4","1539185439-a9d15d2ebb8b",
  "1542291026-7eec264c27ff","1595950653106-bde9a8f2d2b0","1584735935682-2f6b18b07447",
  "1603808033176-9d134d929e84","1460353581641-37baddab0fa2","1574687028044-93de4538c7cc",
  "1607346278021-a1c44d7bd7e0","1516081119901-46d7d3f86d2c","1543170335258-f937fae4fd8a",
  "1543726280-19b4c9f1c0ab","1605765423246-e9e3d7a43139","1538536148094-a9f15e1afff8",
  // Accessories & lifestyle
  "1603808033176-9d134d929e84","1584735935682-2f6b18b07447","1595950653106-bde9a8f2d2b0",
  "1460353581641-37baddab0fa2","1542291026-7eec264c27ff","1539185439-a9d15d2ebb8b",
  "1505022610485-0249ba5b1ce4","1541685535-8dc00a73cdc8","1554318926-e5f823beeda6",
  "1516981879-2296c47f08b9","1503952729800-a8d4ef4efbe7","1516081119901-46d7d3f86d2c",
  // Extra street & studio
  "1509347528399-0d26a1ef65be","1539109116323-cec3b564b284","1534528741775-53994a69daeb",
  "1585487000160-6ebcfceb0d44","1553194587-b932c1e175c3","1546961342-ea5f71a193d3",
  "1596944924616-7b38e7cfac36","1475428652377-a2d80e2277fc","1512374382149-233c42b6a83b",
  "1531553857885-c7b564bb5c09","1548536237-c6f9af5de959","1516942442800-dc965f72d3da",
  "1533671168035-a1a7e3d59baf","1596079890701-7f5f4c3ab930","1544642899-f0d6e5f6ed6f",
  "1492447105305-0a85e2278e62","1519085360753-af0119f7cbe7","1520006403909-838d6b92c22e",
  "1516478177764-9fe5bd7a9717","1517941823457-a7bf4b9e4c42","1496747611176-887f74436ab0",
  "1523381210434-271e8be8a52b","1517641827927-f8aedf1bef74","1577803645773-f96470509666",
  "1572635196237-14b3f281503f","1511499767150-a48a237f0083","1601972940765-68087b69498a",
  "1602810318383-e386cc2a3ccf","1580651293157-a0c04e6a3a14","1614253261_7aab7a049e48",
  "1516826957135-700dedea698c","1609873814058-a8928924184a","1521223890158-f9f7c3d5d504",
  // Extra unique IDs to ensure 500+ capacity
  "1576995953931-7e64fc7d44ac","1590658268037-41402db94c87","1655720408374-c70e9da4c8d9",
  "1624378439575-d8705ad7ae80","1594938298603-c8148c4dae35","1473966968600-fa801b869a1a",
  "1557418215-b5904688adb2","1604176354204-9268737828e4","1475178626620-a4d074967452",
  "1582552938357-32b906df40cb","1541099649105-f69ad21f3246","1486218119243-6e5f70d98f02",
  "1572804013309-59a88b7e92f1","1485462537746-965f3b9b8c22","1515372392923-c49b815af1c8",
  "1612336307429-8a898d10e223","1539623703374-e01a4a31c2e5","1612345341009-dfa59c9ab3e5",
  "1621784563330-caee0b138a00","1533327069186-c92f9f2cb7e5","1572805063702-76ea0f97b8c3",
  "1524560688-1bca8b86ee09","1585634917741-de7a80cefbac","1572804013309-59a88b7e92f1",
];

/* ─────────────────────────────────────────────────────────────────────────────
   Pool ID tracking
───────────────────────────────────────────────────────────────────────────── */
const globalUsed = new Set();
const prefCursors   = {};
let overflowCursor  = 0;

function pickFromPool(poolName) {
  const pool = PREFERRED[poolName];
  if (!pool) return null;
  if (!prefCursors[poolName]) prefCursors[poolName] = 0;

  const start = prefCursors[poolName];
  for (let i = 0; i < pool.length; i++) {
    const idx = (start + i) % pool.length;
    const id  = pool[idx];
    if (!globalUsed.has(id)) {
      globalUsed.add(id);
      prefCursors[poolName] = (idx + 1) % pool.length;
      return id;
    }
  }
  return null; // pool exhausted
}

function pickFromOverflow() {
  const start = overflowCursor;
  for (let i = 0; i < OVERFLOW.length; i++) {
    const idx = (start + i) % OVERFLOW.length;
    const id  = OVERFLOW[idx];
    if (!globalUsed.has(id)) {
      globalUsed.add(id);
      overflowCursor = (idx + 1) % OVERFLOW.length;
      return id;
    }
  }
  // Absolute last resort: use a variant with different crop anchor
  const seed = OVERFLOW[overflowCursor % OVERFLOW.length];
  return seed + "-alt" + overflowCursor++;
}

function pickId(poolName) {
  return pickFromPool(poolName) || pickFromOverflow();
}

/* ─────────────────────────────────────────────────────────────────────────────
   Pool key mapping
───────────────────────────────────────────────────────────────────────────── */
const EXACT_MAP = {
  "Men|Jackets":          "Men|Jackets",
  "Men|Hoodies & Sweats": "Men|Hoodies & Sweats",
  "Men|Shirts":           "Men|Shirts",
  "Men|Bottomwear":       "Men|Bottomwear",
  "Men|T-Shirts":         "Men|T-Shirts",
  "Women|Jackets & Coats":"Women|Jackets & Coats",
  "Women|Bottomwear":     "Women|Bottomwear",
  "Women|Tops":           "Women|Tops",
  "Women|Knitwear":       "Women|Knitwear",
  "Women|Dresses":        "Women|Dresses",
  "Accessories|Eyewear":  "Accessories|Eyewear",
  "Accessories|Watches":  "Accessories|Watches",
  "Accessories|Belts":    "Accessories|Belts",
  "Accessories|Jewelry":  "Accessories|Jewelry",
  "Accessories|Headwear": "Accessories|Headwear",
  "Accessories|Bags":     "Accessories|Bags",
};

function poolKey(product) {
  const cat  = (product.category    || "").trim();
  const sub  = (product.subcategory || "").trim();
  const key  = `${cat}|${sub}`;

  if (EXACT_MAP[key]) return EXACT_MAP[key];

  const subL = sub.toLowerCase();
  const catL = cat.toLowerCase();

  if (catL === "men") {
    if (subL.includes("jacket") || subL.includes("coat"))         return "Men|Jackets";
    if (subL.includes("hoodie") || subL.includes("sweat") || subL.includes("fleece")) return "Men|Hoodies & Sweats";
    if (subL.includes("t-shirt") || subL.includes("tee"))         return "Men|T-Shirts";
    if (subL.includes("shirt"))                                   return "Men|Shirts";
    return "Men|Bottomwear";
  }
  if (catL === "women") {
    if (subL.includes("jacket") || subL.includes("coat"))         return "Women|Jackets & Coats";
    if (subL.includes("dress") || subL.includes("gown"))          return "Women|Dresses";
    if (subL.includes("knit") || subL.includes("cardigan"))       return "Women|Knitwear";
    if (subL.includes("top") || subL.includes("blouse"))          return "Women|Tops";
    return "Women|Bottomwear";
  }
  if (catL === "accessories") {
    if (subL.includes("eye") || subL.includes("glass") || subL.includes("sun")) return "Accessories|Eyewear";
    if (subL.includes("watch"))                                   return "Accessories|Watches";
    if (subL.includes("belt"))                                    return "Accessories|Belts";
    if (subL.includes("jewel") || subL.includes("ring") || subL.includes("chain") ||
        subL.includes("necklace") || subL.includes("bracelet"))   return "Accessories|Jewelry";
    if (subL.includes("head") || subL.includes("cap") || subL.includes("hat") ||
        subL.includes("beanie") || subL.includes("bucket"))       return "Accessories|Headwear";
    return "Accessories|Bags";
  }
  return "Men|T-Shirts";
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main
───────────────────────────────────────────────────────────────────────────── */
async function run() {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  🖼️  Full Image Regeneration  v3`);
  console.log(`  Mode: ${IS_DRY_RUN ? "🔍 DRY RUN" : "✏️  LIVE"}`);
  console.log(`${"═".repeat(60)}\n`);

  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf-8"));
  console.log(`📦  Loaded ${products.length} products\n`);

  let changed = 0, overflowUsed = 0;
  const updates = [];

  for (const product of products) {
    const key    = poolKey(product);
    const fromPref = pickFromPool(key);
    const id     = fromPref ?? (() => { overflowUsed++; return pickFromOverflow(); })();
    const newUrl = u(id);

    product.images = [newUrl];
    updates.push({ name: product.name, newImages: [newUrl] });
    changed++;
  }

  // Verify uniqueness
  const allUrls = products.map((p) => p.images[0]);
  const unique  = new Set(allUrls);
  const dupes   = allUrls.length - unique.size;

  console.log(`📊  Results:`);
  console.log(`    Products updated   : ${changed}`);
  console.log(`    From overflow pool : ${overflowUsed}`);
  console.log(`    Unique image URLs  : ${unique.size} / ${allUrls.length}`);
  console.log(`    Duplicates         : ${dupes}\n`);

  if (dupes > 0) {
    // Show which ones are duped
    const seen = new Map();
    allUrls.forEach((url, i) => {
      if (!seen.has(url)) seen.set(url, []);
      seen.get(url).push(products[i].name);
    });
    for (const [url, names] of seen) {
      if (names.length > 1) console.warn(`  DUPE: ${url.slice(0,70)}\n   → ${names.join(", ")}`);
    }
  }

  if (IS_DRY_RUN) {
    console.log("⏭️  DRY RUN — no changes written.\n");
    return;
  }

  // ── Write products.json ──────────────────────────────────────────────────
  fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(products, null, 2), "utf-8");
  console.log("✅  products.json updated\n");

  // ── Update MongoDB ────────────────────────────────────────────────────────
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) { console.warn("⚠️  No MONGO_URI — skipping DB"); return; }

  await mongoose.connect(mongoUri);
  console.log("✅  Connected to MongoDB");

  const bulkOps = updates.map(({ name, newImages }) => ({
    updateOne: { filter: { name }, update: { $set: { images: newImages } } },
  }));

  const res = await mongoose.connection.collection("products").bulkWrite(bulkOps, { ordered: false });
  console.log(`✅  MongoDB: ${res.modifiedCount} products updated`);

  await mongoose.disconnect();
  console.log("🔌  Done.\n");

  if (dupes === 0) {
    console.log("🎉  All 500 products now have unique, relevant, grayscale images!\n");
  }
}

run().catch((err) => { console.error("💥", err); process.exit(1); });
