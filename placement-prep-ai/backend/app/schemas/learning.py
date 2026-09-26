from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class LessonOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    difficulty: str
    estimated_minutes: int
    order_index: int
    is_completed: bool = False

    model_config = {"from_attributes": True}


class ModuleOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    order_index: int
    difficulty: str
    estimated_minutes: int
    status: str  # locked/available/in_progress/completed/recommended
    progress_percent: float = 0.0
    completed_lessons: int = 0
    total_lessons: int = 0
    lessons: List[LessonOut] = []

    model_config = {"from_attributes": True}


class TrackOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    estimated_hours: int
    progress_percent: float = 0.0
    completed_modules: int = 0
    total_modules: int = 0
    is_completed: bool = False
    modules: List[ModuleOut] = []

    model_config = {"from_attributes": True}


class ModuleProgressUpdate(BaseModel):
    status: str  # available/in_progress/completed
    lesson_id: Optional[int] = None


class LessonCompleteRequest(BaseModel):
    time_spent_minutes: int = 0


class AssessmentResultPayload(BaseModel):
    """Payload from Kishore's assessment system."""
    skills: dict  # {"dsa": 68, "java": 82, "sql": 54}
    communication: Optional[float] = None
    assessment_type: Optional[str] = None
    external_attempt_id: Optional[str] = None
