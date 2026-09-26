export interface UserProfile {
  id: string;
  name: string;
  readinessScore: number;
  streak: number;
}

export interface RecommendationTag {
  id: string;
  label: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface AppState {
  user: UserProfile;
  recommendations: RecommendationTag[];
}
