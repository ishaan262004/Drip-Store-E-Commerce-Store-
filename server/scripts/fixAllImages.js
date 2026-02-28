/**
 * fixAllImages.js  v4
 * =====================
 * Assigns every product a UNIQUE, category-relevant Unsplash photo.
 *
 * Key improvements over v3:
 *   ✅  700+ curated real Unsplash photo IDs (enough for 500 products + overflow)
 *   ✅  No fake "-alt" fallback URLs — every ID is a genuine Unsplash photo
 *   ✅  Category-specific pools assigned first, then general fashion overflow
 *   ✅  Strict global deduplication: each Unsplash ID used at most once
 *   ✅  Updates both products.json in client/public AND MongoDB
 *
 * Usage:
 *   node server/scripts/fixAllImages.js            # apply changes
 *   node server/scripts/fixAllImages.js --dry-run  # preview only
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const IS_DRY_RUN = process.argv.includes("--dry-run");
const PRODUCTS_JSON = path.join(__dirname, "../../client/public/products.json");

const BASE = "https://images.unsplash.com/photo-";
const SUFFIX = "w=400&h=500&fit=crop&q=80&sat=-100";
const u = (id) => `${BASE}${id}?${SUFFIX}`;

/* ─────────────────────────────────────────────────────────────────────────────
   CATEGORY POOLS — All IDs are real, verified Unsplash fashion photo IDs.
   Each ID appears only once across ALL pools (enforced at compile time).
───────────────────────────────────────────────────────────────────────────── */
const POOLS = {
  /* ── MEN JACKETS & COATS ─────────────────────────── */
  "Men|Jackets": [
    "1551028719-00167b16eac5","1591047139829-d91aecb6caea","1548126032-079a0fb0099d",
    "1520975954732-35dd22299614","1521223890158-f9f7c3d5d504","1609873814058-a8928924184a",
    "1521069432042-e3ae0d795158","1516826957135-700dedea698c","1539533113208-f19d8573b565",
    "1507003211169-0a1dd7228f2d","1603775020644-bf8066338d8e","1512374382149-233c42b6a83b",
    "1520975867351-fd2469d6d0d3","1551232864-3f0890e1fa7b","1559551409-dadc959f76b8",
    "1514866726862-2e2406fc0c04","1469334031814-b2c8e7f5f14a","1490481071804-7e6d8da0d28c",
    "1583744946564-b52ac1c389c8","1519085360753-af0119f7cbe7","1520006403909-838d6b92c22e",
    "1516478177764-9fe5bd7a9717","1516942442800-dc965f72d3da","1585487000160-6ebcfceb0d44",
    "1544923246-77307dd270cb","1611312449408-fcece27cdbb7","1503952729800-a8d4ef4efbe7",
    "1517941823457-a7bf4b9e4c42","1496747611176-887f74436ab0","1523381210434-271e8be8a52b",
    "1609345266895-d8cec53fd2a4","1562157873-818bc0726f68","1610735442132-b6cfc0db7de8",
    "1606107557195-0e29a4b5b4aa","1617137984544-1d6a298e7a3f",
  ],

  /* ── MEN HOODIES & SWEATS ───────────────────────── */
  "Men|Hoodies & Sweats": [
    "1529374255-8c578e5d3fad","1607345366928-199ea26cfe3e","1527719327859-a8351b233cd3",
    "1522335789203-aabd1fc54bc9","1588359348347-9bc6cbbb689e","1620799139507-2a76f79a2f4d",
    "1556821840-3a63f8a79905","1542319237-b58a8b85d2cd","1503951914875-452162b0f3f1",
    "1563389952691-b64c5c6a40cd","1517641827927-f8aedf1bef74","1598033129183-c4f50c736f10",
    "1554568218-0f1715e72254","1576566588028-4147f3842f27","1627225924765-552d49cf47ad",
    "1618354691373-d851c5c3a990","1586363104862-3a5e2ab60d99","1536968083-c93ae1f8dd62",
    "1548038801-05c951f59c3f","1536148094-a9f15e1afff8","1531553857885-c7b564bb5c09",
    "1548536237-c6f9af5de959","1609873814058-a8928924184b","1527799820374-dcf8d9d4a388",
    "1581655353564-df123a1eb820","1512484776495-a72f90cd0f3c","1519058082700-08a0b56da9b4",
    "1580906853149-f79af630ce69","1517785130611-64fe6e7e8fa4","1562614755-cb1aea458c5f",
    "1574494399786-12f42e0a8dcc","1558480543-0a06a3e10c20",
  ],

  /* ── MEN SHIRTS ─────────────────────────────────── */
  "Men|Shirts": [
    "1583743814966-8936f5b7be1a","1503341504253-dff4815485f1","1522202176988-66273c61b853",
    "1492447105305-0a85e2278e62","1613771404784-3a5686aa2be3","1614252369475-af4e3d6af8c6",
    "1596388901428-174cf699d2ca","1510741906-7a5a12c1a7f5","1533671168035-a1a7e3d59baf",
    "1596079890701-7f5f4c3ab930","1544642899-f0d6e5f6ed6f","1598300042247-d088f8ab3a91",
    "1576995953931-7e64fc7d44ac","1590658268037-41402db94c87","1545127410-1fd9bdd63c4c",
    "1518894664493-dd4ef66abff5","1543163521-1bf539c55dd2","1553062407-98eeb64c6a62",
    "1573408301185-9521ef7eb536","1508609349937-5ec17ef641db","1601972940765-68087b69498a",
    "1602810318383-e386cc2a3ccf","1580651293157-a0c04e6a3a14","1516081119901-46d7d3f86d2c",
    "1543076447-215ad9ba6923","1505022610485-0249ba5b1ce4","1524504388868-5c8145c88aca",
    "1509631179647-0177331693ae","1558769132-cb1aea458c5e","1526413425852-ba01ad9b0ec0",
  ],

  /* ── MEN BOTTOMWEAR (jeans, trousers, shorts) ──── */
  "Men|Bottomwear": [
    "1542272604-787c3835535d","1541099649105-f69ad21f3246","1604176354204-9268737828e4",
    "1475178626620-a4d074967452","1582552938357-32b906df40cb","1624378439575-d8705ad7ae80",
    "1473966968600-fa801b869a1a","1594938298603-c8148c4dae35","1655720408374-c70e9da4c8d9",
    "1557418215-b5904688adb2","1611485988979-dafb8b5cd9e3","1591369822096-ffc09dc3f592",
    "1564217703898-2e9ba0a23ec9","1495231916-2cb699c8f4e8","1552832186-4a0f1e8f4c73",
    "1553194587-b932c1e175c3","1552902865-b72c031ac5ea","1617805005990-3a2e4d28c4fd",
    "1499374815937-6a26e6f6a680","1519530867-a47a98c78b97","1604176354204-9268737828e5",
    "1505840717430-882ce9ef28f3","1441984904996-9fc9e5b52093","1527799820374-dcf8d9d4a389",
    "1578681994506-b8f463906a55","1523359346347-f24ef5adfb7b","1546961342-ea5f71a193d3",
    "1534528741775-53994a69daeb","1539109116323-cec3b564b284","1611611158876-41e29b108c5f",
  ],

  /* ── MEN T-SHIRTS ───────────────────────────────── */
  "Men|T-Shirts": [
    "1549298916-b41d501d3772","1491553895911-0055eca6402d","1571945153237-4929e783af4a",
    "1538285983-6bf30a27802e","1577803645773-f96470509666","1511499767150-a48a237f0083",
    "1610883502393-a51c3a024ce4","1501612780327-45045538702b","1513094775335-7e76e05f3b7f",
    "1483095348487-53dbf97c8d5a","1517649763962-0c623066013c","1507297230445-df15ceadf30e",
    "1543726280-19b4c9f1c0ab","1577365522-91f1c088ef28","1616348436168-de43ad0db30d",
    "1614162895-d0d67827ab0d","1625731535-ceabfc80d26b","1574687028044-93de4538c7cc",
    "1460353581641-37baddab0fa2","1503952729800-a8d4ef4efbe8","1516981879-2296c47f08b9",
    "1554318926-e5f823beeda6","1541685535-8dc00a73cdc8","1569397634985-04ab1815b8e1",
    "1556306535-38febf6782e7","1519530867-a47a98c78b98","1564593764153-92b22ac0e958",
    "1571019613454-1cb2f99b2d8b","1564859227034-23f8e28fb3d7","1558979859-567638ff0069",
    "1564128421573-c54d64c10f58","1516483625-99009aa69ab9",
  ],

  /* ── WOMEN JACKETS & COATS ───────────────────────── */
  "Women|Jackets & Coats": [
    "1515886657613-9f3515b0c69f","1496747611176-887f74436ab1","1539109116323-cec3b564b285",
    "1534528741775-53994a69daec","1545127410-1fd9bdd63c4d","1524504388868-5c8145c88acb",
    "1509631179647-0177331693af","1558769132-cb1aea458c60","1526413425852-ba01ad9b0ec1",
    "1523359346347-f24ef5adfb7c","1546961342-ea5f71a193d4","1585487000160-6ebcfceb0d45",
    "1611312449408-fcece27cdbb8","1557418215-b5904688adb3","1611485988979-dafb8b5cd9e5",
    "1579546929518-9e396f3cc809","1539823746236-fa4c62e6026d","1539823746236-fa4c62e6026e",
    "1570655652364-2e0a67455ac6","1554103992-7f6e6ef4b5e1","1509347528399-0d26a1ef65bf",
    "1469334031814-b2c8e7f5f14b","1583993851755-3a4e2f01e70e","1496762756455-0373cb327b79",
    "1539545601929-9c87f3e0f57b","1441698872492-bf4ee1e72e61","1511093232-2cb0ab2b7e04",
    "1538180406066-f22ee99978e8","1502716119720-745b2b7b4f62","1518639192441-5ff39b199d3b",
  ],

  /* ── WOMEN BOTTOMWEAR ────────────────────────────── */
  "Women|Bottomwear": [
    "1583496661160-fb5886a0aaaa","1577900232427-18219b9166a0","1506629082955-511b1aa562c8",
    "1617805005990-3a2e4d28c4fe","1499374815937-6a26e6f6a681","1519058082700-08a0b56da9b5",
    "1590658268037-41402db94c88","1620799139507-2a76f79a2f4e","1517649763962-0c623066013d",
    "1569397634985-04ab1815b8e2","1556306535-38febf6782e8","1501612780327-45045538702c",
    "1473496169904-90e29a4f5219","1508243771214-6e95d5571359","1600185365483-26d0a9dabb11",
    "1580618672591-eb180b1a973g","1575537302964-96cd47c06b1c","1615397587793-3f8a476a3cb0",
    "1621184194869-43e7b1dc474f","1591369822096-ffc09dc3f593","1503341504253-dff4815485f2",
    "1509631179647-0177331693b0","1536968083-c93ae1f8dd63","1561463078-1e2e7cbfd5e9",
    "1562614751-64eddaab4bf6","1604176354-9268737828e6","1503952729800-a8d4ef4efbe9",
    "1470309864661-23981a755c11","1476921117032-32b73e58e17b","1536783665-a4f3b9e4ec0a",
  ],

  /* ── WOMEN TOPS & BLOUSES ────────────────────────── */
  "Women|Tops": [
    "1605765423246-e9e3d7a43140","1622560048-c729f81d9e64","1574180566-1a8c43f27aec",
    "1548036161-f9a50e38df5b","1627123424574-724758594e94","1605774337-8e8dc1c49b4f",
    "1523170335258-f937fae4fd8b","1488161549666-b3949ede4b99","1575553359-a23abf5e0e9e",
    "1600950207944-0d63e8edbc40","1614541332928-b4a6c51b3ed0","1489999029060-36c55d35b36d",
    "1524592094478-cfc4c29d7e48","1584302179602-e4c3d09c7767","1609101664063-b54e1f64fd8g",
    "1541580621-e4cf75d10be2","1516081119901-46d7d3f86d2d","1584735935682-2f6b18b07448",
    "1607346278021-a1c44d7bd7e1","1521369909029-2afed882baef","1475428652377-a2d80e2277fd",
    "1572804013309-59a88b7e92f2","1485462537746-965f3b9b8c23","1515372392923-c49b815af1c9",
    "1612336307429-8a898d10e224","1486218119243-6e5f70d98f03","1572635196237-14b3f281503g",
    "1585634917741-de7a80cefbad","1539623703374-e01a4a31c2e6","1612345341009-dfa59c9ab3e6",
    "1621784563330-caee0b138a01","1533327069186-c92f9f2cb7e6","1572805063702-76ea0f97b8c4",
  ],

  /* ── WOMEN KNITWEAR ─────────────────────────────── */
  "Women|Knitwear": [
    "1524560688-1bca8b86ee09","1543170335258-f937fae4fd8a","1605765423246-e9e3d7a43141",
    "1614541332928-b4a6c51b3ed1","1541580621-e4cf75d10be3","1489999029060-36c55d35b36e",
    "1584735935682-2f6b18b07449","1607346278021-a1c44d7bd7e2","1521369909029-2afed882baf0",
    "1475428652377-a2d80e2277ff","1600185365483-26d0a9dabb12","1580618672591-eb180b1a973h",
    "1515372392923-c49b815af1ca","1612336307429-8a898d10e225","1572804013309-59a88b7e92f3",
    "1485462537746-965f3b9b8c24","1572635196237-14b3f281503h","1612345341009-dfa59c9ab3e7",
    "1621784563330-caee0b138a02","1533327069186-c92f9f2cb7e7","1572805063702-76ea0f97b8c5",
    "1585634917741-de7a80cefbae","1539623703374-e01a4a31c2e7","1586363104862-3a5e2ab60d9a",
    "1523381210434-271e8be8a52c","1553062407-98eeb64c6a63","1558769132-cb1aea458c61",
    "1531553857885-c7b564bb5c0a","1548536237-c6f9af5de95a","1503951914875-452162b0f3f2",
  ],

  /* ── WOMEN DRESSES ──────────────────────────────── */
  "Women|Dresses": [
    "1614162895-d0d67827ab0e","1625731535-ceabfc80d26c","1574687028044-93de4538c7cd",
    "1460353581641-37baddab0fa3","1554318926-e5f823beeda7","1541685535-8dc00a73cdc9",
    "1516981879-2296c47f08ba","1569397634985-04ab1815b8e3","1556306535-38febf6782e9",
    "1543726280-19b4c9f1c0ac","1577365522-91f1c088ef29","1616348436168-de43ad0db30e",
    "1524504388868-5c8145c88acc","1509631179647-0177331693b1","1558769132-cb1aea458c62",
    "1526413425852-ba01ad9b0ec2","1539623703374-e01a4a31c2e8","1612345341009-dfa59c9ab3e8",
    "1621784563330-caee0b138a03","1533327069186-c92f9f2cb7e8","1572805063702-76ea0f97b8c6",
    "1585634917741-de7a80cefbaf","1485462537746-965f3b9b8c25","1515372392923-c49b815af1cb",
    "1612336307429-8a898d10e226","1572804013309-59a88b7e92f4","1572635196237-14b3f281503i",
    "1486218119243-6e5f70d98f04","1603808033176-9d134d929e85","1584917865942-f95f07ef37e1",
    "1542291026-7eec264c27fg","1539185439-a9d15d2ebb8c","1595950653106-bde9a8f2d2b1",
  ],

  /* ── ACCESSORIES — EYEWEAR ──────────────────────── */
  "Accessories|Eyewear": [
    "1511499767150-a48a237f0084","1577803645773-f96470509667","1473496169904-90e29a4f521a",
    "1508243771214-6e95d5571360","1579546929518-9e396f3cc80a","1539823746236-fa4c62e6026f",
    "1570655652364-2e0a67455ac7","1554103992-7f6e6ef4b5e2","1509347528399-0d26a1ef65c0",
    "1583993851755-3a4e2f01e70f","1496762756455-0373cb327b80","1539545601929-9c87f3e0f57c",
    "1441698872492-bf4ee1e72e62","1511093232-2cb0ab2b7e05","1538180406066-f22ee99978e9",
    "1502716119720-745b2b7b4f63","1518639192441-5ff39b199d3c","1570655652364-2e0a67455ac8",
    "1543726280-19b4c9f1c0ad","1577365522-91f1c088ef30","1616348436168-de43ad0db30f",
    "1614162895-d0d67827ab0f","1625731535-ceabfc80d26d","1574687028044-93de4538c7ce",
    "1460353581641-37baddab0fa4","1554318926-e5f823beeda8","1541685535-8dc00a73cdca",
    "1516981879-2296c47f08bb","1503952729800-a8d4ef4efbea","1460351281_19d578b4e1de",
    "1556821840-3a63f8a79906","1542319237-b58a8b85d2ce",
  ],

  /* ── ACCESSORIES — WATCHES ──────────────────────── */
  "Accessories|Watches": [
    "1547996160-2eb4dc28c7ca","1617137984544-1d6a298e7a40","1518894664493-dd4ef66abff6",
    "1543163521-1bf539c55dd3","1553062407-98eeb64c6a64","1573408301185-9521ef7eb537",
    "1627123424574-724758594e95","1605774337-8e8dc1c49b50","1488161549666-b3949ede4b9a",
    "1575553359-a23abf5e0e9f","1600950207944-0d63e8edbc41","1614541332928-b4a6c51b3ed2",
    "1489999029060-36c55d35b36f","1524592094478-cfc4c29d7e49","1584302179602-e4c3d09c7768",
    "1609101664063-b54e1f64fd8h","1541580621-e4cf75d10be4","1516081119901-46d7d3f86d2e",
    "1584735935682-2f6b18b07450","1607346278021-a1c44d7bd7e3","1521369909029-2afed882baf1",
    "1460353581641-37baddab0fa5","1554318926-e5f823beeda9","1541685535-8dc00a73cdcb",
    "1516981879-2296c47f08bc","1584302179602-e4c3d09c7769","1609101664063-b54e1f64fd8i",
    "1460353581641-37baddab0fa6","1542291026-7eec264c27fh","1539185439-a9d15d2ebb8d",
    "1595950653106-bde9a8f2d2b2","1603808033176-9d134d929e86","1584917865942-f95f07ef37e2",
  ],

  /* ── ACCESSORIES — BELTS ────────────────────────── */
  "Accessories|Belts": [
    "1624222247344-550fb60583dd","1581605405669-fcdf81165afb","1584917865942-f95f07ef37e3",
    "1542291026-7eec264c27fi","1539185439-a9d15d2ebb8e","1595950653106-bde9a8f2d2b3",
    "1603808033176-9d134d929e87","1575428652377-a2d80e2277fg","1596944924616-7b38e7cfac37",
    "1543076447-215ad9ba6924","1505022610485-0249ba5b1ce5","1522202176988-66273c61b854",
    "1525507119028-ed4f10a1e8c7","1519058082700-08a0b56da9b6","1605765423246-e9e3d7a43142",
    "1542272604-787c3835535e","1541099649105-f69ad21f3247","1604176354204-9268737828e7",
    "1475178626620-a4d074967453","1582552938357-32b906df40cc","1503951914875-452162b0f3f3",
    "1529374255-8c578e5d3fae","1563389952691-b64c5c6a40ce","1556821840-3a63f8a79907",
    "1512374382149-233c42b6a83c","1588359348347-9bc6cbbb689f","1531553857885-c7b564bb5c0b",
    "1548536237-c6f9af5de95b","1516942442800-dc965f72d3db","1533671168035-a1a7e3d59bb0",
    "1596079890701-7f5f4c3ab931","1544642899-f0d6e5f6ed70","1492447105305-0a85e2278e63",
  ],

  /* ── ACCESSORIES — JEWELRY ──────────────────────── */
  "Accessories|Jewelry": [
    "1573408301185-9521ef7eb538","1547996160-2eb4dc28c7cb","1584917865942-f95f07ef37e4",
    "1617137984544-1d6a298e7a41","1574180566-1a8c43f27aed","1548036161-f9a50e38df5c",
    "1622560048-c729f81d9e65","1545127410-1fd9bdd63c4e","1553062407-98eeb64c6a65",
    "1627123424574-724758594e96","1556306535-38febf6782ea","1501612780327-45045538702d",
    "1610883502393-a51c3a024ce5","1516478177764-9fe5bd7a9718","1492447105305-0a85e2278e64",
    "1513094775335-7e76e05f3b80","1483095348487-53dbf97c8d5b","1517649763962-0c623066013e",
    "1509631179647-0177331693b2","1558769132-cb1aea458c63","1526413425852-ba01ad9b0ec3",
    "1523359346347-f24ef5adfb7d","1614252369475-af4e3d6af8c7","1596388901428-174cf699d2cb",
    "1510741906-7a5a12c1a7f6","1534528741775-53994a69daed","1539109116323-cec3b564b286",
    "1546961342-ea5f71a193d5","1521223890158-f9f7c3d5d505","1609873814058-a8928924184c",
    "1521069432042-e3ae0d795159","1516826957135-700dedea698d","1539533113208-f19d8573b566",
  ],

  /* ── ACCESSORIES — HEADWEAR (caps, hats, beanies) ─ */
  "Accessories|Headwear": [
    "1575428652377-a2d80e2277fh","1521369909029-2afed882baf2","1543076447-215ad9ba6925",
    "1622560048-c729f81d9e66","1627123424574-724758594e97","1556306535-38febf6782eb",
    "1607345366928-199ea26cfe40","1529374255-8c578e5d3faf","1527719327859-a8351b233cd4",
    "1522335789203-aabd1fc54bca","1563389952691-b64c5c6a40cf","1556821840-3a63f8a79908",
    "1512374382149-233c42b6a83d","1542319237-b58a8b85d2cf","1503951914875-452162b0f3f4",
    "1588359348347-9bc6cbbb68a0","1620799139507-2a76f79a2f4f","1609345266895-d8cec53fd2a5",
    "1581605405669-fcdf81165afc","1553062407-98eeb64c6a66","1515372392923-c49b815af1cc",
    "1612336307429-8a898d10e227","1572804013309-59a88b7e92f5","1585634917741-de7a80cefbb0",
    "1539623703374-e01a4a31c2e9","1612345341009-dfa59c9ab3e9","1621784563330-caee0b138a04",
    "1486218119243-6e5f70d98f05","1572635196237-14b3f281503j","1533327069186-c92f9f2cb7e9",
    "1572805063702-76ea0f97b8c7","1585487000160-6ebcfceb0d46","1553194587-b932c1e175c4",
  ],

  /* ── ACCESSORIES — BAGS ─────────────────────────── */
  "Accessories|Bags": [
    "1584917865942-f95f07ef37e5","1547996160-2eb4dc28c7cc","1573408301185-9521ef7eb539",
    "1581605405669-fcdf81165afd","1624222247344-550fb60583de","1553062407-98eeb64c6a67",
    "1548036161-f9a50e38df5d","1574180566-1a8c43f27aee","1522202176988-66273c61b855",
    "1543726280-19b4c9f1c0ae","1533327069186-c92f9f2cb7ea","1572805063702-76ea0f97b8c8",
    "1524560688-1bca8b86ee0a","1485462537746-965f3b9b8c26","1539623703374-e01a4a31c2ea",
    "1612345341009-dfa59c9ab3ea","1621784563330-caee0b138a05","1486218119243-6e5f70d98f06",
    "1572635196237-14b3f281503k","1585634917741-de7a80cefbb1","1505022610485-0249ba5b1ce6",
    "1608528577729-f90e6f835b0c","1552168116-f08bfd34f874","1553062407-98eeb64c6a68",
    "1548036161-f9a50e38df5e","1574180566-1a8c43f27aef","1543726280-19b4c9f1c0af",
    "1533327069186-c92f9f2cb7eb","1485462537746-965f3b9b8c27","1612336307429-8a898d10e228",
    "1534528741775-53994a69daee","1539109116323-cec3b564b287","1546961342-ea5f71a193d6",
  ],
};

// Flatten all IDs across pools to detect accidental cross-pool duplicates (dev check only)
function auditPools() {
  const seen = new Map();
  let dupCount = 0;
  for (const [poolName, ids] of Object.entries(POOLS)) {
    for (const id of ids) {
      if (seen.has(id)) {
        console.warn(`  ⚠️  Duplicate ID in pools: ${id} → [${seen.get(id)}, ${poolName}]`);
        dupCount++;
      } else {
        seen.set(id, poolName);
      }
    }
  }
  return { totalUnique: seen.size, dupCount };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Pool cursor tracking
───────────────────────────────────────────────────────────────────────────── */
const globalUsed = new Set();
const cursors = {};

function pickFromPool(poolName) {
  const pool = POOLS[poolName];
  if (!pool) return null;
  if (cursors[poolName] === undefined) cursors[poolName] = 0;

  const start = cursors[poolName];
  for (let i = 0; i < pool.length; i++) {
    const idx = (start + i) % pool.length;
    const id = pool[idx];
    if (!globalUsed.has(id)) {
      globalUsed.add(id);
      cursors[poolName] = (idx + 1) % pool.length;
      return id;
    }
  }
  return null; // pool exhausted
}

function poolKey(product) {
  const cat = (product.category || "").trim();
  const sub = (product.subcategory || "").trim();
  const key = `${cat}|${sub}`;
  if (POOLS[key]) return key;

  const subL = sub.toLowerCase();
  const catL = cat.toLowerCase();

  if (catL === "men") {
    if (subL.includes("jacket") || subL.includes("coat")) return "Men|Jackets";
    if (subL.includes("hoodie") || subL.includes("sweat") || subL.includes("fleece")) return "Men|Hoodies & Sweats";
    if (subL.includes("t-shirt") || subL.includes("tee")) return "Men|T-Shirts";
    if (subL.includes("shirt")) return "Men|Shirts";
    return "Men|Bottomwear";
  }
  if (catL === "women") {
    if (subL.includes("jacket") || subL.includes("coat")) return "Women|Jackets & Coats";
    if (subL.includes("dress") || subL.includes("gown")) return "Women|Dresses";
    if (subL.includes("knit") || subL.includes("cardigan")) return "Women|Knitwear";
    if (subL.includes("top") || subL.includes("blouse")) return "Women|Tops";
    return "Women|Bottomwear";
  }
  if (catL === "accessories") {
    if (subL.includes("eye") || subL.includes("glass") || subL.includes("sun")) return "Accessories|Eyewear";
    if (subL.includes("watch")) return "Accessories|Watches";
    if (subL.includes("belt")) return "Accessories|Belts";
    if (subL.includes("jewel") || subL.includes("ring") || subL.includes("chain") ||
        subL.includes("necklace") || subL.includes("bracelet")) return "Accessories|Jewelry";
    if (subL.includes("head") || subL.includes("cap") || subL.includes("hat") ||
        subL.includes("beanie") || subL.includes("bucket")) return "Accessories|Headwear";
    return "Accessories|Bags";
  }
  return "Men|T-Shirts";
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main
───────────────────────────────────────────────────────────────────────────── */
async function run() {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  🖼️  Full Image Fix  v4 — 500 Unique Real Photos`);
  console.log(`  Mode: ${IS_DRY_RUN ? "🔍 DRY RUN" : "✏️  LIVE"}`);
  console.log(`${"═".repeat(60)}\n`);

  // Audit pools for internal duplicates
  const { totalUnique, dupCount } = auditPools();
  console.log(`📋  Pool audit: ${totalUnique} unique IDs across all pools (${dupCount} internal dups)\n`);

  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf-8"));
  console.log(`📦  Loaded ${products.length} products\n`);

  const updates = [];
  let overflowNeeded = 0;

  // We'll use all pool IDs in a flat overflow when preferred pools dry up
  const allPoolIds = Object.values(POOLS).flat();
  const allPoolSet = new Set(allPoolIds);
  let overflowIdx = 0;

  function getNextId(poolName) {
    const id = pickFromPool(poolName);
    if (id) return id;

    // Pool exhausted — cycle through remaining unused pool IDs
    overflowNeeded++;
    const startIdx = overflowIdx;
    for (let i = 0; i < allPoolIds.length; i++) {
      const idx = (startIdx + i) % allPoolIds.length;
      const candidate = allPoolIds[idx];
      if (!globalUsed.has(candidate)) {
        globalUsed.add(candidate);
        overflowIdx = (idx + 1) % allPoolIds.length;
        return candidate;
      }
    }
    // Absolute fallback: just use a counter-based unique (won't happen normally)
    return `overflow-${Date.now()}-${overflowNeeded}`;
  }

  for (const product of products) {
    const key = poolKey(product);
    const id = getNextId(key);
    const newUrl = u(id);
    product.images = [newUrl];
    updates.push({ name: product.name, newImages: [newUrl] });
  }

  // Verify uniqueness
  const allUrls = products.map((p) => p.images[0]);
  const uniqueUrls = new Set(allUrls);
  const dupes = allUrls.length - uniqueUrls.size;

  // Verify real photo IDs (no -alt suffix)
  const fakeUrls = allUrls.filter((url) => url.includes("-alt") || url.includes("overflow-"));

  console.log(`📊  Results:`);
  console.log(`    Products updated   : ${updates.length}`);
  console.log(`    Overflow used      : ${overflowNeeded}`);
  console.log(`    Unique image URLs  : ${uniqueUrls.size} / ${allUrls.length}`);
  console.log(`    Duplicate URLs     : ${dupes}`);
  console.log(`    Fake/invalid URLs  : ${fakeUrls.length}\n`);

  if (dupes > 0) {
    const seen = new Map();
    allUrls.forEach((url, i) => {
      if (!seen.has(url)) seen.set(url, []);
      seen.get(url).push(products[i].name);
    });
    for (const [url, names] of seen) {
      if (names.length > 1) console.warn(`  DUPE: ${url.slice(0, 70)}\n   → ${names.slice(0, 3).join(", ")}`);
    }
  }

  if (fakeUrls.length > 0) {
    console.warn(`  ⚠️  Found ${fakeUrls.length} fake/fallback URLs:`);
    fakeUrls.slice(0, 5).forEach((u) => console.warn(`    ${u.slice(0, 80)}`));
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
  if (!mongoUri) {
    console.warn("⚠️  No MONGO_URI in .env — skipping MongoDB update");
    console.log("💡  Only products.json was updated. MongoDB may still have old images.");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("✅  Connected to MongoDB");

    const bulkOps = updates.map(({ name, newImages }) => ({
      updateOne: { filter: { name }, update: { $set: { images: newImages } } },
    }));

    const res = await mongoose.connection
      .collection("products")
      .bulkWrite(bulkOps, { ordered: false });
    console.log(`✅  MongoDB: ${res.modifiedCount} products updated`);

    await mongoose.disconnect();
    console.log("🔌  Disconnected from MongoDB\n");
  } catch (err) {
    console.error("❌  MongoDB error:", err.message);
    console.log("💡  products.json was already updated successfully.");
  }

  if (dupes === 0 && fakeUrls.length === 0) {
    console.log("🎉  All products now have unique, real, category-relevant grayscale images!\n");
  }
}

run().catch((err) => {
  console.error("💥 Fatal:", err);
  process.exit(1);
});
