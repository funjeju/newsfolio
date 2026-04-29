import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

const db = admin.firestore();

const NEWS_COLLECT_PROMPT = `오늘 한국 경제 뉴스 중 다음 섹터에 영향을 줄 수 있는 기사 10~20개를 수집해주세요.

섹터 목록: 반도체, 자동차, 게임, 콘텐츠·연예, 여행·관광, 친환경에너지, 식품, 건설, 국제정세, 글로벌무역

각 기사를 다음 JSON 배열 형식으로 반환하세요:
[
  {
    "title": "기사 제목",
    "summary": "2~3문장 요약",
    "source": "출처명",
    "domain": "domain.com",
    "url": "https://...",
    "sectorTags": ["반도체", "글로벌무역"],
    "credibilityScore": 0.85,
    "isPromotional": false,
    "isAgeAppropriate": true
  }
]

JSON 배열만 반환하세요.`;

// Runs daily at 05:00 KST (= 20:00 UTC)
export const collectNews = onSchedule(
  { schedule: "0 20 * * *", timeZone: "UTC", region: "asia-northeast3" },
  async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not set");
      return;
    }

    const genai = new GoogleGenAI({ apiKey });
    const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);

    try {
      const response = await genai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: NEWS_COLLECT_PROMPT }] }],
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.3,
        },
      });

      const text = response.text ?? "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error("No JSON found in Gemini response");
        return;
      }

      const articles: any[] = JSON.parse(jsonMatch[0]);
      const batch = db.batch();

      for (const article of articles) {
        const ref = db.collection("newsItems").doc();
        batch.set(ref, {
          ...article,
          publishedAt: admin.firestore.FieldValue.serverTimestamp(),
          submittedBy: "ai",
          briefingDateRef: today,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();
      console.log(`Collected ${articles.length} news articles for ${today}`);
    } catch (err) {
      console.error("collectNews error:", err);
    }
  }
);
