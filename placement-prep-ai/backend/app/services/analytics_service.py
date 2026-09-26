"""Analytics service."""
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc
from app.models.skill import StudentSkill, Skill
from app.models.progress import ReadinessHistory, DailyActivity
from app.models.learning import LessonProgress, StudentTrackProgress
from app.models.progress import AssessmentAttempt
from app.services.readiness_engine import calculate_readiness
from app.schemas.analytics import (
    SkillAnalyticsOut,
    WeaknessOut,
    AnalyticsOverviewOut,
    ReadinessHistoryOut,
)
from app.services.recommendation_engine import SKILL_TRACK_MAP
from app.models.learning import LearningTrack, LearningModule
from datetime import date, timedelta
from typing import Optional


def get_skills_analytics(db: Session, student_id: int) -> list[SkillAnalyticsOut]:
    rows = db.execute(
        select(StudentSkill, Skill)
        .join(Skill, StudentSkill.skill_id == Skill.id)
        .where(StudentSkill.student_id == student_id)
        .order_by(Skill.name)
    ).all()

    return [
        SkillAnalyticsOut(
            name=skill.name,
            display_name=skill.display_name,
            category=skill.category,
            score=ss.score,
            previous_score=ss.previous_score,
            trend=round(ss.trend, 1),
            classification=ss.classification,
        )
        for ss, skill in rows
    ]


def get_weaknesses(db: Session, student_id: int) -> list[WeaknessOut]:
    rows = db.execute(
        select(StudentSkill, Skill)
        .join(Skill, StudentSkill.skill_id == Skill.id)
        .where(StudentSkill.student_id == student_id, StudentSkill.score < 65)
        .order_by(StudentSkill.score)
    ).all()

    weaknesses = []
    for ss, skill in rows:
        # Find recommended track/module
        track_title = SKILL_TRACK_MAP.get(skill.name)
        track = None
        module = None
        if track_title:
            track = db.execute(
                select(LearningTrack).where(LearningTrack.title == track_title)
            ).scalar_one_or_none()
            if track and track.modules:
                module = track.modules[0]

        weaknesses.append(WeaknessOut(
            skill_name=skill.name,
            display_name=skill.display_name,
            score=ss.score,
            trend=round(ss.trend, 1),
            recommended_module_title=module.title if module else None,
            recommended_module_id=module.id if module else None,
            recommended_track_id=track.id if track else None,
        ))

    return weaknesses


def get_analytics_overview(db: Session, student_id: int) -> AnalyticsOverviewOut:
    readiness = calculate_readiness(db, student_id)

    # Skills
    skill_analytics = get_skills_analytics(db, student_id)
    avg_skill = sum(s.score for s in skill_analytics) / len(skill_analytics) if skill_analytics else 0

    # Readiness trend (compare today vs 7 days ago)
    seven_days_ago = date.today() - timedelta(days=7)
    old_snap = db.execute(
        select(ReadinessHistory)
        .where(
            ReadinessHistory.student_id == student_id,
            ReadinessHistory.date >= seven_days_ago,
        )
        .order_by(ReadinessHistory.date)
        .limit(1)
    ).scalar_one_or_none()
    readiness_trend = readiness.overall - old_snap.overall_score if old_snap else 0.0

    # Total lessons completed
    total_lessons = db.execute(
        select(func.count(LessonProgress.id))
        .where(LessonProgress.student_id == student_id, LessonProgress.is_completed == True)
    ).scalar() or 0

    # Total assessments
    total_assessments = db.execute(
        select(func.count(AssessmentAttempt.id))
        .where(AssessmentAttempt.student_id == student_id)
    ).scalar() or 0

    # Streak
    from app.models.progress import Streak
    streak_row = db.execute(
        select(Streak).where(Streak.student_id == student_id)
    ).scalar_one_or_none()
    current_streak = streak_row.current_streak if streak_row else 0

    # Strengths (score >= 80)
    strengths = [s.display_name for s in skill_analytics if s.score >= 80]

    # Weaknesses
    weaknesses = get_weaknesses(db, student_id)

    return AnalyticsOverviewOut(
        overall_readiness=readiness.overall,
        readiness_trend=round(readiness_trend, 1),
        avg_skill_score=round(avg_skill, 1),
        total_lessons_completed=total_lessons,
        total_assessments=total_assessments,
        current_streak=current_streak,
        strengths=strengths,
        weaknesses=weaknesses,
        skills=skill_analytics,
    )


def get_readiness_history(
    db: Session, student_id: int, period: str = "monthly"
) -> list[ReadinessHistoryOut]:
    if period == "daily":
        since = date.today() - timedelta(days=30)
    elif period == "weekly":
        since = date.today() - timedelta(weeks=12)
    else:
        since = date.today() - timedelta(days=180)

    rows = db.execute(
        select(ReadinessHistory)
        .where(
            ReadinessHistory.student_id == student_id,
            ReadinessHistory.date >= since,
        )
        .order_by(ReadinessHistory.date)
    ).scalars().all()

    return [
        ReadinessHistoryOut(
            date=r.date,
            score=r.overall_score,
            technical_score=r.technical_score,
            aptitude_score=r.aptitude_score,
            communication_score=r.communication_score,
            interview_score=r.interview_score,
        )
        for r in rows
    ]
