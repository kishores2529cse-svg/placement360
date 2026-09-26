from datetime import datetime, timezone
from sqlalchemy import String, Integer, ForeignKey, DateTime, Float, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.db.database import Base


class SkillCategory(str, enum.Enum):
    technical = "technical"
    aptitude = "aptitude"
    communication = "communication"
    project = "project"
    interview = "interview"


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(
        Enum(SkillCategory, name="skill_category"), nullable=False, default=SkillCategory.technical
    )
    weight_in_readiness: Mapped[float] = mapped_column(Float, default=0.0)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    student_skills: Mapped[list["StudentSkill"]] = relationship(back_populates="skill")


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"), nullable=False, index=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"), nullable=False, index=True)
    score: Mapped[float] = mapped_column(Float, default=0.0)  # 0–100
    previous_score: Mapped[float] = mapped_column(Float, default=0.0)
    confidence: Mapped[float] = mapped_column(Float, default=0.5)  # 0–1
    last_assessed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="student_skills")
    skill: Mapped["Skill"] = relationship(back_populates="student_skills")

    @property
    def trend(self) -> float:
        return self.score - self.previous_score

    @property
    def classification(self) -> str:
        if self.score >= 80:
            return "Strong"
        elif self.score >= 60:
            return "Developing"
        else:
            return "Needs Improvement"
