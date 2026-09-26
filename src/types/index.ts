// Extended types for PlacementPrep AI backend integration

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// ─── Student ──────────────────────────────────────────────────────────────────
export interface StudentProfile {
  id: string;
  name: string;
  targetRole: string;
  dreamCompany: string;
  readinessScore: number;
  streakDays: number;
  recommendedTopics: string[];
}

export interface StudentProfileFull {
  id: number;
  name: string;
  email: string;
  college?: string;
  branch?: string;
  graduation_year?: number;
  target_role?: string;
  target_company?: string;
  profile_completion: number;
}

// ─── Skills ───────────────────────────────────────────────────────────────────
export interface SkillData {
  id: number;
  name: string;
  display_name: string;
  category: string;
  score: number;
  previous_score: number;
  trend: number;
  classification: 'Strong' | 'Developing' | 'Needs Improvement';
  confidence: number;
  last_assessed_at?: string;
}

// ─── Readiness ────────────────────────────────────────────────────────────────
export interface ReadinessData {
  overall: number;
  technical: number;
  aptitude: number;
  communication: number;
  interview: number;
  project: number;
}

// ─── Streak ───────────────────────────────────────────────────────────────────
export interface StreakData {
  current: number;
  longest: number;
  last_activity_date?: string;
}

// ─── Recommendations ──────────────────────────────────────────────────────────
export interface RecommendationData {
  id: number;
  title: string;
  description?: string;
  reason?: string;
  priority: 'high' | 'medium' | 'low';
  rec_type: string;
  track_id?: number;
  module_id?: number;
  skill_name?: string;
  created_at: string;
}

// ─── Activity ─────────────────────────────────────────────────────────────────
export interface ActivityData {
  id: number;
  activity_type: string;
  title: string;
  category?: string;
  score?: number;
  score_change?: number;
  details?: string;
  created_at: string;
}

// ─── Today Task ───────────────────────────────────────────────────────────────
export interface TodayTask {
  id: number;
  title: string;
  description?: string;
  priority: string;
  rec_type: string;
  estimated_minutes?: number;
  track_id?: number;
  module_id?: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardData {
  student: {
    id: number;
    name: string;
    email: string;
    target_role?: string;
    target_company?: string;
    college?: string;
  };
  readiness: ReadinessData;
  streak: StreakData;
  today_completed: number;
  today_total: number;
  today_tasks: TodayTask[];
  recommendations: RecommendationData[];
  recent_activity: ActivityData[];
  skills: SkillData[];
}

// ─── LMS ──────────────────────────────────────────────────────────────────────
export interface LessonData {
  id: number;
  title: string;
  description?: string;
  difficulty: string;
  estimated_minutes: number;
  order_index: number;
  is_completed: boolean;
}

export interface ModuleData {
  id: number;
  title: string;
  description?: string;
  order_index: number;
  difficulty: string;
  estimated_minutes: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'recommended';
  progress_percent: number;
  completed_lessons: number;
  total_lessons: number;
  lessons: LessonData[];
}

export interface TrackData {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  estimated_hours: number;
  progress_percent: number;
  completed_modules: number;
  total_modules: number;
  is_completed: boolean;
  modules: ModuleData[];
}

// ─── Legacy LMS types (kept for Kishore compatibility) ────────────────────────
export interface LmsModule {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'recommended_priority' | 'locked';
}

export interface LmsTrack {
  trackId: string;
  title: string;
  progress: number;
  modules: LmsModule[];
}

export interface AssessmentQuestion {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'code' | 'mcq';
  starterCode?: string;
}

export interface CccTelemetryPayload {
  testSessionId: string;
  focusLostCount: number;
  avgHesitationSec: number;
  compilationCount: number;
  stressIndexScore: number;
  flaggedBehaviors: string[];
}

export interface MentorSessionPayload {
  mode: 'technical_viva' | 'mock_interview' | 'code_review';
  targetTopic: string;
  userAudioOrTextInput: string;
}

export interface MentorSessionResponse {
  mentorResponse: string;
  confidenceScore: number;
  speechClarityRating: 'Strong' | 'Average' | 'Needs Improvement';
  motivationalNudge: string;
}

export interface AnalyticsCategory {
  name: string;
  score: number;
}

export interface AnalyticsSummary {
  categories: AnalyticsCategory[];
  strengths: string[];
  weaknesses: string[];
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface SkillAnalytics {
  name: string;
  display_name: string;
  category: string;
  score: number;
  previous_score: number;
  trend: number;
  classification: string;
}

export interface WeaknessData {
  skill_name: string;
  display_name: string;
  score: number;
  trend: number;
  recommended_module_title?: string;
  recommended_module_id?: number;
  recommended_track_id?: number;
}

export interface AnalyticsOverview {
  overall_readiness: number;
  readiness_trend: number;
  avg_skill_score: number;
  total_lessons_completed: number;
  total_assessments: number;
  current_streak: number;
  strengths: string[];
  weaknesses: WeaknessData[];
  skills: SkillAnalytics[];
}

export interface ReadinessHistoryPoint {
  date: string;
  score: number;
  technical_score: number;
  aptitude_score: number;
  communication_score: number;
  interview_score: number;
}

// ─── App state ────────────────────────────────────────────────────────────────
export interface AppState {
  user: StudentProfile | null;
  isLoading: boolean;
}
