from fastapi import APIRouter, Query
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.dependencies import DbDep, CurrentUser
from app.models.student import Student
from app.services.analytics_service import (
    get_skills_analytics,
    get_weaknesses,
    get_analytics_overview,
    get_readiness_history,
)
from app.schemas.analytics import (
    SkillAnalyticsOut,
    WeaknessOut,
    AnalyticsOverviewOut,
    ReadinessHistoryOut,
)
from fastapi import HTTPException
from typing import List, Optional

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _require_student(db: Session, user_id: int):
    student = db.execute(select(Student).where(Student.user_id == user_id)).scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


@router.get("/overview", response_model=AnalyticsOverviewOut)
def analytics_overview(db: DbDep, current_user: CurrentUser):
    student = _require_student(db, current_user.id)
    return get_analytics_overview(db, student.id)


@router.get("/skills", response_model=List[SkillAnalyticsOut])
def analytics_skills(db: DbDep, current_user: CurrentUser):
    student = _require_student(db, current_user.id)
    return get_skills_analytics(db, student.id)


@router.get("/weaknesses", response_model=List[WeaknessOut])
def analytics_weaknesses(db: DbDep, current_user: CurrentUser):
    student = _require_student(db, current_user.id)
    return get_weaknesses(db, student.id)


@router.get("/readiness-history", response_model=List[ReadinessHistoryOut])
def readiness_history(
    db: DbDep,
    current_user: CurrentUser,
    period: str = Query(default="monthly", enum=["daily", "weekly", "monthly"]),
):
    student = _require_student(db, current_user.id)
    return get_readiness_history(db, student.id, period)


@router.get("/progress")
def analytics_progress(db: DbDep, current_user: CurrentUser):
    student = _require_student(db, current_user.id)
    from app.models.learning import LessonProgress, StudentTrackProgress, LearningTrack
    from sqlalchemy import func

    lessons_completed = db.execute(
        select(func.count(LessonProgress.id))
        .where(LessonProgress.student_id == student.id, LessonProgress.is_completed == True)
    ).scalar() or 0

    tracks = db.execute(
        select(LearningTrack).where(LearningTrack.is_active == True)
    ).scalars().all()

    track_progress = []
    for track in tracks:
        tp = db.execute(
            select(StudentTrackProgress)
            .where(
                StudentTrackProgress.student_id == student.id,
                StudentTrackProgress.track_id == track.id,
            )
        ).scalar_one_or_none()
        track_progress.append({
            "track_id": track.id,
            "title": track.title,
            "progress": tp.progress_percent if tp else 0.0,
            "completed_modules": tp.completed_modules if tp else 0,
            "total_modules": tp.total_modules if tp else len(track.modules),
        })

    return {
        "total_lessons_completed": lessons_completed,
        "tracks": track_progress,
    }
