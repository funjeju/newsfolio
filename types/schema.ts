// types/schema.ts — Newsfolio Full TypeScript Interfaces (PART2 명세 완전 구현)
import { Timestamp } from 'firebase/firestore';

// ============================================
// SHARED TYPES
// ============================================

export type UserRole = 'system_admin' | 'school_admin' | 'teacher' | 'student';
export type ToneLevel = 1 | 2 | 3 | 4;
export type SeasonState = 'draft' | 'setup' | 'ready' | 'running' | 'final_week' | 'finished';
export type ConfirmationMode = 'always_teacher' | 'ai_auto' | 'mixed';
export type GroupChangePermission = 'leader_only' | 'any_member';
export type GroupFormationMethod = 'auto' | 'manual';
export type StudentRole = 'analyst' | 'researcher' | 'reporter' | 'critic' | 'editor' | 'auditor';
export type ImpactDuration = 'short' | 'medium' | 'long';
export type ImpactRisk = 'low' | 'mid' | 'high';
export type ScoreVersion = 'ai_draft' | 'after_objections' | 'final';
export type ApprovalStatus = 'pending' | 'accepted' | 'rejected' | 'partial';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';
export type BriefingStatus = 'draft' | 'pending_review' | 'approved' | 'auto_approved';
export type AwardType =
  | 'weekly_winner' | 'monthly_winner' | 'season_champion'
  | 'grand_champion' | 'best_analyst' | 'best_collaboration'
  | 'rookie_award' | 'persistence_award';
export type ReportType =
  | 'card_news' | 'magazine' | 'weekly_brief' | 'monthly_brief' | 'season_summary';

// ============================================
// 1. SCHOOLS
// ============================================

export interface School {
  id: string;
  name: string;
  address: string;
  logoUrl: string;
  schoolCode: string;             // 8-char auto-generated
  adminIds: string[];
  gradeStructure: { grade: number; classCount: number }[];
  defaultWhitelistDomains: string[];
  startingValue: number;          // Default portfolio start (1,000,000)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// 2. USERS
// ============================================

export interface User {
  id: string;
  role: UserRole;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  schoolId?: string;
  classId?: string;
  groupId?: string;
  studentRosterId?: string;
  realName?: string;
  nickname?: string;
  grade?: number;
  status?: 'active' | 'inactive';
  teachingClassIds?: string[];
  position?: string;
  profileImageUrl?: string;
  badges?: string[];
  awards?: string[];
}

// ============================================
// 3. STUDENT ROSTER
// ============================================

export interface StudentRoster {
  id: string;
  classId: string;
  realName: string;
  studentNumber?: number;
  status: 'pending' | 'claimed';
  claimedByUserId?: string;
  claimedAt?: Timestamp;
  uploadedBy: string;
  uploadedAt: Timestamp;
}

// ============================================
// 4. CLASSES
// ============================================

export interface PreflightCheckItems {
  classInfo: boolean;
  sectorsActivated: boolean;
  schedule: boolean;
  studentsRegistered: boolean;
  groupsMatched: boolean;
  groupChangePermission: boolean;
  confirmationMode: boolean;
  whitelistDomains: boolean;        // optional
  parentNotification: boolean;      // optional
  learningMaterial: boolean;        // auto
}

export interface PreflightCheck {
  items: PreflightCheckItems;
  allRequiredPassed: boolean;
  lastChecked: Timestamp;
}

export interface Class {
  id: string;
  schoolId: string;
  className: string;                // "5학년 3반"
  grade: number;
  classNumber: number;
  teacherId: string;
  toneLevel: ToneLevel;
  toneOverride: boolean;
  currentSeasonId: string;
  seasonState: SeasonState;
  activeSectors: string[];
  briefingTime: string;             // "06:00"
  confirmDeadline: string;          // "16:00"
  groupChangePermission: GroupChangePermission;
  confirmationMode: ConfirmationMode;
  groupFormationMethod: GroupFormationMethod;
  classCode: string;
  weeklyAwardDay: 'FR';
  monthlyAwardDay: 'last_friday';
  studentCount: number;
  groupCount: number;
  startingValueOverride?: number;
  preflightCheck: PreflightCheck;
  startedAt?: Timestamp;
  startedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// 5. GROUPS
// ============================================

export interface RoleAssignment {
  userId: string;
  role: StudentRole;
  sectorIds: string[];
}

export interface Group {
  id: string;
  classId: string;
  groupName: string;
  groupNumber: number;
  memberIds: string[];
  leaderId?: string;
  roleAssignments: RoleAssignment[];
  currentMainSectors: string[];
  mainSectorChangedAt: Timestamp;
  formationMethod: GroupFormationMethod;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// 6. SEASONS
// ============================================

export interface Season {
  id: string;
  schoolId: string;
  classId?: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  state: 'planning' | 'active' | 'final_week' | 'finished';
  finalTournamentStart?: Timestamp;
  createdAt: Timestamp;
}

// ============================================
// 7. SECTORS
// ============================================

export interface Sector {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  icon: string;
  order: number;
  briefDescription: {
    tone1: string;
    tone2: string;
    tone3: string;
    tone4: string;
  };
  representativeCompanies: string[];
  influencingFactors: string[];
}

// ============================================
// 8. PUBLIC SCORES
// ============================================

export interface SectorScore {
  sectorId: string;
  sectorName: string;
  sectorIcon?: string;
  impactScore: number;              // -5 ~ +5
  duration: ImpactDuration;
  risk: ImpactRisk;
  dailyReturn: number;              // %
  rank: number;                     // 1~10
  rankChange: number;               // ↑↓ from yesterday
  rationale: string;
  keyNewsIds: string[];
  glossaryTermIds?: string[];
}

export interface PublicScores {
  id: string;                       // YYYY-MM-DD
  date: string;
  toneLevel: 3;
  sectorScores: SectorScore[];
  headline: string;
  generatedAt: Timestamp;
  publishedAt: Timestamp;
}

// ============================================
// 9. BRIEFINGS
// ============================================

export interface Briefing {
  id: string;                       // {date}_{classId}
  date: string;
  classId: string;
  toneLevel: ToneLevel;
  aiDraft: {
    headline: string;
    sectorImpacts: SectorScore[];
    generatedAt: Timestamp;
    promptVersion: string;
  };
  afterStudentInputs?: {
    sectorImpacts: SectorScore[];
    integratedNewsCount: number;
    updatedAt: Timestamp;
  };
  finalApproved?: {
    headline: string;
    sectorImpacts: SectorScore[];
    approvedAt: Timestamp;
    teacherId: string;
  };
  status: BriefingStatus;
  cardNewsPublished: boolean;
  cardNewsPublishedAt?: Timestamp;
}

// ============================================
// 10. NEWS ITEMS
// ============================================

export interface NewsItem {
  id: string;
  source: string;
  domain: string;
  url: string;
  title: string;
  summary: string;
  publishedAt: Timestamp;
  sectorTags: string[];
  submittedBy: 'ai' | string;
  classId?: string;
  briefingDateRef?: string;
  credibilityScore: number;         // 0~1
  isPromotional: boolean;
  isAgeAppropriate: boolean;
  createdAt: Timestamp;
}

// ============================================
// 11. IMPACT SCORES
// ============================================

export interface ImpactScore {
  id: string;                       // {date}_{classId}_{sectorId}
  date: string;
  classId: string;
  sectorId: string;
  impactScore: number;
  duration: ImpactDuration;
  risk: ImpactRisk;
  version: ScoreVersion;
  dailyReturn: number;
  dailyRankInClass: number;
  rankChangeFromYesterday: number;
  createdAt: Timestamp;
}

// ============================================
// 12. OBJECTIONS
// ============================================

export interface ObjectionLogic {
  why: string;
  keyEvidence: string;
  counterAcknowledgment: string;
}

export interface Objection {
  id: string;
  briefingDateRef: string;
  classId: string;
  sectorId: string;
  studentId: string;
  groupId?: string;
  aiOriginalScore: number;
  proposedScore: number;
  sourceNewsIds: string[];
  logic: ObjectionLogic;
  aiValidation?: {
    structuralCompleteness: number;
    evidenceStrength: number;
    logicalCoherence: number;
    counterAcknowledged: boolean;
    proposedScoreReasonable: boolean;
    overallQuality: number;
    feedbackForStudent: string;
    summaryForTeacher: string;
  };
  status: ApprovalStatus;
  reviewedScore?: number;
  teacherComment?: string;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  createdAt: Timestamp;
}

// ============================================
// 13. PORTFOLIOS
// ============================================

export interface SectorAllocation {
  sectorId: string;
  weight: number;                   // 0~1, sum = 1
}

export interface Portfolio {
  id: string;
  ownerType: 'group' | 'individual';
  ownerId: string;
  classId: string;
  seasonId: string;
  startingValue: number;            // 1,000,000
  currentValue: number;
  allocations: SectorAllocation[];
  effectiveFrom: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PortfolioSnapshot {
  id: string;                       // YYYY-MM-DD
  date: string;
  value: number;
  dailyReturn: number;
  cumulativeReturn: number;
  allocations: SectorAllocation[];
}

// ============================================
// 14. TRANSACTIONS
// ============================================

export interface Transaction {
  id: string;
  portfolioId: string;
  ownerType: 'group' | 'individual';
  ownerId: string;
  classId: string;
  requestedBy: string;
  changeType: 'sector_swap' | 'weight_adjust' | 'main_sector_change';
  before: SectorAllocation[];
  after: SectorAllocation[];
  rationale: string;
  status: TransactionStatus;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  teacherComment?: string;
  createdAt: Timestamp;
}

// ============================================
// 15. RANKINGS
// ============================================

export interface RankingEntry {
  rank: number;
  ownerId: string;
  ownerName: string;
  return: number;
  score: number;
  metrics?: {
    return: number;
    accuracyRate: number;
    evidenceQuality: number;
    discussion: number;
    risk: number;
  };
}

export interface Ranking {
  id: string;                       // {scope}_{scopeId}_{period}
  scope: 'class' | 'grade' | 'school' | 'national';
  scopeId: string;
  period: string;                   // "weekly_2026W18", "monthly_2026M04"
  periodType: 'weekly' | 'monthly' | 'season';
  groupRanking: RankingEntry[];
  individualRanking: RankingEntry[];
  generatedAt: Timestamp;
}

// ============================================
// 16. REPORTS
// ============================================

export interface Report {
  id: string;
  type: ReportType;
  classId: string;
  briefingDateRef?: string;
  sectorId?: string;
  ownerType?: 'group' | 'individual';
  ownerId?: string;
  period?: string;
  content: string;
  thumbnailUrl?: string;
  publishedAt: Timestamp;
}

// ============================================
// 17. AWARDS
// ============================================

export interface Award {
  id: string;
  type: AwardType;
  classId: string;
  schoolId: string;
  recipientType: 'group' | 'individual';
  recipientId: string;
  recipientName: string;
  recipientMembers?: string[];
  period: string;
  awardDate: Timestamp;
  reason: string;
  templateVars: {
    schoolLogoUrl: string;
    schoolName: string;
    className: string;
    teacherName: string;
    awardCategory: string;
    awardRound: string;
    date: string;
  };
  createdAt: Timestamp;
}

// ============================================
// 18. MONTHLY ANALYSES
// ============================================

export interface MonthlyAnalysis {
  id: string;                       // {classId}_{YYYY-MM}
  classId: string;
  month: string;
  toneLevel: ToneLevel;
  classBets: { sectorId: string; avgWeight: number; rank: number }[];
  realMarketTrends: {
    sectorId: string;
    realReturn: number;
    matchVerdict: 'matched' | 'missed' | 'overlooked';
    aiCommentary: string;
    sourceUrls: string[];
  }[];
  lessons: string[];
  nextMonthFocus: string[];
  generatedAt: Timestamp;
}

// ============================================
// 19. GLOSSARY
// ============================================

export interface Glossary {
  id: string;
  term: string;
  category: 'investment' | 'sector_general' | 'sector_specific' | 'news_term';
  explanations: {
    tone1: string;
    tone2: string;
    tone3: string;
    tone4: string;
  };
  examples: {
    tone1: string;
    tone2: string;
    tone3: string;
    tone4: string;
  };
  relatedTermIds: string[];
  source: 'curated' | 'ai_generated';
  createdAt: Timestamp;
}

// ============================================
// 20. WHITELIST DOMAINS
// ============================================

export interface WhitelistDomain {
  id: string;
  scope: 'school' | 'class';
  scopeId: string;
  domain: string;
  displayName: string;
  iconUrl?: string;
  rssUrl?: string;
  addedBy: string;
  addedAt: Timestamp;
}

// ============================================
// 21. DOMAIN REQUESTS
// ============================================

export interface DomainRequest {
  id: string;
  classId: string;
  studentId: string;
  domain: string;
  reason: string;
  aiCredibilityRating: number;      // 0~5
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  createdAt: Timestamp;
}

// ============================================
// EXTRA: Discussion Threads
// ============================================

export interface DiscussionThread {
  id: string;
  classId: string;
  sectorId?: string;
  title: string;
  initiatorId: string;
  initiatorName: string;
  body: string;
  postedAt: Timestamp;
  replyCount: number;
  voteUp: number;
  voteDown: number;
}

export interface DiscussionReply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  body: string;
  postedAt: Timestamp;
  voteUp: number;
  voteDown: number;
}
