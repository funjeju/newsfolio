/**
 * Firestore seed script — run with:
 *   npx tsx scripts/seedFirestore.ts
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account JSON.
 */

import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Initialize admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function seedGlossary() {
  const glossaryPath = path.join(__dirname, "../seed/glossary.json");
  const terms: any[] = JSON.parse(fs.readFileSync(glossaryPath, "utf-8"));

  console.log(`Seeding ${terms.length} glossary terms...`);
  const batch = db.batch();

  for (const term of terms) {
    const ref = db.collection("glossary").doc(
      term.term.replace(/\s+/g, "_").toLowerCase()
    );
    batch.set(ref, {
      ...term,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`✓ Glossary seeded: ${terms.length} terms`);
}

async function seedDomains() {
  const domainsPath = path.join(__dirname, "../seed/domains.json");
  const domains: any[] = JSON.parse(fs.readFileSync(domainsPath, "utf-8"));

  console.log(`Seeding ${domains.length} trusted domains...`);
  const batch = db.batch();

  for (const domain of domains) {
    const ref = db.collection("trustedDomains").doc(
      domain.domain.replace(/\s+/g, "_").toLowerCase()
    );
    batch.set(ref, {
      ...domain,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`✓ Domains seeded: ${domains.length} entries`);
}

async function seedSectors() {
  const SECTORS = [
    { id: "semiconductor",  name: "반도체",       icon: "💻", order: 1 },
    { id: "automotive",     name: "자동차",        icon: "🚗", order: 2 },
    { id: "game",           name: "게임",          icon: "🎮", order: 3 },
    { id: "content",        name: "콘텐츠·연예",   icon: "🎬", order: 4 },
    { id: "travel",         name: "여행·관광",     icon: "✈️", order: 5 },
    { id: "green_energy",   name: "친환경에너지",   icon: "🌱", order: 6 },
    { id: "food",           name: "식품",          icon: "🍔", order: 7 },
    { id: "construction",   name: "건설",          icon: "🏗️", order: 8 },
    { id: "geopolitics",    name: "국제정세",       icon: "🌐", order: 9 },
    { id: "global_trade",   name: "글로벌무역",     icon: "🚢", order: 10 },
  ];

  console.log(`Seeding ${SECTORS.length} sectors...`);
  const batch = db.batch();

  for (const sector of SECTORS) {
    const ref = db.collection("sectors").doc(sector.id);
    batch.set(ref, {
      ...sector,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`✓ Sectors seeded: ${SECTORS.length} entries`);
}

async function main() {
  console.log("Starting Firestore seed...\n");

  await seedSectors();
  await seedGlossary();
  await seedDomains();

  console.log("\n✅ All seed data committed to Firestore.");
  process.exit(0);
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
