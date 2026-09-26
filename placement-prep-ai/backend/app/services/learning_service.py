"""Learning service — manage track/module/lesson progress."""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.learning import (
    LearningTrack,
    LearningModule,
    Lesson,
    StudentTrackProgress,
    StudentModuleProgress,
    LessonProgress,
    ModuleStatus,
)
from app.models.student import Student
from app.services.progress_service import log_activity
from app.services.readiness_engine import calculate_readiness, save_readiness_snapshot
from app.services.recommendation_engine import generate_recommendations


def get_track_with_progress(
    db: Session, student_id: int, track_id: int
) -> dict:
    """Get a track with per-module and per-lesson progress for this student."""
    track = db.get(LearningTrack, track_id)
    if not track:
        return None

    # Track-level progress
    tp = db.execute(
        select(StudentTrackProgress)
        .where(
            StudentTrackProgress.student_id == student_id,
            StudentTrackProgress.track_id == track_id,
        )
    ).scalar_one_or_none()

    modules_out = []
    for mod in track.modules:
        if not mod.is_active:
            continue
        mp = db.execute(
            select(StudentModuleProgress)
            .where(
                StudentModuleProgress.student_id == student_id,
                StudentModuleProgress.module_id == mod.id,
            )
        ).scalar_one_or_none()

        lessons_out = []
        for lesson in mod.lessons:
            if not lesson.is_active:
                continue
            lp = db.execute(
                select(LessonProgress)
                .where(
                    LessonProgress.student_id == student_id,
                    LessonProgress.lesson_id == lesson.id,
                )
            ).scalar_one_or_none()
            lessons_out.append({
                "id": lesson.id,
                "title": lesson.title,
                "description": lesson.description,
                "difficulty": lesson.difficulty,
                "estimated_minutes": lesson.estimated_minutes,
                "order_index": lesson.order_index,
                "is_completed": lp.is_completed if lp else False,
            })

        status = mp.status if mp else ModuleStatus.locked
        progress = mp.progress_percent if mp else 0.0
        completed_lessons = mp.completed_lessons if mp else 0

        modules_out.append({
            "id": mod.id,
            "title": mod.title,
            "description": mod.description,
            "order_index": mod.order_index,
            "difficulty": mod.difficulty,
            "estimated_minutes": mod.estimated_minutes,
            "status": status,
            "progress_percent": progress,
            "completed_lessons": completed_lessons,
            "total_lessons": len(lessons_out),
            "lessons": lessons_out,
        })

    return {
        "id": track.id,
        "title": track.title,
        "description": track.description,
        "icon": track.icon,
        "color": track.color,
        "estimated_hours": track.estimated_hours,
        "progress_percent": tp.progress_percent if tp else 0.0,
        "completed_modules": tp.completed_modules if tp else 0,
        "total_modules": len(modules_out),
        "is_completed": tp.is_completed if tp else False,
        "modules": modules_out,
    }


def complete_lesson(db: Session, student_id: int, lesson_id: int, time_spent: int = 0) -> dict:
    """Mark a lesson as completed and cascade progress updates."""
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise ValueError(f"Lesson {lesson_id} not found")

    # Upsert lesson progress
    lp = db.execute(
        select(LessonProgress)
        .where(LessonProgress.student_id == student_id, LessonProgress.lesson_id == lesson_id)
    ).scalar_one_or_none()

    if not lp:
        lp = LessonProgress(student_id=student_id, lesson_id=lesson_id)
        db.add(lp)

    already_completed = lp.is_completed
    lp.is_completed = True
    lp.time_spent_minutes = time_spent
    if not already_completed:
        lp.completed_at = datetime.now(timezone.utc)
    db.flush()

    # Update module progress
    module = lesson.module
    _update_module_progress(db, student_id, module)

    # Update track progress
    _update_track_progress(db, student_id, module.track_id)

    if not already_completed:
        # Log activity
        log_activity(
            db,
            student_id=student_id,
            activity_type="lesson_complete",
            title=f"Lesson completed: {lesson.title}",
            category=module.track.title,
            details=f"Module: {module.title}",
        )

        # Recalculate readiness and save history
        readiness = calculate_readiness(db, student_id)
        save_readiness_snapshot(db, student_id, readiness, trigger="lesson")

        # Refresh recommendations
        generate_recommendations(db, student_id)

    db.commit()

    return {"lesson_id": lesson_id, "is_completed": True, "already_was_completed": already_completed}


def _update_module_progress(db: Session, student_id: int, module: LearningModule):
    """Recalculate module completion progress."""
    total_lessons = db.execute(
        select(Lesson).where(Lesson.module_id == module.id, Lesson.is_active == True)
    ).scalars().all()
    total = len(total_lessons)

    completed = 0
    for lesson in total_lessons:
        lp = db.execute(
            select(LessonProgress)
            .where(LessonProgress.student_id == student_id, LessonProgress.lesson_id == lesson.id)
        ).scalar_one_or_none()
        if lp and lp.is_completed:
            completed += 1

    progress = (completed / total * 100) if total > 0 else 0.0
    is_completed = completed >= total and total > 0

    mp = db.execute(
        select(StudentModuleProgress)
        .where(
            StudentModuleProgress.student_id == student_id,
            StudentModuleProgress.module_id == module.id,
        )
    ).scalar_one_or_none()

    if not mp:
        mp = StudentModuleProgress(student_id=student_id, module_id=module.id)
        db.add(mp)

    mp.progress_percent = round(progress, 1)
    mp.completed_lessons = completed
    mp.total_lessons = total
    if mp.status == ModuleStatus.locked or mp.status == ModuleStatus.available:
        mp.status = ModuleStatus.in_progress
    if is_completed:
        mp.status = ModuleStatus.completed
        if not mp.completed_at:
            mp.completed_at = datetime.now(timezone.utc)

    db.flush()


def _update_track_progress(db: Session, student_id: int, track_id: int):
    """Recalculate track completion progress."""
    track = db.get(LearningTrack, track_id)
    active_modules = [m for m in track.modules if m.is_active]
    total = len(active_modules)

    completed_count = 0
    total_progress = 0.0
    for mod in active_modules:
        mp = db.execute(
            select(StudentModuleProgress)
            .where(
                StudentModuleProgress.student_id == student_id,
                StudentModuleProgress.module_id == mod.id,
            )
        ).scalar_one_or_none()
        if mp:
            if mp.status == ModuleStatus.completed:
                completed_count += 1
            total_progress += mp.progress_percent
        else:
            total_progress += 0.0

    avg_progress = total_progress / total if total > 0 else 0.0
    is_completed = completed_count >= total and total > 0

    tp = db.execute(
        select(StudentTrackProgress)
        .where(
            StudentTrackProgress.student_id == student_id,
            StudentTrackProgress.track_id == track_id,
        )
    ).scalar_one_or_none()

    if not tp:
        tp = StudentTrackProgress(
            student_id=student_id,
            track_id=track_id,
            started_at=datetime.now(timezone.utc),
        )
        db.add(tp)

    tp.progress_percent = round(avg_progress, 1)
    tp.completed_modules = completed_count
    tp.total_modules = total
    tp.is_completed = is_completed
    tp.last_accessed_at = datetime.now(timezone.utc)
    if is_completed and not tp.completed_at:
        tp.completed_at = datetime.now(timezone.utc)

    db.flush()
