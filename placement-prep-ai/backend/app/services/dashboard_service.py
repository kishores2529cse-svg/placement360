"""Dashboard service — aggregate data for the dashboard endpoint."""
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.models.student import Student
from app.models.skill import StudentSkill, Skill
from app.models.progress import Recommendation, DailyActivity, Streak, ReadinessHistory
from app.models.user import User
from app.services.readiness_engine import calculate_readiness
from app.schemas.dashboard import (
    ReadinessOut,
    StreakOut,
    SkillOut,
    RecommendationOut,
    ActivityOut,
    TodayTaskOut,
    DashboardOut,
)
from datetime import date


def get_dashboard_data(db: Session, student_id: int, user_email: str) -> DashboardOut:
    student = db.get(Student, student_id)

    # Readiness
    readiness = calculate_readiness(db, student_id)

    # Streak
    streak_row = db.execute(
        select(Streak).where(Streak.student_id == student_id)
    ).scalar_one_or_none()
    streak = StreakOut(
        current=streak_row.current_streak if streak_row else 0,
        longest=streak_row.longest_streak if streak_row else 0,
        last_activity_date=streak_row.last_activity_date if streak_row else None,
    )

    # Skills
    skill_rows = db.execute(
        select(StudentSkill, Skill)
        .join(Skill, StudentSkill.skill_id == Skill.id)
        .where(StudentSkill.student_id == student_id)
    ).all()

    skills = [
        SkillOut(
            id=skill.id,
            name=skill.name,
            display_name=skill.display_name,
            category=skill.category,
            score=ss.score,
            previous_score=ss.previous_score,
            trend=ss.trend,
            classification=ss.classification,
            confidence=ss.confidence,
            last_assessed_at=ss.last_assessed_at,
        )
        for ss, skill in skill_rows
    ]

    # Today's tasks from recommendations
    recs = db.execute(
        select(Recommendation)
        .where(
            Recommendation.student_id == student_id,
            Recommendation.is_active == True,
            Recommendation.is_dismissed == False,
        )
        .order_by(
            Recommendation.priority.desc(),
            Recommendation.created_at.desc(),
        )
        .limit(10)
    ).scalars().all()

    today_tasks = [
        TodayTaskOut(
            id=r.id,
            title=r.title,
            description=r.description,
            priority=r.priority,
            rec_type=r.rec_type,
            estimated_minutes=30 if r.priority == "high" else 20,
            track_id=r.track_id,
            module_id=r.module_id,
        )
        for r in recs[:4]
    ]

    rec_out = [
        RecommendationOut(
            id=r.id,
            title=r.title,
            description=r.description,
            reason=r.reason,
            priority=r.priority,
            rec_type=r.rec_type,
            track_id=r.track_id,
            module_id=r.module_id,
            skill_name=None,
            created_at=r.created_at,
        )
        for r in recs[:6]
    ]

    # Recent activity
    activities = db.execute(
        select(DailyActivity)
        .where(DailyActivity.student_id == student_id)
        .order_by(desc(DailyActivity.created_at))
        .limit(8)
    ).scalars().all()

    activity_out = [
        ActivityOut(
            id=a.id,
            activity_type=a.activity_type,
            title=a.title,
            category=a.category,
            score=a.score,
            score_change=a.score_change,
            details=a.details,
            created_at=a.created_at,
        )
        for a in activities
    ]

    return DashboardOut(
        student={
            "id": student.id,
            "name": student.name,
            "email": user_email,
            "target_role": student.target_role,
            "target_company": student.target_company,
            "college": student.college,
        },
        readiness=readiness,
        streak=streak,
        today_completed=0,  # TODO: track actual completion status of today tasks
        today_total=len(today_tasks),
        today_tasks=today_tasks,
        recommendations=rec_out,
        recent_activity=activity_out,
        skills=skills,
    )
