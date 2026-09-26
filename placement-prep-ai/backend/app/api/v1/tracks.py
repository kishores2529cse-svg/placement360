from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from datetime import datetime, timezone

from app.core.dependencies import DbDep, CurrentUser
from app.models.student import Student
from app.models.learning import (
    LearningTrack,
    LearningModule,
    StudentModuleProgress,
    ModuleStatus,
)
from app.schemas.learning import (
    TrackOut,
    ModuleOut,
    LessonCompleteRequest,
    AssessmentResultPayload,
)
from app.services.learning_service import get_track_with_progress, complete_lesson
from app.services.readiness_engine import calculate_readiness, save_readiness_snapshot
from app.services.recommendation_engine import generate_recommendations
from app.services.progress_service import log_activity
from app.models.skill import StudentSkill, Skill
from app.models.progress import AssessmentAttempt

router = APIRouter(tags=["LMS"])


def _require_student(db: Session, user_id: int) -> Student:
    student = db.execute(select(Student).where(Student.user_id == user_id)).scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


# ─── Tracks ───────────────────────────────────────────────────────────────────

@router.get("/tracks", tags=["Tracks"])
def list_tracks(db: DbDep, current_user: CurrentUser):
    student = _require_student(db, current_user.id)
    tracks = db.execute(
        select(LearningTrack).where(LearningTrack.is_active == True).order_by(LearningTrack.order_index)
    ).scalars().all()

    result = []
    for track in tracks:
        data = get_track_with_progress(db, student.id, track.id)
        if data:
            result.append(data)
    return result


@router.get("/tracks/{track_id}", tags=["Tracks"])
def get_track(track_id: int, db: DbDep, current_user: CurrentUser):
    student = _require_student(db, current_user.id)
    data = get_track_with_progress(db, student.id, track_id)
    if not data:
        raise HTTPException(status_code=404, detail="Track not found")
    return data


@router.get("/tracks/{track_id}/modules", tags=["Tracks"])
def get_track_modules(track_id: int, db: DbDep, current_user: CurrentUser):
    student = _require_student(db, current_user.id)
    data = get_track_with_progress(db, student.id, track_id)
    if not data:
        raise HTTPException(status_code=404, detail="Track not found")
    return data["modules"]


# ─── Modules ──────────────────────────────────────────────────────────────────

@router.get("/modules/{module_id}", tags=["Modules"])
def get_module(module_id: int, db: DbDep, current_user: CurrentUser):
    student = _require_student(db, current_user.id)
    module = db.get(LearningModule, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    track_data = get_track_with_progress(db, student.id, module.track_id)
    modules = track_data.get("modules", []) if track_data else []
    for m in modules:
        if m["id"] == module_id:
            return m
    raise HTTPException(status_code=404, detail="Module not found in student context")


@router.post("/modules/{module_id}/start", tags=["Modules"])
def start_module(module_id: int, db: DbDep, current_user: CurrentUser):
    student = _require_student(db, current_user.id)
    module = db.get(LearningModule, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    mp = db.execute(
        select(StudentModuleProgress)
        .where(
            StudentModuleProgress.student_id == student.id,
            StudentModuleProgress.module_id == module_id,
        )
    ).scalar_one_or_none()

    if not mp:
        mp = StudentModuleProgress(
            student_id=student.id,
            module_id=module_id,
            status=ModuleStatus.in_progress,
            started_at=datetime.now(timezone.utc),
        )
        db.add(mp)
    elif mp.status == ModuleStatus.locked or mp.status == ModuleStatus.available:
        mp.status = ModuleStatus.in_progress
        if not mp.started_at:
            mp.started_at = datetime.now(timezone.utc)

    db.commit()
    return {"module_id": module_id, "status": mp.status}


# ─── Lessons ──────────────────────────────────────────────────────────────────

@router.post("/lessons/{lesson_id}/complete", tags=["Lessons"])
def complete_lesson_endpoint(
    lesson_id: int,
    payload: LessonCompleteRequest,
    db: DbDep,
    current_user: CurrentUser,
):
    student = _require_student(db, current_user.id)
    result = complete_lesson(db, student.id, lesson_id, payload.time_spent_minutes)
    return result


# ─── Student Progress ─────────────────────────────────────────────────────────

@router.get("/student/progress", tags=["Progress"])
def get_student_progress(db: DbDep, current_user: CurrentUser):
    student = _require_student(db, current_user.id)
    tracks = db.execute(
        select(LearningTrack).where(LearningTrack.is_active == True).order_by(LearningTrack.order_index)
    ).scalars().all()
    return [get_track_with_progress(db, student.id, t.id) for t in tracks]


# ─── Skills ───────────────────────────────────────────────────────────────────

@router.get("/skills", tags=["Skills"])
def get_skills(db: DbDep, current_user: CurrentUser):
    student = _require_student(db, current_user.id)
    rows = db.execute(
        select(StudentSkill, Skill)
        .join(Skill, StudentSkill.skill_id == Skill.id)
        .where(StudentSkill.student_id == student.id)
    ).all()
    return [
        {
            "id": skill.id,
            "name": skill.name,
            "display_name": skill.display_name,
            "category": skill.category,
            "score": ss.score,
            "previous_score": ss.previous_score,
            "trend": ss.trend,
            "classification": ss.classification,
            "confidence": ss.confidence,
            "last_assessed_at": ss.last_assessed_at,
        }
        for ss, skill in rows
    ]


# ─── Recommendations ──────────────────────────────────────────────────────────

@router.get("/recommendations", tags=["Recommendations"])
def get_recommendations(db: DbDep, current_user: CurrentUser):
    student = _require_student(db, current_user.id)
    from app.models.progress import Recommendation
    recs = db.execute(
        select(Recommendation)
        .where(
            Recommendation.student_id == student.id,
            Recommendation.is_active == True,
            Recommendation.is_dismissed == False,
        )
        .order_by(Recommendation.priority.desc(), Recommendation.created_at.desc())
        .limit(10)
    ).scalars().all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "reason": r.reason,
            "priority": r.priority,
            "rec_type": r.rec_type,
            "track_id": r.track_id,
            "module_id": r.module_id,
            "created_at": r.created_at,
        }
        for r in recs
    ]


# ─── Assessment Integration (Kishore's API contract) ─────────────────────────

@router.post("/assessments/{attempt_id}/results", tags=["Assessment Integration"])
def receive_assessment_results(
    attempt_id: str,
    payload: AssessmentResultPayload,
    db: DbDep,
    current_user: CurrentUser,
):
    """
    Integration endpoint for Kishore's assessment system.
    Receives validated assessment results, updates skills, recalculates readiness,
    saves history, and generates new recommendations.
    """
    student = _require_student(db, current_user.id)

    # Check if this attempt was already processed
    existing = db.execute(
        select(AssessmentAttempt)
        .where(AssessmentAttempt.external_attempt_id == attempt_id)
    ).scalar_one_or_none()
    if existing and existing.processed:
        raise HTTPException(status_code=409, detail="Assessment attempt already processed")

    # 1. Save attempt record
    attempt = existing or AssessmentAttempt(
        student_id=student.id,
        external_attempt_id=attempt_id,
    )
    attempt.assessment_type = payload.assessment_type
    attempt.skill_scores = payload.skills
    attempt.communication_score = payload.communication
    attempt.raw_payload = payload.model_dump()
    attempt.processed = False

    if not existing:
        db.add(attempt)
    db.flush()

    # 2. Update student skill scores
    for skill_name, new_score in payload.skills.items():
        skill = db.execute(select(Skill).where(Skill.name == skill_name)).scalar_one_or_none()
        if not skill:
            continue

        ss = db.execute(
            select(StudentSkill)
            .where(StudentSkill.student_id == student.id, StudentSkill.skill_id == skill.id)
        ).scalar_one_or_none()

        if ss:
            ss.previous_score = ss.score
            ss.score = float(new_score)
            from datetime import datetime, timezone
            ss.last_assessed_at = datetime.now(timezone.utc)
        else:
            ss = StudentSkill(
                student_id=student.id,
                skill_id=skill.id,
                score=float(new_score),
                previous_score=0.0,
            )
            db.add(ss)

    # Update communication if provided
    if payload.communication is not None:
        comm_skill = db.execute(select(Skill).where(Skill.name == "communication")).scalar_one_or_none()
        if comm_skill:
            ss = db.execute(
                select(StudentSkill)
                .where(StudentSkill.student_id == student.id, StudentSkill.skill_id == comm_skill.id)
            ).scalar_one_or_none()
            if ss:
                ss.previous_score = ss.score
                ss.score = payload.communication
            else:
                ss = StudentSkill(
                    student_id=student.id,
                    skill_id=comm_skill.id,
                    score=payload.communication,
                )
                db.add(ss)

    db.flush()

    # 3. Calculate readiness
    readiness = calculate_readiness(db, student.id)

    # 4. Save readiness history
    save_readiness_snapshot(db, student.id, readiness, trigger="assessment")

    # 5. Generate recommendations
    generate_recommendations(db, student.id)

    # 6. Log activity
    overall_score = sum(payload.skills.values()) / len(payload.skills) if payload.skills else 0
    log_activity(
        db,
        student_id=student.id,
        activity_type="assessment_complete",
        title=f"Assessment completed: {payload.assessment_type or 'Assessment'}",
        category="Assessment",
        score=overall_score,
    )

    attempt.processed = True
    db.commit()

    return {
        "message": "Assessment results processed successfully",
        "attempt_id": attempt_id,
        "readiness": {
            "overall": readiness.overall,
            "technical": readiness.technical,
            "aptitude": readiness.aptitude,
            "communication": readiness.communication,
        },
    }
