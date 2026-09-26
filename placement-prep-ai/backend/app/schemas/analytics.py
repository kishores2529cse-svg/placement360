from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class SkillAnalyticsOut(BaseModel):
    name: str
    display_name: str
    category: str
    score: float
    previous_score: float
    trend: float
    classification: str


class WeaknessOut(BaseModel):
    skill_name: str
    display_name: str
    score: float
    trend: float
    recommended_module_title: Optional[str] = None
    recommended_module_id: Optional[int] = None
    recommended_track_id: Optional[int] = None


class AnalyticsOverviewOut(BaseModel):
    overall_readiness: float
    readiness_trend: float
    avg_skill_score: float
    total_lessons_completed: int
    total_assessments: int
    current_streak: int
    strengths: List[str]
    weaknesses: List[WeaknessOut]
    skills: List[SkillAnalyticsOut]


class ReadinessHistoryOut(BaseModel):
    date: date
    score: float
    technical_score: float
    aptitude_score: float
    communication_score: float
    interview_score: float

    model_config = {"from_attributes": True}
