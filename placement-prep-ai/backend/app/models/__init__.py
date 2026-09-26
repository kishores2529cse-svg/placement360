# Models package - import all models so SQLAlchemy registers them
from app.models.user import User
from app.models.student import Student
from app.models.skill import Skill, StudentSkill, SkillCategory
from app.models.learning import (
    LearningTrack,
    LearningModule,
    Lesson,
    StudentTrackProgress,
    StudentModuleProgress,
    LessonProgress,
    ModuleStatus,
)
from app.models.progress import (
    AssessmentAttempt,
    ReadinessHistory,
    Recommendation,
    DailyActivity,
    Streak,
)

__all__ = [
    "User",
    "Student",
    "Skill",
    "StudentSkill",
    "SkillCategory",
    "LearningTrack",
    "LearningModule",
    "Lesson",
    "StudentTrackProgress",
    "StudentModuleProgress",
    "LessonProgress",
    "ModuleStatus",
    "AssessmentAttempt",
    "ReadinessHistory",
    "Recommendation",
    "DailyActivity",
    "Streak",
]
