export interface StudentProfile {
  id: string;
  name: string;
  targetRole: string;
  dreamCompany: string;
  readinessScore: number;
  streakDays: number;
  recommendedTopics: string[];
}

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

// AppState is for context if needed
export interface AppState {
  user: StudentProfile | null;
  isLoading: boolean;
}
