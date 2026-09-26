from datetime import datetime, timezone
from sqlalchemy import String, Integer, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    college: Mapped[str] = mapped_column(String(255), nullable=True)
    branch: Mapped[str] = mapped_column(String(255), nullable=True)
    graduation_year: Mapped[int] = mapped_column(Integer, nullable=True)
    target_role: Mapped[str] = mapped_column(String(255), nullable=True)
    target_company: Mapped[str] = mapped_column(String(255), nullable=True)
    profile_completion: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="student")
    student_skills: Mapped[list["StudentSkill"]] = relationship(back_populates="student", cascade="all, delete-orphan")
    track_progress: Mapped[list["StudentTrackProgress"]] = relationship(back_populates="student", cascade="all, delete-orphan")
    module_progress: Mapped[list["StudentModuleProgress"]] = relationship(back_populates="student", cascade="all, delete-orphan")
    lesson_progress: Mapped[list["LessonProgress"]] = relationship(back_populates="student", cascade="all, delete-orphan")
    assessment_attempts: Mapped[list["AssessmentAttempt"]] = relationship(back_populates="student", cascade="all, delete-orphan")
    readiness_history: Mapped[list["ReadinessHistory"]] = relationship(back_populates="student", cascade="all, delete-orphan")
    recommendations: Mapped[list["Recommendation"]] = relationship(back_populates="student", cascade="all, delete-orphan")
    daily_activities: Mapped[list["DailyActivity"]] = relationship(back_populates="student", cascade="all, delete-orphan")
    streak: Mapped["Streak"] = relationship(back_populates="student", uselist=False, cascade="all, delete-orphan")
