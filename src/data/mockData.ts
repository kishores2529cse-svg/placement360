import type { AppState, StudentProfile } from '../types';

export const mockStudentProfile: StudentProfile = {
  id: "std_101",
  name: "Kishore S",
  targetRole: "Java Full Stack Developer",
  dreamCompany: "Google",
  readinessScore: 74,
  streakDays: 5,
  recommendedTopics: ["Dynamic Programming", "Graph Traversal", "System Design Basics"]
};

export const mockData: AppState = {
  user: mockStudentProfile,
  isLoading: false
};
