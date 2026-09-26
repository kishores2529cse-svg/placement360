from datetime import datetime, timezone, date
from sqlalchemy import String, Integer, ForeignKey, DateTime, Float, Text, Boolean, Date, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class AssessmentAttempt(Base):
    """Represents a single assessment session submitted by Kishore's system."""
    __tablename__ = "assessment_attempts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False, index=True)
    external_attempt_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=True)
    assessment_type: Mapped[str] = mapped_column(String(100), nullable=True)  # e.g. 'dsa', 'mock_interview'
    overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    skill_scores: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # {"dsa": 68, "java": 82}
    communication_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    raw_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    processed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="assessment_attempts")


class ReadinessHistory(Base):
    __tablename__ = "readiness_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    technical_score: Mapped[float] = mapped_column(Float, default=0.0)
    aptitude_score: Mapped[float] = mapped_column(Float, default=0.0)
    communication_score: Mapped[float] = mapped_column(Float, default=0.0)
    interview_score: Mapped[float] = mapped_column(Float, default=0.0)
    trigger: Mapped[str] = mapped_column(String(100), default="manual")  # 'assessment', 'lesson', 'manual'

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="readiness_history")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="medium")  # high/medium/low
    rec_type: Mapped[str] = mapped_column(String(50), default="learn")  # learn/practice/interview
    track_id: Mapped[int | None] = mapped_column(ForeignKey("learning_tracks.id"), nullable=True)
    module_id: Mapped[int | None] = mapped_column(ForeignKey("learning_modules.id"), nullable=True)
    skill_id: Mapped[int | None] = mapped_column(ForeignKey("skills.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_dismissed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="recommendations")


class DailyActivity(Base):
    __tablename__ = "daily_activity"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False, index=True)
    activity_date: Mapped[date] = mapped_column(Date, nullable=False)
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # lesson_complete, assessment, etc
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=True)  # DSA, Java, etc.
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    score_change: Mapped[float | None] = mapped_column(Float, nullable=True)
    details: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="daily_activities")


class Streak(Base):
    __tablename__ = "streaks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), unique=True, nullable=False, index=True)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_activity_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="streak")
