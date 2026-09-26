import type { AppState } from '../types';

export const mockData: AppState = {
  user: {
    id: "u-001",
    name: "Alex Dev",
    readinessScore: 78,
    streak: 12
  },
  recommendations: [
    { id: "r-1", label: "Review React Hooks", urgency: "high" },
    { id: "r-2", label: "Practice Binary Search", urgency: "medium" },
    { id: "r-3", label: "Update Resume", urgency: "low" }
  ]
};
