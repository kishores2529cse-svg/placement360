"""
Recommendation Engine — generates learning recommendations based on skill weaknesses.

Logic:
1. Find skills below threshold (60 for Needs Improvement, 75 for needs attention)
2. Map weak skills to learning tracks/modules
3. Generate prioritized recommendations
4. Clear old auto-generated recommendations and insert new ones
"""
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from app.models.skill import StudentSkill, Skill
from app.models.learning import LearningTrack, LearningModule
from app.models.progress import Recommendation
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)

# Skill → track title mapping
SKILL_TRACK_MAP: dict[str, str] = {
    "dsa": "Data Structures & Algorithms",
    "java": "Advanced Java",
    "python": "Python Programming",
    "sql": "SQL & DBMS",
    "dbms": "SQL & DBMS",
    "oop": "Advanced Java",
    "system_design": "System Design",
    "aptitude": "Aptitude & Reasoning",
    "communication": "Communication Skills",
    "interview": "Interview Preparation",
    "project": "Project Building",
    "problem_solving": "Data Structures & Algorithms",
}

WEAK_THRESHOLD = 60.0      # Below this → HIGH priority recommendation
ATTENTION_THRESHOLD = 75.0  # Below this → MEDIUM priority recommendation


def generate_recommendations(db: Session, student_id: int) -> list[Recommendation]:
    """Generate fresh recommendations for a student based on current skill scores."""
    # Load student skills
    stmt = (
        select(StudentSkill, Skill)
        .join(Skill, StudentSkill.skill_id == Skill.id)
        .where(StudentSkill.student_id == student_id)
    )
    rows = db.execute(stmt).all()

    # Remove old auto-generated recommendations (not dismissed by user)
    db.execute(
        delete(Recommendation).where(
            Recommendation.student_id == student_id,
            Recommendation.is_dismissed == False,
        )
    )
    db.flush()

    recommendations: list[Recommendation] = []
    expires = datetime.now(timezone.utc) + timedelta(days=7)

    for ss, skill in rows:
        if ss.score < WEAK_THRESHOLD:
            priority = "high"
            reason = (
                f"Your {skill.display_name} score is {ss.score:.0f}%, "
                f"which is significantly below your target readiness level."
            )
        elif ss.score < ATTENTION_THRESHOLD:
            priority = "medium"
            reason = (
                f"Your {skill.display_name} score is {ss.score:.0f}%. "
                f"Consistent practice will push you into the Strong zone."
            )
        else:
            continue  # No recommendation needed for strong skills

        # Find matching track
        track_title = SKILL_TRACK_MAP.get(skill.name)
        track = None
        module = None
        if track_title:
            track = db.execute(
                select(LearningTrack).where(LearningTrack.title == track_title)
            ).scalar_one_or_none()
            if track and track.modules:
                # Suggest first non-completed module
                module = track.modules[0] if track.modules else None

        trend_text = ""
        if ss.score < ss.previous_score:
            trend_text = f" Your score dropped {ss.previous_score - ss.score:.0f}% since last assessment."

        rec = Recommendation(
            student_id=student_id,
            title=f"Improve {skill.display_name}",
            description=(
                f"Focus on strengthening your {skill.display_name} skills "
                f"to boost your placement readiness score.{trend_text}"
            ),
            reason=reason,
            priority=priority,
            rec_type="learn",
            track_id=track.id if track else None,
            module_id=module.id if module else None,
            skill_id=skill.id,
            is_active=True,
            expires_at=expires,
        )
        recommendations.append(rec)

    # Sort by priority: high first
    recommendations.sort(key=lambda r: 0 if r.priority == "high" else 1 if r.priority == "medium" else 2)

    # Limit to top 6
    recommendations = recommendations[:6]

    for rec in recommendations:
        db.add(rec)
    db.flush()
    return recommendations
