from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.keys import router as keys_router
from app.api.v1.telemetry import router as telemetry_router
from app.api.v1.analytics import router as analytics_router

api_v1_router = APIRouter(prefix="/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(keys_router)
api_v1_router.include_router(telemetry_router)
api_v1_router.include_router(analytics_router)
