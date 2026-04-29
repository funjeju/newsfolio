import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

const db = admin.firestore();

// Runs every Friday at 17:00 KST (= 08:00 UTC)
export const calcWeeklyRankings = onSchedule(
  { schedule: "0 8 * * 5", timeZone: "UTC", region: "asia-northeast3" },
  async () => {
    const now = new Date(Date.now() + 9 * 3600000);
    const year = now.getFullYear();
    const week = getISOWeek(now);
    const period = `weekly_${year}W${String(week).padStart(2, "0")}`;

    // Fetch all running classes
    const classesSnap = await db.collection("classes").where("seasonState", "==", "running").get();

    for (const classDoc of classesSnap.docs) {
      const classId = classDoc.id;

      // Fetch individual portfolios for this class
      const portfoliosSnap = await db.collection("portfolios")
        .where("classId", "==", classId)
        .get();

      const entries: any[] = [];
      for (const pDoc of portfoliosSnap.docs) {
        const p = pDoc.data();
        const cumulativeReturn = p.startingValue > 0
          ? (p.currentValue - p.startingValue) / p.startingValue
          : 0;
        entries.push({
          rank: 0,
          ownerId: p.ownerId,
          ownerName: "",
          return: cumulativeReturn,
          score: cumulativeReturn,
          ownerType: p.ownerType,
        });
      }

      // Sort by return
      entries.sort((a, b) => b.return - a.return);
      entries.forEach((e, i) => { e.rank = i + 1; });

      const individualRanking = entries.filter(e => e.ownerType === "individual");
      const groupRanking = entries.filter(e => e.ownerType === "group");

      const rankingId = `class_${classId}_${period}`;
      await db.collection("rankings").doc(rankingId).set({
        id: rankingId,
        scope: "class",
        scopeId: classId,
        period,
        periodType: "weekly",
        groupRanking,
        individualRanking,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Weekly ranking for class ${classId}: ${entries.length} entries`);
    }
  }
);

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
