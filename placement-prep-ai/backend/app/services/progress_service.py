"""Streak tracking service."""
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.progress import Streak, DailyActivity
from app.models.student import Student


def update_streak(db: Session, student_id: int) -> Streak:
    """Update streak for a student after a qualifying activity."""
    today = date.today()
    yesterday = today - timedelta(days=1)

    # Get or create streak record
    streak = db.execute(
        select(Streak).where(Streak.student_id == student_id)
    ).scalar_one_or_none()

    if streak is None:
        streak = Streak(student_id=student_id, current_streak=0, longest_streak=0)
        db.add(streak)
        db.flush()

    last = streak.last_activity_date

    if last is None:
        # First activity ever
        streak.current_streak = 1
        streak.longest_streak = max(streak.longest_streak, 1)
        streak.last_activity_date = today
    elif last == today:
        # Already updated today — no change to streak count
        pass
    elif last == yesterday:
        # Consecutive day
        streak.current_streak += 1
        streak.longest_streak = max(streak.longest_streak, streak.current_streak)
        streak.last_activity_date = today
    else:
        # Streak broken
        streak.current_streak = 1
        streak.last_activity_date = today

    db.flush()
    return streak


def log_activity(
    db: Session,
    student_id: int,
    activity_type: str,
    title: str,
    category: str | None = None,
    score: float | None = None,
    score_change: float | None = None,
    details: str | None = None,
) -> DailyActivity:
    """Log a daily activity and update the streak."""
    activity = DailyActivity(
        student_id=student_id,
        activity_date=date.today(),
        activity_type=activity_type,
        title=title,
        category=category,
        score=score,
        score_change=score_change,
        details=details,
    )
    db.add(activity)
    db.flush()

    # Update streak after any qualifying activity
    update_streak(db, student_id)
    return activity
