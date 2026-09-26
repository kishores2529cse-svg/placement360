import type {
  StudentProfile,
  LmsTrack,
  AssessmentQuestion,
  CccTelemetryPayload,
  MentorSessionPayload,
  MentorSessionResponse,
  AnalyticsSummary
} from '../types';

/**
 * Mock API Endpoints for PlacementPrep AI
 * These simulate network requests with a small delay.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// A. Student & Readiness Profile
export const getStudentProfile = async (): Promise<StudentProfile> => {
  await delay(500);
  return {
    id: "std_101",
    name: "Kishore S",
    targetRole: "Java Full Stack Developer",
    dreamCompany: "Google",
    readinessScore: 74,
    streakDays: 5,
    recommendedTopics: ["Dynamic Programming", "Graph Traversal", "System Design Basics"]
  };
};

// B. LMS & Learning Tracks (Ashwin)
export const getLmsTracks = async (): Promise<LmsTrack[]> => {
  await delay(500);
  return [
    {
      trackId: "dsa-01",
      title: "Data Structures & Algorithms",
      progress: 65,
      modules: [
        { id: "m1", title: "Arrays & Hashing", status: "completed" },
        { id: "m2", title: "Binary Search Trees", status: "in_progress" },
        { id: "m3", title: "Dynamic Programming", status: "recommended_priority" }
      ]
    },
    {
      trackId: "java-core",
      title: "Advanced Java & OOP",
      progress: 82,
      modules: [
        { id: "j1", title: "Collections Framework", status: "completed" },
        { id: "j2", title: "Multithreading & Concurrency", status: "in_progress" }
      ]
    }
  ];
};

// C. Assessment & CCC Monitoring Logs (Ashwin + Kishore)
export const getAssessmentQuestions = async (topic: string): Promise<AssessmentQuestion[]> => {
  await delay(500);
  // Simulating query filter based on topic
  if (topic === 'dsa') {
    return [
      {
        id: "q_201",
        title: "Two Sum Problem",
        difficulty: "Easy",
        type: "code",
        starterCode: "public int[] twoSum(int[] nums, int target) {\n    // Write code here\n}"
      }
    ];
  }
  return [];
};

export const postCccTelemetry = async (payload: CccTelemetryPayload): Promise<{ success: boolean }> => {
  await delay(300);
  console.log("Telemetry received:", payload);
  return { success: true };
};

// D. Kishore AI Mentor & Feedback Loop (Kishore)
export const postMentorSession = async (payload: MentorSessionPayload): Promise<MentorSessionResponse> => {
  await delay(800);
  console.log("Mentor session context:", payload);
  return {
    mentorResponse: "Good! Can you now explain the trade-off between top-down memoization and bottom-up tabulation?",
    confidenceScore: 85,
    speechClarityRating: "Strong",
    motivationalNudge: "You're recovering well on DP concepts. Keep this momentum!"
  };
};

// E. Analytics & Strengths/Weaknesses (Ashwin)
export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  await delay(500);
  return {
    categories: [
      { name: "DSA", score: 68 },
      { name: "Java OOP", score: 85 },
      { name: "System Design", score: 52 },
      { name: "Aptitude", score: 78 },
      { name: "Communication", score: 88 }
    ],
    strengths: ["Java Collections", "Verbal Communication", "Arrays & Strings"],
    weaknesses: ["Dynamic Programming", "Concurrency Deadlocks"]
  };
};
