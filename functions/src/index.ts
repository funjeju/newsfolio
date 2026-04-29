import * as admin from "firebase-admin";

admin.initializeApp();

// Daily pipeline — scheduled Cloud Functions (Gen 2)
export { collectNews } from "./daily/collectNews";
export { calcImpactScores } from "./daily/calcImpactScores";
export { generateBriefings } from "./daily/generateBriefings";
export { calcPortfolioValues } from "./daily/calcPortfolioValues";
export { publishCardNews } from "./daily/publishCardNews";
export { announceBestAnalyst } from "./daily/announceBestAnalyst";

// Triggers
export { onObjectionCreated } from "./triggers/onObjectionCreated";
export { onBriefingApproved } from "./triggers/onBriefingApproved";

// Callable
export { validateSource } from "./callable/validateSource";

// Weekly
export { calcWeeklyRankings } from "./weekly/calcWeeklyRankings";
export { issueWeeklyAwards } from "./weekly/issueWeeklyAwards";

// Monthly
export { calcMonthlyRankings } from "./monthly/calcMonthlyRankings";
export { generateMonthlyRetro } from "./monthly/generateMonthlyRetro";
