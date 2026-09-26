from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class StudentProfileOut(BaseModel):
    id: int
    name: str
    email: str
    college: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    target_role: Optional[str] = None
    target_company: Optional[str] = None
    profile_completion: float

    model_config = {"from_attributes": True}


class StudentProfileUpdate(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    target_role: Optional[str] = None
    target_company: Optional[str] = None
