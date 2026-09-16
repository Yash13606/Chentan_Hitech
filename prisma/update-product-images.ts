/**
 * update-product-images.ts
 *
 * Updates existing products in the DB with real images scraped from
 * chetanhitech.com (IndiaMART CDN: imimg.com)
 *
 * Run with: npx tsx prisma/update-product-images.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });


// ─────────────────────────────────────────────────────
// REAL IMAGE URLS SCRAPED FROM www.chetanhitech.com
// All images are on imimg.com CDN (IndiaMART)
// Using 1000x1000 (full res) and 500x500 where available
// ─────────────────────────────────────────────────────

const PRODUCT_IMAGES: Record<string, string[]> = {
  // ── Combi Ovens ────────────────────────────────────
  "RAT-COMBI-101": [
    "https://5.imimg.com/data5/SELLER/Default/2026/4/600394973/XH/QG/BH/7018949/rational-combi-oven-1000x1000.png",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503508063/KS/BV/IH/7018949/commercial-combi-oven-1000x1000.png",
  ],
  "UNX-MARINE-CMB": [
    "https://5.imimg.com/data5/SELLER/Default/2026/9/643543803/BU/YJ/RU/7018949/unox-combi-oven-5-tray-electric-marine-for-ships-galley-versions-500x500.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2026/9/643527803/AN/HP/RY/7018949/mv-05-tray-combi-oven-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2026/9/643533271/FV/AX/QC/7018949/unox-combi-oven-5-tray-eletcric-marine-versions-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2026/9/643539909/VI/TP/WR/7018949/unox-combi-oven-5-tray-electric-marine-for-ships-galley-versions-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2026/9/643542688/OT/TD/KP/7018949/unox-combi-oven-5-tray-electric-marine-for-ships-galley-versions-1000x1000.png",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504399906/XJ/DB/KF/7018949/unox-combi-oven2-1-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2026/9/643821331/HL/NA/FN/7018949/marine-combi-oven-1000x1000.jpg",
  ],

  // ── Refrigeration ───────────────────────────────────
  "CEL-FKG-110": [
    "https://5.imimg.com/data5/SELLER/Default/2026/4/600394308/JD/SK/HT/7018949/celfrost-showcase-coolers-fkg-110-1000x1000.png",
    "https://5.imimg.com/data5/SELLER/Default/2026/4/600402404/GS/QH/WD/7018949/celfrost-showcase-coolers-fkg-110-1000x1000.png",
    "https://5.imimg.com/data5/SELLER/Default/2026/4/600402402/ZA/EN/PS/7018949/celfrost-showcase-coolers-fkg-110-1000x1000.png",
  ],
  "CEL-VGD-FRZ": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/500011849/PJ/RE/XM/7018949/celfrost-vertical-glass-door-freezer-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/8/331593057/ZA/TE/GP/7018949/celfrost-vertical-glass-door-freezer-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/8/331593859/HT/HR/PH/7018949/celfrost-vertical-glass-door-freezer-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2020/10/DG/KC/OE/7018949/celfrost-450-ltr-single-door-upright-freezer-500x500-500x500.jpg",
  ],
  "WST-BEER-COOL": [
    "https://5.imimg.com/data5/SELLER/Default/2023/8/332784113/CU/LR/QB/7018949/beer-beverage-coolers-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/8/332301868/PU/GS/ZQ/7018949/beer-beverage-coolers-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/8/332301874/NG/FT/RN/7018949/beer-beverage-coolers-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/8/332301880/RB/TY/UD/7018949/beer-beverage-coolers-1000x1000.jpg",
  ],
  "ADN-DRAWER-FRZ": [
    "https://5.imimg.com/data5/SELLER/Default/2023/8/331594320/BY/QV/PC/7018949/blast-chiller-shock-freezer-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/8/331595281/ZL/GG/JF/7018949/blast-chiller-shock-freezer-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/500011499/ID/RY/UU/7018949/blast-chiller-shock-freezer-1000x1000.jpg",
  ],

  // ── Dishwashing ─────────────────────────────────────
  "ELX-HOOD-DW": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503507813/EC/JE/UD/7018949/hoos-type-dishwasher-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503507814/UG/UZ/PC/7018949/hoos-type-dishwasher-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503507815/HB/QY/LC/7018949/hoos-type-dishwasher-1000x1000.jpg",
  ],
  "ELX-HOOD-DW-XL": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503505751/BS/KW/JE/7018949/canteen-dishwasher-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503505752/OG/IY/OW/7018949/canteen-dishwasher-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503505753/GJ/AK/NM/7018949/canteen-dishwasher-1000x1000.jpg",
  ],
  "ELX-RACK-CONV": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503507722/AP/BQ/DI/7018949/rack-conveyor-dishwasher-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503507721/HU/QE/DQ/7018949/rack-conveyor-dishwasher-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503507723/NI/ZK/MY/7018949/rack-conveyor-dishwasher-1000x1000.png",
  ],
  "ELX-FLIGHT-DW": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503504840/IM/AD/XA/7018949/flight-type-dishwasher-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503504841/DU/XA/DC/7018949/flight-type-dishwasher-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503504842/GP/JB/GI/7018949/flight-type-dishwasher-1000x1000.jpg",
  ],

  // ── Laundry ─────────────────────────────────────────
  "IFB-HWF33": [
    "https://5.imimg.com/data5/YV/WC/PQ/SELLER-7018949/laundry-machine-500x500.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/8/332296919/FL/GV/UF/7018949/new-generation-washer-extractor-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/8/332296923/TD/IX/GG/7018949/new-generation-washer-extractor-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504411647/KX/KH/NC/7018949/barrier-extractor-washing-machine21-1-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504411221/XU/SV/XF/7018949/barrier-extractor-washing-machine1-1000x1000.jpg",
  ],
  "IFB-DRYER-ID9": [
    "https://5.imimg.com/data5/SELLER/Default/2023/8/333099729/HA/XQ/BK/7018949/industrial-tumble-dryers-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/8/332269900/LT/NK/BD/7018949/industrial-tumble-dryers-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/8/332282201/SZ/BE/EJ/7018949/industrial-tumble-dryers-1000x1000.jpg",
  ],
  "IFB-AUTO-LMC": [
    "https://5.imimg.com/data5/SELLER/Default/2025/1/479930873/AX/JF/KM/7018949/washer-extractors-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/1/479932249/KG/WO/SR/7018949/industrial-washing-machine-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2026/4/600245713/ZK/VY/PA/7018949/heavy-duty-washing-machine-1000x1000.jpg",
  ],
  "IFB-IRON-FW": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504405565/ET/PT/XC/7018949/flat-work-ironer-calendering-machine3-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504405585/GP/BP/HU/7018949/flat-work-ironer-calendering-machine1-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504405591/KX/LV/DO/7018949/flat-work-ironer-calendering-machine2-1000x1000.jpg",
  ],

  // ── Bar Equipment ───────────────────────────────────
  "TRU-MB40": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503510680/GR/YL/XQ/7018949/commercial-ice-cube-making-machine-250x250.png",
  ],
  "IMC-ICE-100": [
    "https://5.imimg.com/data5/SELLER/Default/2025/10/554665327/IK/LR/VV/7018949/neptune-ifb-dishwasher-1000x1000.png",
  ],
  "ELX-ICE-AUTO": [
    "https://5.imimg.com/data5/HX/GM/MY-7018949/chapati-pressing-machine-cp20-250x250.png",
  ],

  // ── Food Processing ─────────────────────────────────
  "LAK-WET-GRND": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503515874/KM/VP/GG/7018949/automatic-chapati-making-machine-500x500.jpeg",
  ],
  "AKS-DOUGH-BALL": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503515874/KM/VP/GG/7018949/automatic-chapati-making-machine-500x500.jpeg",
  ],

  // ── Display & Service ───────────────────────────────
  "ALT-1200UP": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503497580/DM/WI/JV/7018949/plate-conveyor-system-for-dishwasher-machine-1000x1000.jpg",
  ],
  "ALT-WC-2DR": [
    "https://5.imimg.com/data5/SELLER/Default/2025/1/479940370/PI/WB/QM/7018949/glass-washing-machine111111-1-1000x1000.jpg",
  ],

  // ── Bakery ──────────────────────────────────────────
  "UNX-PIZZA-OVN": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504399313/ER/NT/WV/7018949/electrfolux-combi-oven3-1-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504399331/KZ/YI/DL/7018949/electrfolux-combi-oven2-1-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504399347/RS/LA/BY/7018949/electrfolux-combi-oven1-1-1000x1000.jpg",
  ],
  "AKS-DECK-3": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504402634/WC/QS/NU/7018949/combi-oven1-1-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504402655/DL/KG/HS/7018949/industrial-combi-oven2-1-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504402678/OF/SL/WQ/7018949/industrial-combi-oven3-1-1000x1000.jpg",
  ],

  // ── Cooking Equipment ────────────────────────────────
  "AKS-BURNER-1": [
    "https://5.imimg.com/data5/SELLER/Default/2026/4/600393378/MY/PY/VR/7018949/ss-chinese-range-500x500.png",
  ],
  "LOR-TILT-PAN": [
    "https://5.imimg.com/data5/SELLER/Default/2023/8/332409246/WE/CH/EV/7018949/hydro-extractor-500x500.jpg",
  ],

  // ── Housekeeping ────────────────────────────────────
  "IFB-IRON-FW-2": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504404363/GJ/RH/MI/7018949/hospital-ironing-machine1-1-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504404380/LO/GF/VX/7018949/hospital-ironing-machine2-1-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504404386/CP/CI/FM/7018949/hospital-ironing-machine3-1-1000x1000.jpg",
  ],
};

// Additional products from chapati + refrigeration that map to existing seed products
const ADDITIONAL_IMAGE_MAP: Record<string, string[]> = {
  "four-door-vertical-refrigerator": [
    "https://5.imimg.com/data5/SELLER/Default/2026/4/600393604/ZM/FO/QC/7018949/four-door-vertical-refrigerator-1000x1000.png",
  ],
  "chapati-making-machine": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503515874/KM/VP/GG/7018949/automatic-chapati-making-machine-500x500.jpeg",
  ],
  "undercounter-dishwasher": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503505336/TX/KJ/DU/7018949/undercounter-dishwasher-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503505338/BO/SU/BD/7018949/undercounter-dishwasher-1000x1000.png",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/503505337/NA/OO/GQ/7018949/undercounter-dishwasher-1000x1000.png",
  ],
  "vacuum-ironing-table": [
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504409000/TZ/VT/AU/7018949/vaccum-ironin-table1-1-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504409037/SS/BR/GE/7018949/vaccum-ironin-table2-1-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2025/4/504409053/RM/ZW/LJ/7018949/vaccum-ironin-table3-1-1000x1000.jpg",
  ],
  "dry-cleaning-machine": [
    "https://5.imimg.com/data5/SELLER/Default/2023/8/332285606/SJ/DD/ON/7018949/dry-cleaning-machine-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/8/332305720/AW/FQ/JO/7018949/dry-cleaning-machine-1000x1000.jpg",
    "https://5.imimg.com/data5/SELLER/Default/2023/8/332305723/MC/SY/RB/7018949/dry-cleaning-machine-1000x1000.jpg",
  ],
};

async function main() {
  console.log("🔄 Updating product images from chetanhitech.com...\n");

  let updated = 0;
  let skipped = 0;

  // Update by SKU
  for (const [sku, images] of Object.entries(PRODUCT_IMAGES)) {
    try {
      const product = await db.product.findUnique({ where: { sku } });
      if (!product) {
        console.log(`  ⚠️  SKU not found: ${sku}`);
        skipped++;
        continue;
      }

      await db.product.update({
        where: { sku },
        data: { images },
      });
      console.log(`  ✅ ${sku} — ${images.length} image(s)`);
      updated++;
    } catch (err) {
      console.error(`  ❌ Error updating ${sku}:`, err);
    }
  }

  console.log(`\n📊 Results: ${updated} updated, ${skipped} skipped`);

  // Show all products and their image counts
  const all = await db.product.findMany({
    select: { sku: true, title: true, images: true },
    orderBy: { sortOrder: "asc" },
  });

  console.log("\n📋 All products:");
  for (const p of all) {
    const count = (p.images as string[]).length;
    const icon = count > 0 ? "🖼️ " : "⚠️ ";
    console.log(`  ${icon} ${p.sku} — "${p.title.slice(0, 50)}" (${count} images)`);
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
