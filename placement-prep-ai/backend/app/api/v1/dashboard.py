from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.dependencies import DbDep, CurrentUser
from app.models.student import Student
from app.services.dashboard_service import get_dashboard_data
from app.schemas.dashboard import DashboardOut

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _require_student(db: Session, user_id: int) -> Student:
    student = db.execute(select(Student).where(Student.user_id == user_id)).scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


@router.get("", response_model=DashboardOut)
def get_dashboard(db: DbDep, current_user: CurrentUser):
    student = _require_student(db, current_user.id)
    return get_dashboard_data(db, student.id, current_user.email)
