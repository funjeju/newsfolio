import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

const db = admin.firestore();

// 1st of each month at 01:00 KST (16:00 UTC previous day)
export const calcMonthlyRankings = onSchedule(
  { schedule: "0 16 28-31 * *", timeZone: "Asia/Seoul", region: "asia-northeast3" },
  async () => {
    const now = new Date();
    // Only run on last day of month
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (tomorrow.getDate() !== 1) return;

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const period = `${year}-${month}`;

    const classesSnap = await db.collection("classes")
      .where("seasonState", "in", ["running", "final_week"])
      .get();

    const batch = db.batch();

    for (const classDoc of classesSnap.docs) {
      const classId = classDoc.id;

      // Individual rankings
      const indivPortfolios = await db.collection("portfolios")
        .where("classId", "==", classId)
        .where("ownerType", "==", "individual")
        .orderBy("currentValue", "desc")
        .get();

      const indivRanks = indivPortfolios.docs.map((doc, index) => {
        const p = doc.data();
        return {
          rank: index + 1,
          ownerId: p.ownerId,
          currentValue: p.currentValue,
          cumulativeReturn: (p.currentValue - p.startingValue) / p.startingValue,
        };
      });

      // Group rankings
      const groupPortfolios = await db.collection("portfolios")
        .where("classId", "==", classId)
        .where("ownerType", "==", "group")
        .orderBy("currentValue", "desc")
        .get();

      const groupRanks = groupPortfolios.docs.map((doc, index) => {
        const p = doc.data();
        return {
          rank: index + 1,
          ownerId: p.ownerId,
          currentValue: p.currentValue,
          cumulativeReturn: (p.currentValue - p.startingValue) / p.startingValue,
        };
      });

      const rankingRef = db.collection("rankings").doc(`${classId}_${period}`);
      batch.set(rankingRef, {
        classId,
        period,
        type: "monthly",
        individual: indivRanks,
        group: groupRanks,
        calculatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    console.log(`Monthly rankings calculated for ${period}: ${classesSnap.size} classes`);
  }
);
