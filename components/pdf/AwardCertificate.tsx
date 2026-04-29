import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";

// @react-pdf/renderer는 서버 컴포넌트 또는 API route에서만 사용 가능
// 클라이언트에서 사용 시 dynamic import 필요

const AWARD_TYPE_LABELS: Record<string, string> = {
  best_analyst:    "최우수 애널리스트",
  best_objector:   "최우수 이의제기",
  most_active:     "최다 활동",
  best_group:      "최우수 조",
  comeback_king:   "역전의 왕",
  steady_investor: "꾸준한 투자자",
  weekly_winner:   "주간 챔피언",
  monthly_mvp:     "월간 MVP",
};

const AWARD_TYPE_EMOJI: Record<string, string> = {
  best_analyst:    "🏆",
  best_objector:   "🎯",
  most_active:     "⚡",
  best_group:      "🥇",
  comeback_king:   "👑",
  steady_investor: "🌟",
  weekly_winner:   "🎖️",
  monthly_mvp:     "🏅",
};

export interface AwardCertificateData {
  awardType: string;
  recipientName: string;
  groupName?: string;
  schoolName: string;
  className: string;
  period: string;
  reason: string;
  teacherName: string;
  issuedAt: string;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#0A0A1A",
    padding: 40,
    fontFamily: "Helvetica",
    position: "relative",
  },
  // 배경 장식
  bgGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // 테두리
  border: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 2,
    borderColor: "#818CF8",
    borderStyle: "solid",
  },
  // 내용 컨테이너
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  // 헤더
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    color: "#818CF8",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  awardType: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  // 수상자
  recipientLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 6,
    marginTop: 16,
  },
  recipientName: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: "#F9FAFB",
    marginBottom: 4,
  },
  groupName: {
    fontSize: 14,
    color: "#818CF8",
    marginBottom: 16,
  },
  // 구분선
  divider: {
    width: 80,
    height: 2,
    backgroundColor: "#818CF8",
    marginVertical: 16,
  },
  // 이유
  reasonBox: {
    backgroundColor: "#1A1A2E",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 40,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2D2D4A",
    borderStyle: "solid",
    width: "80%",
  },
  reasonText: {
    fontSize: 11,
    color: "#D1D5DB",
    lineHeight: 1.6,
    textAlign: "center",
  },
  // 기간 / 반 정보
  metaRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
  },
  metaItem: {
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#E5E7EB",
  },
  // 하단 서명
  footer: {
    alignItems: "center",
    marginTop: 8,
  },
  schoolName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#F9FAFB",
    marginBottom: 2,
  },
  teacherInfo: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  issuedAt: {
    fontSize: 9,
    color: "#6B7280",
  },
  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 8,
  },
  // Newsfolio 브랜드
  brand: {
    position: "absolute",
    bottom: 28,
    right: 32,
    fontSize: 9,
    color: "#374151",
  },
});

export function AwardCertificate({ data }: { data: AwardCertificateData }) {
  const awardLabel = AWARD_TYPE_LABELS[data.awardType] ?? data.awardType;
  const emoji = AWARD_TYPE_EMOJI[data.awardType] ?? "🏆";

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* 테두리 장식 */}
        <View style={styles.border} />

        {/* 코너 장식 */}
        {[
          { top: 28, left: 28 },
          { top: 28, right: 28 },
          { bottom: 28, left: 28 },
          { bottom: 28, right: 28 },
        ].map((pos, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              width: 12,
              height: 12,
              borderTopWidth: i < 2 ? 2 : 0,
              borderBottomWidth: i >= 2 ? 2 : 0,
              borderLeftWidth: i % 2 === 0 ? 2 : 0,
              borderRightWidth: i % 2 === 1 ? 2 : 0,
              borderColor: "#F59E0B",
              borderStyle: "solid",
              ...pos,
            }}
          />
        ))}

        {/* 본문 */}
        <View style={styles.content}>
          {/* 이모지 + 상 이름 */}
          <View style={styles.header}>
            <Text style={styles.title}>NEWSFOLIO AWARD</Text>
            <Text style={styles.awardType}>{awardLabel}</Text>
          </View>

          {/* 수상자 */}
          <Text style={styles.recipientLabel}>이 상장을 다음 분께 드립니다</Text>
          <Text style={styles.recipientName}>{data.recipientName}</Text>
          {data.groupName && (
            <Text style={styles.groupName}>{data.groupName}</Text>
          )}

          <View style={styles.divider} />

          {/* 수상 이유 */}
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText}>{data.reason}</Text>
          </View>

          {/* 메타 정보 */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>기간</Text>
              <Text style={styles.metaValue}>{data.period}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>반</Text>
              <Text style={styles.metaValue}>{data.className}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>발행일</Text>
              <Text style={styles.metaValue}>{data.issuedAt}</Text>
            </View>
          </View>

          {/* 서명 영역 */}
          <View style={styles.footer}>
            <Text style={styles.schoolName}>{data.schoolName}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.teacherInfo}>{data.teacherName} 선생님</Text>
          </View>
        </View>

        {/* 브랜드 워터마크 */}
        <Text style={styles.brand}>Newsfolio AI Economic Simulation</Text>
      </Page>
    </Document>
  );
}
