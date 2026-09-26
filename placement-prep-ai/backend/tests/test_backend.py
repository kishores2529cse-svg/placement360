"""
Backend tests for PlacementPrep AI.
Run: cd backend && python -m pytest tests/ -v
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.db.database import Base
from app.models import *  # Register all models
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.services.readiness_engine import calculate_readiness, save_readiness_snapshot
from app.services.recommendation_engine import generate_recommendations
from app.services.progress_service import update_streak, log_activity
from app.services.learning_service import complete_lesson
from datetime import date, timedelta, datetime, timezone


# ── Test Database ─────────────────────────────────────────────────────────────
TEST_DB_URL = "sqlite:///:memory:"

engine_test = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


@pytest.fixture(scope="function")
def db() -> Session:
    Base.metadata.create_all(bind=engine_test)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine_test)


def _create_demo_student(db: Session):
    """Helper: create a minimal student with skills for testing."""
    from app.models.user import User
    from app.models.student import Student
    from app.models.skill import Skill, StudentSkill, SkillCategory

    user = User(email="test@test.com", hashed_password=hash_password("test1234"))
    db.add(user)
    db.flush()

    student = Student(user_id=user.id, name="Test Student", target_role="SDE")
    db.add(student)
    db.flush()

    skills_data = [
        ("dsa", "DSA", SkillCategory.technical, 0.25),
        ("java", "Java", SkillCategory.technical, 0.08),
        ("sql", "SQL", SkillCategory.technical, 0.06),
        ("aptitude", "Aptitude", SkillCategory.aptitude, 0.15),
        ("communication", "Communication", SkillCategory.communication, 0.15),
        ("project", "Projects", SkillCategory.project, 0.10),
        ("interview", "Interview", SkillCategory.interview, 0.10),
    ]

    for name, display, cat, weight in skills_data:
        skill = Skill(name=name, display_name=display, category=cat, weight_in_readiness=weight)
        db.add(skill)
        db.flush()
        ss = StudentSkill(student_id=student.id, skill_id=skill.id, score=70.0, previous_score=65.0)
        db.add(ss)

    db.flush()
    return student, user


# ── Security Tests ────────────────────────────────────────────────────────────

def test_hash_password():
    pwd = "MySecurePass123!"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed)


def test_wrong_password_rejected():
    hashed = hash_password("correct_password")
    assert not verify_password("wrong_password", hashed)


def test_jwt_create_and_decode():
    token = create_access_token(subject=42)
    decoded = decode_access_token(token)
    assert decoded == "42"


def test_jwt_invalid_token():
    result = decode_access_token("invalid.token.here")
    assert result is None


# ── Readiness Engine Tests ────────────────────────────────────────────────────

def test_readiness_calculation(db):
    student, _ = _create_demo_student(db)
    readiness = calculate_readiness(db, student.id)
    assert 0 <= readiness.overall <= 100
    assert 0 <= readiness.technical <= 100
    assert 0 <= readiness.aptitude <= 100
    assert 0 <= readiness.communication <= 100


def test_readiness_with_high_scores(db):
    from app.models.user import User
    from app.models.student import Student
    from app.models.skill import Skill, StudentSkill, SkillCategory

    user = User(email="high@test.com", hashed_password=hash_password("pwd"))
    db.add(user)
    db.flush()
    student = Student(user_id=user.id, name="High Scorer")
    db.add(student)
    db.flush()

    for name, cat, weight in [
        ("dsa", SkillCategory.technical, 0.25),
        ("aptitude", SkillCategory.aptitude, 0.15),
        ("communication", SkillCategory.communication, 0.15),
        ("project", SkillCategory.project, 0.10),
        ("interview", SkillCategory.interview, 0.10),
    ]:
        skill = Skill(name=name, display_name=name.upper(), category=cat, weight_in_readiness=weight)
        db.add(skill)
        db.flush()
        ss = StudentSkill(student_id=student.id, skill_id=skill.id, score=100.0, previous_score=95.0)
        db.add(ss)
    db.flush()

    readiness = calculate_readiness(db, student.id)
    assert readiness.overall > 50  # High scores should give high readiness


def test_readiness_clamp(db):
    """Readiness should never exceed 100 or go below 0."""
    student, _ = _create_demo_student(db)
    readiness = calculate_readiness(db, student.id)
    assert readiness.overall <= 100.0
    assert readiness.overall >= 0.0


def test_save_readiness_snapshot(db):
    student, _ = _create_demo_student(db)
    readiness = calculate_readiness(db, student.id)
    snap = save_readiness_snapshot(db, student.id, readiness, trigger="test")
    assert snap.id is not None
    assert snap.overall_score == readiness.overall
    assert snap.student_id == student.id


def test_readiness_snapshot_upsert_today(db):
    """Saving two snapshots for the same day should update, not duplicate."""
    student, _ = _create_demo_student(db)
    readiness = calculate_readiness(db, student.id)
    snap1 = save_readiness_snapshot(db, student.id, readiness, trigger="test")
    snap2 = save_readiness_snapshot(db, student.id, readiness, trigger="test")
    assert snap1.id == snap2.id  # Same record, not a new one


# ── Recommendation Engine Tests ───────────────────────────────────────────────

def test_recommendations_generated_for_weak_skills(db):
    from app.models.user import User
    from app.models.student import Student
    from app.models.skill import Skill, StudentSkill, SkillCategory

    user = User(email="weak@test.com", hashed_password=hash_password("pwd"))
    db.add(user)
    db.flush()
    student = Student(user_id=user.id, name="Weak Scorer")
    db.add(student)
    db.flush()

    skill = Skill(name="dsa", display_name="DSA", category=SkillCategory.technical, weight_in_readiness=0.25)
    db.add(skill)
    db.flush()
    ss = StudentSkill(student_id=student.id, skill_id=skill.id, score=40.0, previous_score=45.0)
    db.add(ss)
    db.flush()

    recs = generate_recommendations(db, student.id)
    assert len(recs) >= 1
    assert any(r.priority == "high" for r in recs)


def test_recommendations_not_generated_for_strong_skills(db):
    from app.models.user import User
    from app.models.student import Student
    from app.models.skill import Skill, StudentSkill, SkillCategory

    user = User(email="strong@test.com", hashed_password=hash_password("pwd"))
    db.add(user)
    db.flush()
    student = Student(user_id=user.id, name="Strong Scorer")
    db.add(student)
    db.flush()

    skill = Skill(name="dsa", display_name="DSA", category=SkillCategory.technical, weight_in_readiness=0.25)
    db.add(skill)
    db.flush()
    ss = StudentSkill(student_id=student.id, skill_id=skill.id, score=92.0, previous_score=90.0)
    db.add(ss)
    db.flush()

    recs = generate_recommendations(db, student.id)
    assert all(r.priority != "high" for r in recs)


# ── Streak Tests ──────────────────────────────────────────────────────────────

def test_streak_initial_activity(db):
    student, _ = _create_demo_student(db)
    streak = update_streak(db, student.id)
    assert streak.current_streak == 1
    assert streak.longest_streak == 1
    assert streak.last_activity_date == date.today()


def test_streak_consecutive_days(db):
    from app.models.progress import Streak

    student, _ = _create_demo_student(db)
    yesterday = date.today() - timedelta(days=1)

    # Simulate existing streak from yesterday
    streak = Streak(
        student_id=student.id,
        current_streak=5,
        longest_streak=10,
        last_activity_date=yesterday,
    )
    db.add(streak)
    db.flush()

    updated = update_streak(db, student.id)
    assert updated.current_streak == 6
    assert updated.longest_streak == 10  # Was already 10
    assert updated.last_activity_date == date.today()


def test_streak_broken_resets(db):
    from app.models.progress import Streak

    student, _ = _create_demo_student(db)
    three_days_ago = date.today() - timedelta(days=3)

    streak = Streak(
        student_id=student.id,
        current_streak=15,
        longest_streak=20,
        last_activity_date=three_days_ago,
    )
    db.add(streak)
    db.flush()

    updated = update_streak(db, student.id)
    assert updated.current_streak == 1  # Reset
    assert updated.longest_streak == 20  # Max preserved


def test_streak_same_day_no_double_count(db):
    from app.models.progress import Streak

    student, _ = _create_demo_student(db)
    today = date.today()

    streak = Streak(
        student_id=student.id,
        current_streak=5,
        longest_streak=5,
        last_activity_date=today,
    )
    db.add(streak)
    db.flush()

    updated = update_streak(db, student.id)
    assert updated.current_streak == 5  # No change on same day


# ── LMS / Progress Tests ──────────────────────────────────────────────────────

def _create_minimal_lms(db: Session, student_id: int):
    from app.models.learning import LearningTrack, LearningModule, Lesson, StudentModuleProgress, ModuleStatus
    from app.models.skill import Skill, SkillCategory

    track = LearningTrack(title="Test Track", estimated_hours=10, order_index=1)
    db.add(track)
    db.flush()

    module = LearningModule(track_id=track.id, title="Test Module", order_index=1, difficulty="easy", estimated_minutes=60)
    db.add(module)
    db.flush()

    lesson = Lesson(module_id=module.id, title="Test Lesson", order_index=1, difficulty="easy", estimated_minutes=15)
    db.add(lesson)
    db.flush()

    # Make module available
    mp = StudentModuleProgress(
        student_id=student_id,
        module_id=module.id,
        status=ModuleStatus.available,
        total_lessons=1,
    )
    db.add(mp)
    db.flush()

    return track, module, lesson


def test_lesson_complete_marks_done(db):
    student, _ = _create_demo_student(db)
    track, module, lesson = _create_minimal_lms(db, student.id)

    result = complete_lesson(db, student.id, lesson.id, 10)
    assert result["is_completed"] is True


def test_lesson_complete_idempotent(db):
    student, _ = _create_demo_student(db)
    track, module, lesson = _create_minimal_lms(db, student.id)

    result1 = complete_lesson(db, student.id, lesson.id, 10)
    result2 = complete_lesson(db, student.id, lesson.id, 10)
    assert result1["is_completed"] is True
    assert result2["already_was_completed"] is True


def test_activity_logged_on_lesson_complete(db):
    from app.models.progress import DailyActivity

    student, _ = _create_demo_student(db)
    track, module, lesson = _create_minimal_lms(db, student.id)

    complete_lesson(db, student.id, lesson.id, 10)

    activities = db.query(DailyActivity).filter(DailyActivity.student_id == student.id).all()
    assert len(activities) >= 1
    assert any(a.activity_type == "lesson_complete" for a in activities)


# ── Skill Classification Tests ────────────────────────────────────────────────

def test_skill_classification_strong(db):
    from app.models.skill import Skill, StudentSkill, SkillCategory
    skill = Skill(name="test_skill", display_name="Test", category=SkillCategory.technical, weight_in_readiness=0.0)
    db.add(skill)
    db.flush()

    from app.models.user import User
    from app.models.student import Student
    user = User(email="cls@test.com", hashed_password=hash_password("p"))
    db.add(user); db.flush()
    student = Student(user_id=user.id, name="Classify Test")
    db.add(student); db.flush()

    ss = StudentSkill(student_id=student.id, skill_id=skill.id, score=85.0, previous_score=80.0)
    db.add(ss); db.flush()

    assert ss.classification == "Strong"
    assert ss.trend == 5.0


def test_skill_classification_developing(db):
    from app.models.skill import Skill, StudentSkill, SkillCategory
    from app.models.user import User
    from app.models.student import Student
    skill = Skill(name="test_skill2", display_name="Test2", category=SkillCategory.technical, weight_in_readiness=0.0)
    db.add(skill); db.flush()
    user = User(email="cls2@test.com", hashed_password=hash_password("p"))
    db.add(user); db.flush()
    student = Student(user_id=user.id, name="Test2")
    db.add(student); db.flush()
    ss = StudentSkill(student_id=student.id, skill_id=skill.id, score=68.0, previous_score=65.0)
    db.add(ss); db.flush()
    assert ss.classification == "Developing"


def test_skill_classification_needs_improvement(db):
    from app.models.skill import Skill, StudentSkill, SkillCategory
    from app.models.user import User
    from app.models.student import Student
    skill = Skill(name="test_skill3", display_name="Test3", category=SkillCategory.technical, weight_in_readiness=0.0)
    db.add(skill); db.flush()
    user = User(email="cls3@test.com", hashed_password=hash_password("p"))
    db.add(user); db.flush()
    student = Student(user_id=user.id, name="Test3")
    db.add(student); db.flush()
    ss = StudentSkill(student_id=student.id, skill_id=skill.id, score=45.0, previous_score=50.0)
    db.add(ss); db.flush()
    assert ss.classification == "Needs Improvement"
    assert ss.trend == -5.0
