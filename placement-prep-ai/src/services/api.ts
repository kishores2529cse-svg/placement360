/**
 * PlacementPrep AI — Real API Client
 * Connects to FastAPI backend at VITE_API_URL
 */
import type {
  StudentProfile,
  LmsTrack,
  AssessmentQuestion,
  CccTelemetryPayload,
  MentorSessionPayload,
  MentorSessionResponse,
  AnalyticsSummary,
  DashboardData,
  TrackData,
  AnalyticsOverview,
  ReadinessHistoryPoint,
  SkillAnalytics,
  WeaknessData,
  RecommendationData,
  TokenResponse,
} from '../types';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://127.0.0.1:8000/api/v1';

// ─── Auth Token Storage ───────────────────────────────────────────────────────
const TOKEN_KEY = 'pp_access_token';

export function getToken(): string | null {
  // Hardcoded token to bypass login for now
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MjE5NDQ5ODQsInN1YiI6IjEifQ.NiSv5xXmBSpjCig3fWzlJV503UloLOyd1MYrSwGlHKU';
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── HTTP Client ──────────────────────────────────────────────────────────────
async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      detail = err.detail ?? detail;
    } catch {
      // ignore parse error
    }
    throw new Error(detail);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<TokenResponse> {
  const result = await apiRequest<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(result.access_token);
  return result;
}

export async function register(email: string, password: string, name: string): Promise<TokenResponse> {
  const result = await apiRequest<TokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  setToken(result.access_token);
  return result;
}

// ─── Student Profile ─────────────────────────────────────────────────────────
export async function getStudentProfile(): Promise<StudentProfile> {
  try {
    const profile = await apiRequest<{
      id: number;
      name: string;
      email: string;
      target_role?: string;
      target_company?: string;
      profile_completion: number;
    }>('/students/me');

    return {
      id: String(profile.id),
      name: profile.name,
      targetRole: profile.target_role ?? 'Software Developer',
      dreamCompany: profile.target_company ?? 'Top Tech Company',
      readinessScore: 0,
      streakDays: 0,
      recommendedTopics: [],
    };
  } catch {
    // Return demo data if not authenticated
    return {
      id: 'demo',
      name: 'Ashwin Kumar',
      targetRole: 'Software Developer',
      dreamCompany: 'Google',
      readinessScore: 74,
      streakDays: 12,
      recommendedTopics: ['Dynamic Programming', 'SQL Optimization', 'System Design'],
    };
  }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboard(): Promise<DashboardData> {
  return apiRequest<DashboardData>('/dashboard');
}

// ─── LMS Tracks ──────────────────────────────────────────────────────────────
export async function getLmsTracks(): Promise<LmsTrack[]> {
  const tracks = await apiRequest<TrackData[]>('/tracks');
  // Map to legacy format for backward compat
  return tracks.map(t => ({
    trackId: String(t.id),
    title: t.title,
    progress: t.progress_percent,
    modules: t.modules.map(m => ({
      id: String(m.id),
      title: m.title,
      status:
        m.status === 'completed' ? 'completed' :
        m.status === 'in_progress' ? 'in_progress' :
        m.status === 'recommended' ? 'recommended_priority' :
        'locked' as 'locked',
    })),
  }));
}

export async function getTracksData(): Promise<TrackData[]> {
  return apiRequest<TrackData[]>('/tracks');
}

export async function getTrackData(trackId: number): Promise<TrackData> {
  return apiRequest<TrackData>(`/tracks/${trackId}`);
}

export async function getLmsTrack(trackId: string): Promise<LmsTrack | null> {
  const track = await apiRequest<TrackData>(`/tracks/${trackId}`);
  return {
    trackId: String(track.id),
    title: track.title,
    progress: track.progress_percent,
    modules: track.modules.map(m => ({
      id: String(m.id),
      title: m.title,
      status: m.status === 'completed' ? 'completed' :
        m.status === 'in_progress' ? 'in_progress' :
        m.status === 'recommended' ? 'recommended_priority' :
        'locked' as 'locked',
    })),
  };
}

// ─── Module Progress ──────────────────────────────────────────────────────────
export async function startModule(moduleId: number): Promise<void> {
  await apiRequest(`/modules/${moduleId}/start`, { method: 'POST' });
}

export async function completeLesson(
  lessonId: number,
  timeSpentMinutes: number = 0
): Promise<{ is_completed: boolean; already_was_completed: boolean }> {
  return apiRequest(`/lessons/${lessonId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ time_spent_minutes: timeSpentMinutes }),
  });
}

export async function getStudentProgress(): Promise<TrackData[]> {
  return apiRequest<TrackData[]>('/student/progress');
}

// ─── Skills ──────────────────────────────────────────────────────────────────
export async function getSkills(): Promise<SkillAnalytics[]> {
  return apiRequest<SkillAnalytics[]>('/skills');
}

// ─── Recommendations ─────────────────────────────────────────────────────────
export async function getRecommendations(): Promise<RecommendationData[]> {
  return apiRequest<RecommendationData[]>('/recommendations');
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return apiRequest<AnalyticsOverview>('/analytics/overview');
}

export async function getSkillAnalytics(): Promise<SkillAnalytics[]> {
  return apiRequest<SkillAnalytics[]>('/analytics/skills');
}

export async function getWeaknesses(): Promise<WeaknessData[]> {
  return apiRequest<WeaknessData[]>('/analytics/weaknesses');
}

export async function getReadinessHistory(
  period: 'daily' | 'weekly' | 'monthly' = 'monthly'
): Promise<ReadinessHistoryPoint[]> {
  return apiRequest<ReadinessHistoryPoint[]>(`/analytics/readiness-history?period=${period}`);
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const overview = await getAnalyticsOverview();
  return {
    categories: overview.skills.map(s => ({ name: s.display_name, score: s.score })),
    strengths: overview.strengths,
    weaknesses: overview.weaknesses.map(w => w.display_name),
  };
}

// ─── Assessment Integration (for Kishore's system) ───────────────────────────
export async function postAssessmentResults(
  attemptId: string,
  skills: Record<string, number>,
  communication?: number,
  assessmentType?: string
): Promise<{ message: string; readiness: Record<string, number> }> {
  return apiRequest(`/assessments/${attemptId}/results`, {
    method: 'POST',
    body: JSON.stringify({
      skills,
      communication,
      assessment_type: assessmentType,
      external_attempt_id: attemptId,
    }),
  });
}

// ─── Legacy API shims (for Kishore's existing components) ────────────────────
export const getAssessmentQuestions = async (topic: string): Promise<AssessmentQuestion[]> => {
  // Kishore implements this
  if (topic === 'dsa') {
    return [{
      id: 'q_201',
      title: 'Two Sum Problem',
      difficulty: 'Easy',
      type: 'code',
      starterCode: 'public int[] twoSum(int[] nums, int target) {\n    // Write code here\n}',
    }];
  }
  return [];
};

export const postCccTelemetry = async (payload: CccTelemetryPayload): Promise<{ success: boolean }> => {
  console.log('CCC Telemetry (Kishore):', payload);
  return { success: true };
};

export const postMentorSession = async (payload: MentorSessionPayload): Promise<MentorSessionResponse> => {
  console.log('Mentor Session (Kishore):', payload);
  return {
    mentorResponse: 'Good! Can you explain the trade-off between top-down memoization and bottom-up tabulation?',
    confidenceScore: 85,
    speechClarityRating: 'Strong',
    motivationalNudge: "You're recovering well on DP concepts. Keep this momentum!",
  };
};
