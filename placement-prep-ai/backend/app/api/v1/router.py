from fastapi import APIRouter
from app.api.v1 import auth, students, dashboard, tracks, analytics

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(students.router)
router.include_router(dashboard.router)
router.include_router(tracks.router)
router.include_router(analytics.router)
