from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class SkillOut(BaseModel):
    id: int
    name: str
    display_name: str
    category: str
    score: float
    previous_score: float
    trend: float
    classification: str
    confidence: float
    last_assessed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ReadinessOut(BaseModel):
    overall: float
    technical: float
    aptitude: float
    communication: float
    interview: float
    project: float


class StreakOut(BaseModel):
    current: int
    longest: int
    last_activity_date: Optional[date] = None


class RecommendationOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    reason: Optional[str] = None
    priority: str
    rec_type: str
    track_id: Optional[int] = None
    module_id: Optional[int] = None
    skill_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ActivityOut(BaseModel):
    id: int
    activity_type: str
    title: str
    category: Optional[str] = None
    score: Optional[float] = None
    score_change: Optional[float] = None
    details: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TodayTaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    priority: str
    rec_type: str
    estimated_minutes: Optional[int] = None
    track_id: Optional[int] = None
    module_id: Optional[int] = None


class DashboardOut(BaseModel):
    student: dict
    readiness: ReadinessOut
    streak: StreakOut
    today_completed: int
    today_total: int
    today_tasks: List[TodayTaskOut]
    recommendations: List[RecommendationOut]
    recent_activity: List[ActivityOut]
    skills: List[SkillOut]


class ReadinessHistoryPoint(BaseModel):
    date: date
    score: float
    technical_score: float
    aptitude_score: float
    communication_score: float

    model_config = {"from_attributes": True}
