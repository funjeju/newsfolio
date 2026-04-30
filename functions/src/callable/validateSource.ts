import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenAI } from "@google/genai";

interface ValidateSourceRequest {
  url: string;
  title: string;
  summary?: string;
  sectorId: string;
  classId: string;
}

interface ValidationResult {
  credibilityScore: number;       // 0~1
  isPromotional: boolean;
  isAgeAppropriate: boolean;
  domainType: "news" | "blog" | "sns" | "official" | "other";
  feedback: string;               // feedback in Korean for students
  warningLevel: "none" | "mild" | "strong";
}

function buildValidationPrompt(req: ValidateSourceRequest): string {
  return `당신은 초중등 학생을 위한 뉴스 출처 신뢰도 검증 AI입니다.
학생이 제출한 뉴스 출처를 평가해주세요.

## 출처 정보
- URL: ${req.url}
- 제목: ${req.title}
- 요약: ${req.summary ?? "(없음)"}
- 관련 섹터: ${req.sectorId}

## 평가 기준
1. 신뢰도 (0~1): 주요 언론사/공식 기관 = 0.8~1.0, 일반 블로그 = 0.3~0.6, SNS = 0.1~0.4
2. 홍보성 여부: 특정 기업/제품을 광고하는 내용인지
3. 연령 적절성: 초중등 학생에게 적합한 내용인지
4. 도메인 유형: news / blog / sns / official / other

## 출력 형식 (JSON)
{
  "credibilityScore": 0.0~1.0,
  "isPromotional": false,
  "isAgeAppropriate": true,
  "domainType": "news",
  "feedback": "학생에게 주는 피드백 (한국어, 1~2문장, 칭찬 or 주의사항)",
  "warningLevel": "none"
}

JSON만 출력하세요.`;
}

export const validateSource = onCall(
  { region: "asia-northeast3", maxInstances: 10 },
  async (request) => {
    // Auth check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "로그인이 필요합니다.");
    }

    const data = request.data as ValidateSourceRequest;
    if (!data.url || !data.title || !data.sectorId || !data.classId) {
      throw new HttpsError("invalid-argument", "필수 필드가 누락됐습니다.");
    }

    // Basic URL safety check
    const urlLower = data.url.toLowerCase();
    if (!urlLower.startsWith("http://") && !urlLower.startsWith("https://")) {
      throw new HttpsError("invalid-argument", "올바른 URL 형식이 아닙니다.");
    }

    try {
      const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = buildValidationPrompt(data);

      const response = await genai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });

      const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const result: ValidationResult = JSON.parse(raw);

      // Clamp credibilityScore
      result.credibilityScore = Math.min(1, Math.max(0, result.credibilityScore));

      return result;
    } catch (err: any) {
      console.error("validateSource error:", err);
      throw new HttpsError("internal", "출처 검증 중 오류가 발생했어요.");
    }
  }
);
