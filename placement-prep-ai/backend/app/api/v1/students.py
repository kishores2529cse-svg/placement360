from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.dependencies import DbDep, CurrentUser
from app.models.student import Student
from app.schemas.student import StudentProfileOut, StudentProfileUpdate

router = APIRouter(prefix="/students", tags=["Students"])


def _get_student(db: Session, user_id: int) -> Student:
    student = db.execute(
        select(Student).where(Student.user_id == user_id)
    ).scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


@router.get("/me", response_model=StudentProfileOut)
def get_my_profile(db: DbDep, current_user: CurrentUser):
    student = _get_student(db, current_user.id)
    profile = StudentProfileOut(
        id=student.id,
        name=student.name,
        email=current_user.email,
        college=student.college,
        branch=student.branch,
        graduation_year=student.graduation_year,
        target_role=student.target_role,
        target_company=student.target_company,
        profile_completion=student.profile_completion,
    )
    return profile


@router.patch("/me", response_model=StudentProfileOut)
def update_my_profile(
    payload: StudentProfileUpdate,
    db: DbDep,
    current_user: CurrentUser,
):
    student = _get_student(db, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(student, field, value)
    db.commit()
    db.refresh(student)
    return StudentProfileOut(
        id=student.id,
        name=student.name,
        email=current_user.email,
        college=student.college,
        branch=student.branch,
        graduation_year=student.graduation_year,
        target_role=student.target_role,
        target_company=student.target_company,
        profile_completion=student.profile_completion,
    )
