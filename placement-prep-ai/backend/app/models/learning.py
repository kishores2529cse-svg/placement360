from datetime import datetime, timezone
from sqlalchemy import String, Integer, ForeignKey, DateTime, Float, Text, Boolean, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.db.database import Base


class ModuleStatus(str, enum.Enum):
    locked = "locked"
    available = "available"
    in_progress = "in_progress"
    completed = "completed"
    recommended = "recommended"


class LearningTrack(Base):
    __tablename__ = "learning_tracks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    skill_id: Mapped[int | None] = mapped_column(ForeignKey("skills.id"), nullable=True)
    icon: Mapped[str] = mapped_column(String(50), nullable=True)
    color: Mapped[str] = mapped_column(String(50), nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    estimated_hours: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    modules: Mapped[list["LearningModule"]] = relationship(
        back_populates="track", order_by="LearningModule.order_index", cascade="all, delete-orphan"
    )
    student_progress: Mapped[list["StudentTrackProgress"]] = relationship(back_populates="track")


class LearningModule(Base):
    __tablename__ = "learning_modules"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    track_id: Mapped[int] = mapped_column(ForeignKey("learning_tracks.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    difficulty: Mapped[str] = mapped_column(String(20), default="medium")  # easy/medium/hard
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=60)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    track: Mapped["LearningTrack"] = relationship(back_populates="modules")
    lessons: Mapped[list["Lesson"]] = relationship(
        back_populates="module", order_by="Lesson.order_index", cascade="all, delete-orphan"
    )
    student_progress: Mapped[list["StudentModuleProgress"]] = relationship(back_populates="module")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    module_id: Mapped[int] = mapped_column(ForeignKey("learning_modules.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(20), default="medium")
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=15)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    skill_id: Mapped[int | None] = mapped_column(ForeignKey("skills.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    module: Mapped["LearningModule"] = relationship(back_populates="lessons")
    progress: Mapped[list["LessonProgress"]] = relationship(back_populates="lesson")


class StudentTrackProgress(Base):
    __tablename__ = "student_track_progress"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False, index=True)
    track_id: Mapped[int] = mapped_column(ForeignKey("learning_tracks.id"), nullable=False, index=True)
    progress_percent: Mapped[float] = mapped_column(Float, default=0.0)
    completed_modules: Mapped[int] = mapped_column(Integer, default=0)
    total_modules: Mapped[int] = mapped_column(Integer, default=0)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_accessed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="track_progress")
    track: Mapped["LearningTrack"] = relationship(back_populates="student_progress")


class StudentModuleProgress(Base):
    __tablename__ = "student_module_progress"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False, index=True)
    module_id: Mapped[int] = mapped_column(ForeignKey("learning_modules.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(
        Enum(ModuleStatus, name="module_status"), default=ModuleStatus.locked
    )
    progress_percent: Mapped[float] = mapped_column(Float, default=0.0)
    completed_lessons: Mapped[int] = mapped_column(Integer, default=0)
    total_lessons: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="module_progress")
    module: Mapped["LearningModule"] = relationship(back_populates="student_progress")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False, index=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id"), nullable=False, index=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    time_spent_minutes: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="lesson_progress")
    lesson: Mapped["Lesson"] = relationship(back_populates="progress")
