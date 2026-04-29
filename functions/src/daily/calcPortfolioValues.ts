import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

const db = admin.firestore();

// Runs at 16:30 KST (= 07:30 UTC) — after market close
export const calcPortfolioValues = onSchedule(
  { schedule: "30 7 * * *", timeZone: "UTC", region: "asia-northeast3" },
  async () => {
    const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);

    // Get today's approved sector scores
    const scoresDoc = await db.collection("publicScores").doc(today).get();
    if (!scoresDoc.exists) {
      console.error("No public scores for", today);
      return;
    }

    const sectorScores: Record<string, number> = {};
    for (const s of (scoresDoc.data()?.sectorScores ?? [])) {
      sectorScores[s.sectorId] = s.impactScore * 0.005; // dailyReturn
    }

    // Fetch all portfolios
    const portfoliosSnap = await db.collection("portfolios").get();
    const batch = db.batch();

    for (const portfolioDoc of portfoliosSnap.docs) {
      const portfolio = portfolioDoc.data();
      const allocations: { sectorId: string; weight: number }[] = portfolio.allocations ?? [];

      // Weighted daily return
      let dailyReturn = 0;
      for (const alloc of allocations) {
        const sectorReturn = sectorScores[alloc.sectorId] ?? 0;
        dailyReturn += alloc.weight * sectorReturn;
      }

      const currentValue: number = portfolio.currentValue ?? portfolio.startingValue ?? 1000000;
      const newValue = Math.round(currentValue * (1 + dailyReturn));
      const cumulativeReturn = (newValue - (portfolio.startingValue ?? 1000000)) / (portfolio.startingValue ?? 1000000);

      // Update portfolio
      batch.update(portfolioDoc.ref, {
        currentValue: newValue,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Write snapshot subcollection
      const snapshotRef = portfolioDoc.ref.collection("snapshots").doc(today);
      batch.set(snapshotRef, {
        id: today,
        date: today,
        value: newValue,
        dailyReturn,
        cumulativeReturn,
        allocations,
      });
    }

    await batch.commit();
    console.log(`calcPortfolioValues: updated ${portfoliosSnap.size} portfolios for ${today}`);
  }
);
