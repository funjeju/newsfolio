import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

const db = admin.firestore();

// Trigger: when a briefing transitions to approved/auto_approved,
// kick off portfolio value recalculation for that class
export const onBriefingApproved = onDocumentUpdated(
  { document: "briefings/{briefingId}", region: "asia-northeast3" },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    const wasApproved = before.status !== "approved" && before.status !== "auto_approved";
    const isNowApproved = after.status === "approved" || after.status === "auto_approved";

    if (!wasApproved || !isNowApproved) return;

    const classId: string = after.classId;
    const briefingDateRef: string = after.briefingDateRef;

    if (!classId || !briefingDateRef) return;

    console.log(`Briefing approved for class ${classId} on ${briefingDateRef}, triggering portfolio recalc`);

    // Find all portfolios for this class and mark them for recalculation
    const portfoliosSnap = await db.collection("portfolios")
      .where("classId", "==", classId)
      .get();

    if (portfoliosSnap.empty) {
      console.log("No portfolios found for class:", classId);
      return;
    }

    // Get approved sector scores for this date
    const scoresSnap = await db.collection("publicScores")
      .where("date", "==", briefingDateRef)
      .where("classId", "==", classId)
      .limit(1)
      .get();

    if (scoresSnap.empty) {
      console.log("No public scores found for class/date:", classId, briefingDateRef);
      return;
    }

    const scoresData = scoresSnap.docs[0].data();
    const sectorReturnMap: Record<string, number> = {};
    for (const s of (scoresData.sectorScores ?? [])) {
      // impactScore × 0.5% = dailyReturn
      sectorReturnMap[s.sectorId] = s.impactScore * 0.005;
    }

    const batch = db.batch();

    for (const portfolioDoc of portfoliosSnap.docs) {
      const portfolio = portfolioDoc.data();
      const allocations: { sectorId: string; weight: number }[] = portfolio.allocations ?? [];

      // Weighted daily return
      const weightedReturn = allocations.reduce((sum, a) => {
        const r = sectorReturnMap[a.sectorId] ?? 0;
        return sum + a.weight * r;
      }, 0);

      const newValue = Math.round(portfolio.currentValue * (1 + weightedReturn));

      // Update portfolio
      batch.update(portfolioDoc.ref, {
        currentValue: newValue,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Write snapshot
      const snapshotRef = db
        .collection("portfolios")
        .doc(portfolioDoc.id)
        .collection("snapshots")
        .doc(briefingDateRef);

      const cumulativeReturn = (newValue - portfolio.startingValue) / portfolio.startingValue;

      batch.set(snapshotRef, {
        date: briefingDateRef,
        value: newValue,
        dailyReturn: weightedReturn,
        cumulativeReturn,
        allocations,
      });
    }

    await batch.commit();
    console.log(`Portfolio recalc complete: ${portfoliosSnap.size} portfolios updated`);
  }
);
