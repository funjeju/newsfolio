import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { GoogleGenAI } from "@google/genai";
import { buildImpactScorePrompt, type ImpactScoreInput } from "@/lib/prompts/impactScore";
import { buildBriefingPrompt, type BriefingInput } from "@/lib/prompts/briefing";
import { FieldValue } from "firebase-admin/firestore";

// ── 섹터 키워드 ──────────────────────────────────────────────────
const SECTORS: Record<string, { name: string; keywords: string[] }> = {
  semiconductor: { name: "반도체",      keywords: ["반도체", "HBM", "DRAM", "삼성전자", "SK하이닉스", "메모리반도체"] },
  automotive:    { name: "자동차",      keywords: ["자동차", "전기차", "현대차", "기아", "EV", "배터리"] },
  game:          { name: "게임",        keywords: ["게임", "넥슨", "크래프톤", "넷마블", "NC소프트", "모바일게임"] },
  content:       { name: "콘텐츠",      keywords: ["OTT", "K콘텐츠", "넷플릭스", "드라마", "한류", "콘텐츠"] },
  travel:        { name: "여행",        keywords: ["항공", "여행", "관광", "대한항공", "아시아나", "항공권"] },
  green_energy:  { name: "친환경에너지", keywords: ["신재생에너지", "태양광", "풍력", "수소", "ESS", "탄소중립"] },
  food:          { name: "식품",        keywords: ["식품", "라면", "밀가루", "설탕", "원자재", "식료품"] },
  construction:  { name: "건설",        keywords: ["건설", "부동산", "PF부실", "아파트", "주택공급"] },
  geopolitics:   { name: "국제정세",    keywords: ["미중갈등", "관세", "지정학", "무역전쟁", "국제관계"] },
  global_trade:  { name: "글로벌무역",  keywords: ["수출", "해상운임", "물류", "컨테이너", "무역수지"] },
};

const SECTOR_ORDER = Object.keys(SECTORS);

// ── 유틸 ──────────────────────────────────────────────────────────
function getKSTDateStr(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

async function fetchNaverNews(
  keywords: string[]
): Promise<ImpactScoreInput["newsItems"]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];

  const headers = {
    "X-Naver-Client-Id": clientId,
    "X-Naver-Client-Secret": clientSecret,
  };

  const toItems = (data: any): ImpactScoreInput["newsItems"] =>
    (data.items ?? []).map((item: any) => ({
      title: item.title.replace(/<[^>]+>/g, ""),
      summary: item.description.replace(/<[^>]+>/g, ""),
      source: item.originallink?.match(/\/\/([^/]+)/)?.[1]?.replace("www.", "") ?? "",
      url: item.originallink ?? item.link ?? "",
      publishedAt: item.pubDate,
    }));

  // 1차: 메인 키워드 단독 검색 (AND 조건 없이 결과 최대화)
  const q1 = encodeURIComponent(keywords[0]);
  const [r1, r2] = await Promise.all([
    fetch(`https://openapi.naver.com/v1/search/news.json?query=${q1}&display=10&sort=date`, { headers, next: { revalidate: 0 } }),
    // 2차: 두 번째 키워드로 보조 검색
    keywords[1]
      ? fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(keywords[1])}&display=5&sort=date`, { headers, next: { revalidate: 0 } })
      : Promise.resolve(null),
  ]);

  const items1 = r1.ok ? toItems(await r1.json()) : [];
  const items2 = r2?.ok ? toItems(await r2.json()) : [];

  // 제목 기준 중복 제거 후 최대 10개
  const seen = new Set<string>();
  const merged: ImpactScoreInput["newsItems"] = [];
  for (const item of [...items1, ...items2]) {
    if (!seen.has(item.title)) {
      seen.add(item.title);
      merged.push(item);
      if (merged.length >= 10) break;
    }
  }
  return merged;
}

// ── 영향도 점수 생성 ───────────────────────────────────────────────
interface ScoreResult {
  sectorId: string;
  impactScore: number;
  dailyReturn: number;
  duration: "short" | "medium" | "long";
  risk: "low" | "mid" | "high";
  rationale: string;
  newsItems: { title: string; summary: string; source: string; url: string; publishedAt: string }[];
}

async function generateImpactScore(
  ai: GoogleGenAI,
  sectorId: string,
  date: string,
  previousScore?: number
): Promise<ScoreResult> {
  const sector = SECTORS[sectorId];
  const newsItems = await fetchNaverNews(sector.keywords);

  const input: ImpactScoreInput = {
    date,
    sectorId,
    sectorName: sector.name,
    sectorKeywords: sector.keywords,
    newsItems,
    previousScore,
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: buildImpactScorePrompt(input),
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text ?? "{}");
    const impactScore = Math.max(-5, Math.min(5, Math.round(Number(parsed.impactScore ?? 0))));
    // dailyReturn: ±(0.7~1.1) per point + small noise
    const multiplier = 0.75 + Math.random() * 0.35;
    const noise = (Math.random() - 0.5) * 0.2;
    const dailyReturn = parseFloat((impactScore * multiplier + noise).toFixed(2));

    return {
      sectorId,
      impactScore,
      dailyReturn,
      duration: parsed.duration ?? "short",
      risk: parsed.risk ?? "mid",
      rationale: parsed.rationale ?? "",
      newsItems,
    };
  } catch (err) {
    console.error(`[daily/run] Impact score failed for ${sectorId}:`, err);
    return { sectorId, impactScore: 0, dailyReturn: 0, duration: "short", risk: "mid", rationale: "", newsItems: [] };
  }
}

// ── 브리핑 텍스트 생성 (클래스별 톤) ─────────────────────────────
async function generateBriefingHeadline(
  ai: GoogleGenAI,
  input: BriefingInput
): Promise<{ headline: string; intro: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: buildBriefingPrompt(input),
      config: { responseMimeType: "application/json" },
    });
    const parsed = JSON.parse(response.text ?? "{}");
    return {
      headline: parsed.headline ?? "오늘의 경제 뉴스 브리핑",
      intro: parsed.intro ?? "",
    };
  } catch {
    return { headline: "오늘의 경제 뉴스 브리핑", intro: "" };
  }
}

// ── 메인 핸들러 ───────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // 1. 인증
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = getKSTDateStr();
  const runLog: string[] = [`[${date}] daily/run started`];

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    // 2. 중복 실행 방지
    const existing = await db.collection("publicScores").doc(date).get();
    if (existing.exists) {
      return NextResponse.json({ skipped: true, date, reason: "already generated" });
    }

    // 3. 전날 점수 조회 (rankChange 계산용)
    const yesterday = new Date(Date.now() - 86400000 + 9 * 3600000);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const prevDoc = await db.collection("publicScores").doc(yesterdayStr).get();
    const prevScores: Record<string, number> = {};
    if (prevDoc.exists) {
      const prevData = prevDoc.data() as any;
      for (const s of (prevData?.sectorScores ?? [])) {
        prevScores[s.sectorId] = s.rank;
      }
    }

    // 4. 전날 impactScore (rankChange용)
    const prevImpact: Record<string, number> = {};
    if (prevDoc.exists) {
      const prevData = prevDoc.data() as any;
      for (const s of (prevData?.sectorScores ?? [])) {
        prevImpact[s.sectorId] = s.impactScore;
      }
    }

    // 5. 섹터별 영향도 병렬 생성
    runLog.push("Generating impact scores...");
    const rawScores = await Promise.all(
      SECTOR_ORDER.map(id => generateImpactScore(ai, id, date, prevImpact[id]))
    );

    // 6. 랭킹 계산
    const sorted = [...rawScores].sort((a, b) => b.impactScore - a.impactScore);
    const sectorScores = sorted.map((s, i) => {
      const todayRank = i + 1;
      const prevRank = prevScores[s.sectorId] ?? todayRank;
      return {
        sectorId: s.sectorId,
        sectorName: SECTORS[s.sectorId].name,
        sectorIcon: getSectorIcon(s.sectorId),
        impactScore: s.impactScore,
        dailyReturn: s.dailyReturn,
        duration: s.duration,
        risk: s.risk,
        rank: todayRank,
        rankChange: prevRank - todayRank,   // 양수 = 순위 상승
        rationale: s.rationale,
        keyNewsIds: [],
      };
    });

    runLog.push(`Impact scores: ${sectorScores.map(s => `${s.sectorId}:${s.impactScore}`).join(", ")}`);

    // 7. publicScores 저장 (sectorNews 포함)
    const sectorNews: Record<string, { title: string; summary: string; source: string; url: string; publishedAt: string }[]> = {};
    for (const r of rawScores) {
      sectorNews[r.sectorId] = r.newsItems.map(n => ({
        title: n.title,
        summary: n.summary,
        source: n.source,
        url: n.url,
        publishedAt: n.publishedAt,
      }));
    }

    await db.collection("publicScores").doc(date).set({
      id: date,
      date,
      toneLevel: 3,
      sectorScores,
      sectorNews,
      headline: "",                         // 아래에서 업데이트
      generatedAt: FieldValue.serverTimestamp(),
      publishedAt: FieldValue.serverTimestamp(),
    });
    runLog.push("publicScores saved");

    // 8. 활성 클래스 조회
    const classSnap = await db.collection("classes")
      .where("seasonState", "in", ["running", "ready"])
      .get();
    runLog.push(`Active classes: ${classSnap.size}`);

    // 9. 클래스별 브리핑 생성 (병렬)
    const briefingTasks = classSnap.docs.map(async (classDoc) => {
      const cls = classDoc.data() as any;
      const classId: string = classDoc.id;
      const toneLevel: 1 | 2 | 3 | 4 = cls.toneLevel ?? 3;

      const briefingInput: BriefingInput = {
        date,
        classId,
        toneLevel,
        sectorScores: sectorScores.map(s => ({
          sectorName: s.sectorName,
          impactScore: s.impactScore,
          rationale: s.rationale,
          rank: s.rank,
          rankChange: s.rankChange,
        })),
      };

      const { headline, intro } = await generateBriefingHeadline(ai, briefingInput);
      const briefingId = `${date}_${classId}`;

      await db.collection("briefings").doc(briefingId).set({
        id: briefingId,
        date,
        classId,
        toneLevel,
        aiDraft: {
          headline,
          sectorImpacts: sectorScores,
          generatedAt: FieldValue.serverTimestamp(),
          promptVersion: "v1",
        },
        status: cls.confirmationMode === "ai_auto" ? "auto_approved" : "pending_review",
        cardNewsPublished: false,
      });

      return { classId, headline };
    });

    const briefingResults = await Promise.allSettled(briefingTasks);
    const succeeded = briefingResults.filter(r => r.status === "fulfilled").length;
    runLog.push(`Briefings created: ${succeeded}/${classSnap.size}`);

    // 10. 포트폴리오 수익률 반영 (그룹 + 개인 솔로 모두)
    const portfolioSnap = await db.collection("portfolios").get();

    const portfolioTasks = portfolioSnap.docs.map(async (pDoc) => {
      const portfolio = pDoc.data() as any;
      const allocations: { sectorId: string; weight: number }[] = portfolio.allocations ?? [];

      // 가중평균 수익률
      const dailyReturn = allocations.reduce((sum, alloc) => {
        const score = sectorScores.find(s => s.sectorId === alloc.sectorId);
        return sum + (score?.dailyReturn ?? 0) * alloc.weight;
      }, 0);

      const prevValue: number = portfolio.currentValue ?? portfolio.startingValue ?? 1_000_000;
      const newValue = Math.round(prevValue * (1 + dailyReturn / 100));

      // 포트폴리오 값 업데이트
      await pDoc.ref.update({
        currentValue: newValue,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // 일별 스냅샷 저장
      await pDoc.ref.collection("snapshots").doc(date).set({
        id: date,
        date,
        value: newValue,
        dailyReturn: parseFloat(dailyReturn.toFixed(2)),
        cumulativeReturn: parseFloat(((newValue / (portfolio.startingValue ?? 1_000_000) - 1) * 100).toFixed(2)),
        allocations,
      });
    });

    await Promise.allSettled(portfolioTasks);
    runLog.push(`Portfolio snapshots: ${portfolioSnap.size}`);

    return NextResponse.json({ ok: true, date, log: runLog });

  } catch (err: any) {
    console.error("[daily/run] Fatal error:", err);
    return NextResponse.json({ ok: false, date, error: err.message, log: runLog }, { status: 500 });
  }
}

function getSectorIcon(id: string): string {
  const icons: Record<string, string> = {
    semiconductor: "💻", automotive: "🚗", game: "🎮", content: "🎬",
    travel: "✈️", green_energy: "🌱", food: "🍔", construction: "🏗️",
    geopolitics: "🌐", global_trade: "🚢",
  };
  return icons[id] ?? "📊";
}
