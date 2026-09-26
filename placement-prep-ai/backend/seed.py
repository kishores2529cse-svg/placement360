# -*- coding: utf-8 -*-
"""
Seed script — creates demo student Ashwin with full realistic data.
Run: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import date, timedelta, datetime, timezone
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
import app.models  # Register all models

from app.models.user import User
from app.models.student import Student
from app.models.skill import Skill, StudentSkill, SkillCategory
from app.models.learning import (
    LearningTrack, LearningModule, Lesson,
    StudentTrackProgress, StudentModuleProgress, LessonProgress, ModuleStatus,
)
from app.models.progress import (
    AssessmentAttempt, ReadinessHistory, Recommendation, DailyActivity, Streak,
)
from app.core.security import hash_password
from app.services.readiness_engine import calculate_readiness, save_readiness_snapshot
from app.services.recommendation_engine import generate_recommendations


def seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        # ── Clean existing demo data ─────────────────────────────────────────
        existing_user = db.query(User).filter(User.email == "ashwin@placementprep.ai").first()
        if existing_user:
            print("Demo user already exists. Dropping and re-seeding...")
            db.delete(existing_user)
            db.commit()

        # ── Create User ─────────────────────────────────────────────────────
        user = User(
            email="ashwin@placementprep.ai",
            hashed_password=hash_password("demo1234"),
            is_active=True,
        )
        db.add(user)
        db.flush()

        # ── Create Student ───────────────────────────────────────────────────
        student = Student(
            user_id=user.id,
            name="Ashwin Kumar",
            college="PSG College of Technology",
            branch="Computer Science Engineering",
            graduation_year=2025,
            target_role="Software Developer",
            target_company="Google",
            profile_completion=85.0,
        )
        db.add(student)
        db.flush()
        print(f"Created student: {student.name} (id={student.id})")

        # ── Create Skills ────────────────────────────────────────────────────
        skill_defs = [
            ("dsa", "DSA", SkillCategory.technical, 0.25),
            ("java", "Advanced Java", SkillCategory.technical, 0.08),
            ("python", "Python", SkillCategory.technical, 0.06),
            ("sql", "SQL & DBMS", SkillCategory.technical, 0.06),
            ("dbms", "Database Management", SkillCategory.technical, 0.05),
            ("oop", "OOP Concepts", SkillCategory.technical, 0.0),
            ("system_design", "System Design", SkillCategory.technical, 0.0),
            ("problem_solving", "Problem Solving", SkillCategory.technical, 0.0),
            ("aptitude", "Aptitude & Reasoning", SkillCategory.aptitude, 0.15),
            ("communication", "Communication", SkillCategory.communication, 0.15),
            ("project", "Projects", SkillCategory.project, 0.10),
            ("interview", "Interview Skills", SkillCategory.interview, 0.10),
        ]

        skill_map: dict[str, Skill] = {}
        for name, display, cat, weight in skill_defs:
            existing_skill = db.query(Skill).filter(Skill.name == name).first()
            if not existing_skill:
                skill = Skill(name=name, display_name=display, category=cat, weight_in_readiness=weight)
                db.add(skill)
                db.flush()
                skill_map[name] = skill
            else:
                skill_map[name] = existing_skill

        # ── Student Skill Scores ─────────────────────────────────────────────
        student_skill_scores = {
            "dsa": (68.0, 63.0),
            "java": (85.0, 83.0),
            "python": (72.0, 70.0),
            "sql": (55.0, 63.0),
            "dbms": (60.0, 58.0),
            "oop": (80.0, 76.0),
            "system_design": (48.0, 45.0),
            "problem_solving": (74.0, 71.0),
            "aptitude": (78.0, 74.0),
            "communication": (70.0, 67.0),
            "project": (65.0, 62.0),
            "interview": (58.0, 54.0),
        }

        for skill_name, (score, prev_score) in student_skill_scores.items():
            if skill_name in skill_map:
                ss = StudentSkill(
                    student_id=student.id,
                    skill_id=skill_map[skill_name].id,
                    score=score,
                    previous_score=prev_score,
                    confidence=min(1.0, score / 100),
                    last_assessed_at=datetime.now(timezone.utc),
                )
                db.add(ss)

        db.flush()

        # ── Learning Tracks ──────────────────────────────────────────────────
        tracks_data = [
            {
                "title": "Data Structures & Algorithms",
                "description": "Master DSA fundamentals through arrays, trees, graphs, and dynamic programming to ace technical interviews.",
                "icon": "Code2",
                "color": "emerald",
                "order_index": 1,
                "estimated_hours": 80,
                "skill": "dsa",
                "modules": [
                    {"title": "Arrays & Hashing", "difficulty": "easy", "estimated_minutes": 120, "lesson_count": 6},
                    {"title": "Two Pointers & Sliding Window", "difficulty": "easy", "estimated_minutes": 90, "lesson_count": 5},
                    {"title": "Stacks & Queues", "difficulty": "medium", "estimated_minutes": 100, "lesson_count": 5},
                    {"title": "Binary Search", "difficulty": "medium", "estimated_minutes": 90, "lesson_count": 4},
                    {"title": "Linked Lists", "difficulty": "medium", "estimated_minutes": 100, "lesson_count": 5},
                    {"title": "Trees & Binary Trees", "difficulty": "medium", "estimated_minutes": 120, "lesson_count": 6},
                    {"title": "Graphs & BFS/DFS", "difficulty": "hard", "estimated_minutes": 150, "lesson_count": 7},
                    {"title": "Dynamic Programming", "difficulty": "hard", "estimated_minutes": 180, "lesson_count": 8},
                    {"title": "Greedy Algorithms", "difficulty": "hard", "estimated_minutes": 120, "lesson_count": 5},
                    {"title": "Advanced Problems", "difficulty": "hard", "estimated_minutes": 120, "lesson_count": 4},
                ],
            },
            {
                "title": "Advanced Java",
                "description": "Deep dive into Java Collections, OOP, Multithreading, Spring Framework and enterprise patterns.",
                "icon": "Coffee",
                "color": "blue",
                "order_index": 2,
                "estimated_hours": 60,
                "skill": "java",
                "modules": [
                    {"title": "Java Fundamentals Review", "difficulty": "easy", "estimated_minutes": 60, "lesson_count": 4},
                    {"title": "Collections Framework", "difficulty": "medium", "estimated_minutes": 90, "lesson_count": 5},
                    {"title": "OOP & Design Patterns", "difficulty": "medium", "estimated_minutes": 120, "lesson_count": 6},
                    {"title": "Multithreading & Concurrency", "difficulty": "hard", "estimated_minutes": 150, "lesson_count": 6},
                    {"title": "Spring Boot Basics", "difficulty": "hard", "estimated_minutes": 120, "lesson_count": 5},
                ],
            },
            {
                "title": "SQL & DBMS",
                "description": "Master SQL queries, database design, indexing, and DBMS concepts for technical interviews.",
                "icon": "Database",
                "color": "orange",
                "order_index": 3,
                "estimated_hours": 40,
                "skill": "sql",
                "modules": [
                    {"title": "SQL Basics & SELECT", "difficulty": "easy", "estimated_minutes": 60, "lesson_count": 4},
                    {"title": "Joins & Subqueries", "difficulty": "medium", "estimated_minutes": 90, "lesson_count": 5},
                    {"title": "Aggregations & Window Functions", "difficulty": "medium", "estimated_minutes": 90, "lesson_count": 5},
                    {"title": "Database Design & Normalization", "difficulty": "medium", "estimated_minutes": 90, "lesson_count": 4},
                    {"title": "Indexing & Query Optimization", "difficulty": "hard", "estimated_minutes": 120, "lesson_count": 5},
                    {"title": "DBMS Concepts & Transactions", "difficulty": "hard", "estimated_minutes": 90, "lesson_count": 4},
                ],
            },
            {
                "title": "Aptitude & Reasoning",
                "description": "Sharpen quantitative aptitude, logical reasoning, and verbal ability for placement tests.",
                "icon": "Brain",
                "color": "purple",
                "order_index": 4,
                "estimated_hours": 30,
                "skill": "aptitude",
                "modules": [
                    {"title": "Quantitative Aptitude Basics", "difficulty": "easy", "estimated_minutes": 60, "lesson_count": 4},
                    {"title": "Time, Speed & Distance", "difficulty": "medium", "estimated_minutes": 60, "lesson_count": 4},
                    {"title": "Logical Reasoning", "difficulty": "medium", "estimated_minutes": 90, "lesson_count": 5},
                    {"title": "Verbal Ability", "difficulty": "medium", "estimated_minutes": 60, "lesson_count": 4},
                    {"title": "Data Interpretation", "difficulty": "hard", "estimated_minutes": 90, "lesson_count": 4},
                ],
            },
            {
                "title": "Communication Skills",
                "description": "Develop professional communication, presentation skills, and technical articulation ability.",
                "icon": "MessageCircle",
                "color": "teal",
                "order_index": 5,
                "estimated_hours": 20,
                "skill": "communication",
                "modules": [
                    {"title": "Technical Communication Basics", "difficulty": "easy", "estimated_minutes": 45, "lesson_count": 3},
                    {"title": "Presentation & Explanation", "difficulty": "medium", "estimated_minutes": 60, "lesson_count": 4},
                    {"title": "HR Interview Communication", "difficulty": "medium", "estimated_minutes": 60, "lesson_count": 4},
                ],
            },
            {
                "title": "System Design",
                "description": "Learn scalable system design principles, distributed systems, and architecture patterns.",
                "icon": "Layers",
                "color": "red",
                "order_index": 6,
                "estimated_hours": 50,
                "skill": "system_design",
                "modules": [
                    {"title": "System Design Fundamentals", "difficulty": "medium", "estimated_minutes": 90, "lesson_count": 4},
                    {"title": "Scalability & Load Balancing", "difficulty": "hard", "estimated_minutes": 120, "lesson_count": 5},
                    {"title": "Database Sharding & Replication", "difficulty": "hard", "estimated_minutes": 120, "lesson_count": 5},
                    {"title": "Caching Strategies", "difficulty": "hard", "estimated_minutes": 90, "lesson_count": 4},
                    {"title": "Case Studies: Real Systems", "difficulty": "hard", "estimated_minutes": 120, "lesson_count": 4},
                ],
            },
            {
                "title": "Interview Preparation",
                "description": "Comprehensive interview preparation covering technical rounds, HR questions, and problem-solving strategies.",
                "icon": "Users",
                "color": "indigo",
                "order_index": 7,
                "estimated_hours": 25,
                "skill": "interview",
                "modules": [
                    {"title": "Technical Interview Strategies", "difficulty": "medium", "estimated_minutes": 60, "lesson_count": 4},
                    {"title": "Behavioral & HR Questions", "difficulty": "easy", "estimated_minutes": 60, "lesson_count": 4},
                    {"title": "Resume & Project Discussion", "difficulty": "medium", "estimated_minutes": 60, "lesson_count": 3},
                    {"title": "Mock Interview Practice", "difficulty": "hard", "estimated_minutes": 90, "lesson_count": 3},
                ],
            },
        ]

        track_map: dict[str, LearningTrack] = {}
        lesson_difficulties = ["easy", "medium", "medium", "hard", "medium", "hard", "medium", "easy"]

        for track_data in tracks_data:
            track = LearningTrack(
                title=track_data["title"],
                description=track_data["description"],
                icon=track_data["icon"],
                color=track_data["color"],
                order_index=track_data["order_index"],
                estimated_hours=track_data["estimated_hours"],
                skill_id=skill_map.get(track_data["skill"], None) and skill_map[track_data["skill"]].id,
            )
            db.add(track)
            db.flush()
            track_map[track_data["title"]] = track

            for mod_idx, mod_data in enumerate(track_data["modules"]):
                module = LearningModule(
                    track_id=track.id,
                    title=mod_data["title"],
                    description=f"Master {mod_data['title']} concepts through structured lessons and practice exercises.",
                    order_index=mod_idx + 1,
                    difficulty=mod_data["difficulty"],
                    estimated_minutes=mod_data["estimated_minutes"],
                )
                db.add(module)
                db.flush()

                # Create lessons
                for lesson_idx in range(mod_data["lesson_count"]):
                    lesson_titles = [
                        f"Introduction to {mod_data['title']}",
                        f"Core Concepts: {mod_data['title']}",
                        f"Hands-on Practice: {mod_data['title']}",
                        f"Problem Patterns in {mod_data['title']}",
                        f"Advanced Techniques: {mod_data['title']}",
                        f"Interview Problems: {mod_data['title']}",
                        f"Edge Cases & Optimizations",
                        f"Summary & Review",
                    ]
                    lesson_title = lesson_titles[lesson_idx] if lesson_idx < len(lesson_titles) else f"Lesson {lesson_idx + 1}"
                    lesson = Lesson(
                        module_id=module.id,
                        title=lesson_title,
                        description=f"In-depth lesson covering {lesson_title.lower()} with examples and exercises.",
                        content=f"# {lesson_title}\n\nThis lesson covers the essential concepts of {mod_data['title']}.\n\n## Learning Objectives\n- Understand the core concepts\n- Apply techniques to solve problems\n- Practice with real interview questions\n\n## Key Points\n\nDetailed content would be loaded from the CMS in production.",
                        difficulty=lesson_difficulties[lesson_idx % len(lesson_difficulties)],
                        estimated_minutes=mod_data["estimated_minutes"] // mod_data["lesson_count"],
                        order_index=lesson_idx + 1,
                        skill_id=skill_map.get(track_data["skill"], None) and skill_map[track_data["skill"]].id,
                    )
                    db.add(lesson)

        db.flush()
        print("Created %d learning tracks with modules and lessons" % len(tracks_data))

        # ── Progress: Mark some lessons/modules complete ─────────────────────
        # DSA track: first 4 modules completed, 5th in progress
        dsa_track = track_map["Data Structures & Algorithms"]
        dsa_modules = sorted(dsa_track.modules, key=lambda m: m.order_index)

        for mod_idx, module in enumerate(dsa_modules[:4]):  # First 4 completed
            mp = StudentModuleProgress(
                student_id=student.id,
                module_id=module.id,
                status=ModuleStatus.completed,
                progress_percent=100.0,
                completed_lessons=len(module.lessons),
                total_lessons=len(module.lessons),
                started_at=datetime.now(timezone.utc) - timedelta(days=30 - mod_idx * 5),
                completed_at=datetime.now(timezone.utc) - timedelta(days=25 - mod_idx * 5),
            )
            db.add(mp)
            for lesson in module.lessons:
                lp = LessonProgress(
                    student_id=student.id,
                    lesson_id=lesson.id,
                    is_completed=True,
                    time_spent_minutes=lesson.estimated_minutes,
                    completed_at=datetime.now(timezone.utc) - timedelta(days=25 - mod_idx * 5),
                )
                db.add(lp)

        # 5th module: in_progress, 3 lessons done
        if len(dsa_modules) > 4:
            fifth_module = dsa_modules[4]
            mp5 = StudentModuleProgress(
                student_id=student.id,
                module_id=fifth_module.id,
                status=ModuleStatus.in_progress,
                progress_percent=60.0,
                completed_lessons=3,
                total_lessons=len(fifth_module.lessons),
                started_at=datetime.now(timezone.utc) - timedelta(days=5),
            )
            db.add(mp5)
            for lesson in list(fifth_module.lessons)[:3]:
                lp = LessonProgress(
                    student_id=student.id,
                    lesson_id=lesson.id,
                    is_completed=True,
                    time_spent_minutes=lesson.estimated_minutes,
                    completed_at=datetime.now(timezone.utc) - timedelta(days=3),
                )
                db.add(lp)

        # Mark remaining DSA modules as available
        for module in dsa_modules[5:]:
            mp = StudentModuleProgress(
                student_id=student.id,
                module_id=module.id,
                status=ModuleStatus.available,
                progress_percent=0.0,
                completed_lessons=0,
                total_lessons=len(module.lessons),
            )
            db.add(mp)

        # DSA Track progress
        completed_mods = 4
        total_mods = len(dsa_modules)
        avg_progress = (completed_mods * 100 + 60) / total_mods
        tp_dsa = StudentTrackProgress(
            student_id=student.id,
            track_id=dsa_track.id,
            progress_percent=round(avg_progress, 1),
            completed_modules=completed_mods,
            total_modules=total_mods,
            is_completed=False,
            started_at=datetime.now(timezone.utc) - timedelta(days=30),
            last_accessed_at=datetime.now(timezone.utc),
        )
        db.add(tp_dsa)

        # Java track: first 2 modules completed, 3rd in progress
        java_track = track_map["Advanced Java"]
        java_modules = sorted(java_track.modules, key=lambda m: m.order_index)

        for mod_idx, module in enumerate(java_modules[:2]):
            mp = StudentModuleProgress(
                student_id=student.id,
                module_id=module.id,
                status=ModuleStatus.completed,
                progress_percent=100.0,
                completed_lessons=len(module.lessons),
                total_lessons=len(module.lessons),
                started_at=datetime.now(timezone.utc) - timedelta(days=20),
                completed_at=datetime.now(timezone.utc) - timedelta(days=15),
            )
            db.add(mp)
            for lesson in module.lessons:
                lp = LessonProgress(
                    student_id=student.id,
                    lesson_id=lesson.id,
                    is_completed=True,
                    time_spent_minutes=lesson.estimated_minutes,
                    completed_at=datetime.now(timezone.utc) - timedelta(days=15),
                )
                db.add(lp)

        if len(java_modules) > 2:
            mp3 = StudentModuleProgress(
                student_id=student.id,
                module_id=java_modules[2].id,
                status=ModuleStatus.in_progress,
                progress_percent=40.0,
                completed_lessons=2,
                total_lessons=len(java_modules[2].lessons),
                started_at=datetime.now(timezone.utc) - timedelta(days=3),
            )
            db.add(mp3)

        tp_java = StudentTrackProgress(
            student_id=student.id,
            track_id=java_track.id,
            progress_percent=55.0,
            completed_modules=2,
            total_modules=len(java_modules),
            is_completed=False,
            started_at=datetime.now(timezone.utc) - timedelta(days=20),
            last_accessed_at=datetime.now(timezone.utc) - timedelta(days=2),
        )
        db.add(tp_java)

        db.flush()
        print("Created learning progress data")

        # ── Readiness History ────────────────────────────────────────────────
        readiness_data = [
            (30, 58, 52, 55, 62, 54),
            (27, 60, 54, 57, 63, 55),
            (24, 61, 55, 58, 64, 56),
            (21, 62, 56, 58, 65, 57),
            (18, 63, 58, 59, 66, 57),
            (15, 64, 60, 60, 67, 58),
            (12, 65, 62, 61, 68, 59),
            (9, 67, 63, 62, 69, 60),
            (7, 68, 65, 63, 70, 61),
            (5, 69, 66, 64, 71, 62),
            (3, 70, 68, 65, 72, 63),
            (1, 72, 70, 66, 74, 64),
            (0, 74, 72, 68, 76, 65),
        ]

        for days_ago, overall, technical, aptitude, comm, interview in readiness_data:
            snap_date = date.today() - timedelta(days=days_ago)
            existing_snap = db.query(ReadinessHistory).filter(
                ReadinessHistory.student_id == student.id,
                ReadinessHistory.date == snap_date
            ).first()
            if not existing_snap:
                snap = ReadinessHistory(
                    student_id=student.id,
                    date=snap_date,
                    overall_score=overall,
                    technical_score=technical,
                    aptitude_score=aptitude,
                    communication_score=comm,
                    interview_score=interview,
                    trigger="seed",
                )
                db.add(snap)

        db.flush()
        print("Created readiness history")

        # ── Streak ───────────────────────────────────────────────────────────
        streak = Streak(
            student_id=student.id,
            current_streak=12,
            longest_streak=21,
            last_activity_date=date.today(),
        )
        db.add(streak)
        db.flush()

        # ── Daily Activities ─────────────────────────────────────────────────
        activities = [
            (0, "lesson_complete", "Completed: Introduction to Binary Search Trees", "DSA", None, None),
            (0, "lesson_complete", "Completed: Core Concepts: Binary Search Trees", "DSA", None, None),
            (1, "assessment_complete", "DSA Assessment Completed", "DSA", 82.0, 5.0),
            (1, "lesson_complete", "Completed: Arrays & Hashing — Edge Cases", "DSA", None, None),
            (2, "skill_improved", "Java score improved", "Java", 85.0, 2.0),
            (2, "lesson_complete", "Completed: OOP & Design Patterns", "Java", None, None),
            (3, "assessment_complete", "Aptitude Test Completed", "Aptitude", 76.0, 3.0),
            (4, "lesson_complete", "Completed: Two Pointers Practice", "DSA", None, None),
            (5, "lesson_complete", "Completed: Stacks & Queues Implementation", "DSA", None, None),
            (6, "assessment_complete", "SQL Assessment Completed", "SQL", 55.0, -8.0),
            (7, "lesson_complete", "Completed: Java Collections Framework", "Java", None, None),
        ]

        for days_ago, activity_type, title, category, score, score_change in activities:
            act_date = date.today() - timedelta(days=days_ago)
            act = DailyActivity(
                student_id=student.id,
                activity_date=act_date,
                activity_type=activity_type,
                title=title,
                category=category,
                score=score,
                score_change=score_change,
                created_at=datetime.now(timezone.utc) - timedelta(days=days_ago, hours=2),
            )
            db.add(act)

        db.flush()
        print("Created activity history")

        # ── Generate Recommendations ─────────────────────────────────────────
        recommendations = generate_recommendations(db, student.id)
        print("Generated %d recommendations" % len(recommendations))

        db.commit()
        print("\n[OK] Seed complete!")
        print("\nDemo credentials:")
        print("  Email: ashwin@placementprep.ai")
        print("  Password: demo1234")
        print(f"\nStudent: {student.name}")
        print(f"  Target Role: {student.target_role} @ {student.target_company}")

    except Exception as e:
        db.rollback()
        print(f"\n[FAIL] Seed failed: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
