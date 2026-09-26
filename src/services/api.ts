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

// ─── Mock Data (used when backend is offline) ────────────────────────────────
const MOCK_SKILLS: import('../types').SkillData[] = [
  { id: 1, name: 'dsa', display_name: 'DSA', category: 'technical', score: 68, previous_score: 62, trend: 6, classification: 'Developing', confidence: 0.7, last_assessed_at: new Date().toISOString() },
  { id: 2, name: 'java_oop', display_name: 'Java OOP', category: 'technical', score: 85, previous_score: 80, trend: 5, classification: 'Strong', confidence: 0.85, last_assessed_at: new Date().toISOString() },
  { id: 3, name: 'system_design', display_name: 'System Design', category: 'technical', score: 52, previous_score: 48, trend: 4, classification: 'Needs Improvement', confidence: 0.5, last_assessed_at: new Date().toISOString() },
  { id: 4, name: 'aptitude', display_name: 'Aptitude', category: 'aptitude', score: 78, previous_score: 75, trend: 3, classification: 'Developing', confidence: 0.75, last_assessed_at: new Date().toISOString() },
  { id: 5, name: 'communication', display_name: 'Communication', category: 'soft_skills', score: 88, previous_score: 84, trend: 4, classification: 'Strong', confidence: 0.9, last_assessed_at: new Date().toISOString() },
  { id: 6, name: 'sql', display_name: 'SQL & Databases', category: 'technical', score: 72, previous_score: 68, trend: 4, classification: 'Developing', confidence: 0.7, last_assessed_at: new Date().toISOString() },
  { id: 7, name: 'os_networks', display_name: 'OS & Networks', category: 'technical', score: 60, previous_score: 55, trend: 5, classification: 'Developing', confidence: 0.6, last_assessed_at: new Date().toISOString() },
];

const MOCK_DASHBOARD: DashboardData = {
  student: { id: 1, name: 'Kishore S', email: 'kishore@demo.com', target_role: 'Java Full Stack Developer', target_company: 'Google', college: 'Anna University' },
  readiness: { overall: 74, technical: 68, aptitude: 78, communication: 88, interview: 65, project: 70 },
  streak: { current: 5, longest: 12, last_activity_date: new Date().toISOString() },
  today_completed: 2,
  today_total: 5,
  today_tasks: [
    { id: 1, title: 'Practice Dynamic Programming - Knapsack', priority: 'high', rec_type: 'practice', estimated_minutes: 30, track_id: 1 },
    { id: 2, title: 'Review Java Collections Framework', priority: 'medium', rec_type: 'review', estimated_minutes: 20, track_id: 2 },
    { id: 3, title: 'System Design: URL Shortener', priority: 'medium', rec_type: 'learn', estimated_minutes: 45 },
  ],
  recommendations: [
    { id: 1, title: 'Focus on Dynamic Programming', description: 'Your DP score dropped 8% — revisit memoization patterns.', priority: 'high', rec_type: 'skill_improvement', skill_name: 'dsa', track_id: 1, created_at: new Date().toISOString() },
    { id: 2, title: 'Start System Design Basics', description: 'System Design is a weak area. Begin with HLD fundamentals.', priority: 'medium', rec_type: 'new_topic', track_id: 3, created_at: new Date().toISOString() },
    { id: 3, title: 'Mock Interview Practice', description: 'Schedule a mock viva to boost interview readiness.', priority: 'low', rec_type: 'assessment', created_at: new Date().toISOString() },
  ],
  recent_activity: [
    { id: 1, activity_type: 'lesson_complete', title: 'Completed: Arrays & Hashing', category: 'DSA', score: 92, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, activity_type: 'assessment_complete', title: 'CCC Assessment: Java OOP', category: 'Java', score: 85, score_change: 5, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 3, activity_type: 'skill_improved', title: 'Communication skill improved', category: 'Soft Skills', score_change: 4, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 4, activity_type: 'lesson_complete', title: 'Completed: Binary Search Trees', category: 'DSA', score: 78, created_at: new Date(Date.now() - 172800000).toISOString() },
  ],
  skills: MOCK_SKILLS,
};

function generateMockHistory(): ReadinessHistoryPoint[] {
  const points: ReadinessHistoryPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const base = 55 + (29 - i) * 0.6;
    points.push({
      date: d.toISOString().slice(0, 10),
      score: Math.min(100, base + Math.random() * 8),
      technical_score: Math.min(100, base - 5 + Math.random() * 10),
      aptitude_score: Math.min(100, base + 2 + Math.random() * 6),
      communication_score: Math.min(100, base + 10 + Math.random() * 5),
      interview_score: Math.min(100, base - 8 + Math.random() * 10),
    });
  }
  return points;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboard(): Promise<DashboardData> {
  try {
    return await apiRequest<DashboardData>('/dashboard');
  } catch {
    console.warn('[API] Backend offline — using mock dashboard data');
    return MOCK_DASHBOARD;
  }
}

// ─── LMS Tracks ──────────────────────────────────────────────────────────────
export async function getLmsTracks(): Promise<LmsTrack[]> {
  try {
    const tracks = await apiRequest<TrackData[]>('/tracks');
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
  } catch {
    console.warn('[API] Backend offline — using mock LMS tracks');
    return [
      { trackId: 'dsa-01', title: 'Data Structures & Algorithms', progress: 65, modules: [
        { id: 'm1', title: 'Arrays & Hashing', status: 'completed' },
        { id: 'm2', title: 'Binary Search Trees', status: 'in_progress' },
        { id: 'm3', title: 'Dynamic Programming', status: 'recommended_priority' },
      ]},
      { trackId: 'java-core', title: 'Advanced Java & OOP', progress: 82, modules: [
        { id: 'j1', title: 'Collections Framework', status: 'completed' },
        { id: 'j2', title: 'Multithreading & Concurrency', status: 'in_progress' },
      ]},
    ];
  }
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
  try {
    return await apiRequest<AnalyticsOverview>('/analytics/overview');
  } catch {
    console.warn('[API] Backend offline — using mock analytics overview');
    return {
      overall_readiness: 74,
      readiness_trend: 3.2,
      avg_skill_score: 72,
      total_lessons_completed: 18,
      total_assessments: 6,
      current_streak: 5,
      strengths: ['Java Collections', 'Verbal Communication', 'Arrays & Strings'],
      weaknesses: [
        { skill_name: 'dynamic_programming', display_name: 'Dynamic Programming', score: 42, trend: -3.5, recommended_module_title: 'DP Fundamentals', recommended_module_id: 3, recommended_track_id: 1 },
        { skill_name: 'system_design', display_name: 'System Design', score: 52, trend: 2.0, recommended_module_title: 'HLD Basics', recommended_module_id: 5, recommended_track_id: 3 },
      ],
      skills: MOCK_SKILLS.map(s => ({
        name: s.name,
        display_name: s.display_name,
        category: s.category,
        score: s.score,
        previous_score: s.previous_score,
        trend: s.trend,
        classification: s.classification,
      })),
    };
  }
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
  try {
    return await apiRequest<ReadinessHistoryPoint[]>(`/analytics/readiness-history?period=${period}`);
  } catch {
    console.warn('[API] Backend offline — using mock readiness history');
    return generateMockHistory();
  }
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const overview = await getAnalyticsOverview();
    return {
      categories: overview.skills.map(s => ({ name: s.display_name, score: s.score })),
      strengths: overview.strengths,
      weaknesses: overview.weaknesses.map(w => w.display_name),
    };
  } catch {
    console.warn('[API] Backend offline — using mock analytics summary');
    return {
      categories: MOCK_SKILLS.map(s => ({ name: s.display_name, score: s.score })),
      strengths: ['Java Collections', 'Verbal Communication', 'Arrays & Strings'],
      weaknesses: ['Dynamic Programming', 'Concurrency Deadlocks'],
    };
  }
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
