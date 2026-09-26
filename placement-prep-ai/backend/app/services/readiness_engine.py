"""
Readiness Engine — calculates placement readiness score from skill scores.

Formula:
  DSA (25%) + Technical (25%) + Aptitude (15%) + Communication (15%) + Projects (10%) + Interview (10%)
"""
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.skill import StudentSkill, Skill, SkillCategory
from app.models.student import Student
from app.models.progress import ReadinessHistory
from app.schemas.dashboard import ReadinessOut
from datetime import datetime, timezone, date


# Readiness weights
READINESS_WEIGHTS = {
    "dsa": 0.25,
    "technical": 0.25,   # average of java, python, sql, dbms, oop, system_design
    "aptitude": 0.15,
    "communication": 0.15,
    "project": 0.10,
    "interview": 0.10,
}

TECHNICAL_SKILLS = {"java", "python", "sql", "dbms", "oop", "system_design", "problem_solving"}


def calculate_readiness(db: Session, student_id: int) -> ReadinessOut:
    """Calculate placement readiness from student skill scores."""
    # Load all student skills with skill definitions
    stmt = (
        select(StudentSkill, Skill)
        .join(Skill, StudentSkill.skill_id == Skill.id)
        .where(StudentSkill.student_id == student_id)
    )
    rows = db.execute(stmt).all()

    skill_scores: dict[str, float] = {}
    for ss, skill in rows:
        skill_scores[skill.name] = ss.score

    # DSA score
    dsa_score = skill_scores.get("dsa", 0.0)

    # Technical average (all technical skills except DSA)
    tech_skill_scores = [
        skill_scores[s] for s in TECHNICAL_SKILLS if s in skill_scores
    ]
    technical_score = sum(tech_skill_scores) / len(tech_skill_scores) if tech_skill_scores else 0.0

    # Aptitude
    aptitude_score = skill_scores.get("aptitude", 0.0)

    # Communication
    communication_score = skill_scores.get("communication", 0.0)

    # Projects
    project_score = skill_scores.get("project", 0.0)

    # Interview
    interview_score = skill_scores.get("interview", 0.0)

    # Weighted overall
    overall = (
        dsa_score * READINESS_WEIGHTS["dsa"]
        + technical_score * READINESS_WEIGHTS["technical"]
        + aptitude_score * READINESS_WEIGHTS["aptitude"]
        + communication_score * READINESS_WEIGHTS["communication"]
        + project_score * READINESS_WEIGHTS["project"]
        + interview_score * READINESS_WEIGHTS["interview"]
    )

    # Clamp to 0-100
    overall = max(0.0, min(100.0, overall))

    return ReadinessOut(
        overall=round(overall, 1),
        technical=round(technical_score, 1),
        aptitude=round(aptitude_score, 1),
        communication=round(communication_score, 1),
        interview=round(interview_score, 1),
        project=round(project_score, 1),
    )


def save_readiness_snapshot(
    db: Session, student_id: int, readiness: ReadinessOut, trigger: str = "manual"
) -> ReadinessHistory:
    """Save a readiness history snapshot. Upsert by date."""
    today = date.today()
    # Check if we already have an entry for today
    existing = db.execute(
        select(ReadinessHistory)
        .where(ReadinessHistory.student_id == student_id)
        .where(ReadinessHistory.date == today)
    ).scalar_one_or_none()

    if existing:
        existing.overall_score = readiness.overall
        existing.technical_score = readiness.technical
        existing.aptitude_score = readiness.aptitude
        existing.communication_score = readiness.communication
        existing.interview_score = readiness.interview
        existing.trigger = trigger
        db.flush()
        return existing
    else:
        snap = ReadinessHistory(
            student_id=student_id,
            date=today,
            overall_score=readiness.overall,
            technical_score=readiness.technical,
            aptitude_score=readiness.aptitude,
            communication_score=readiness.communication,
            interview_score=readiness.interview,
            trigger=trigger,
        )
        db.add(snap)
        db.flush()
        return snap
