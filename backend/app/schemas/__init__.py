from app.schemas.auth import UserRegister, UserLogin, Token, TokenPayload, UserResponse
from app.schemas.organization import OrganizationResponse, OrganizationUpdate
from app.schemas.api_key import APIKeyCreate, APIKeyCreatedResponse, APIKeyResponse
from app.schemas.telemetry import TelemetryPayload, TelemetryBatchIngest, TelemetryIngestResponse
from app.schemas.analytics import AnalyticsSummary, WorkloadCO2Ranking, DepartmentCO2Breakdown
from app.schemas.recommendations import RecommendationInsight, RecommendationListResponse

__all__ = [
    "UserRegister",
    "UserLogin",
    "Token",
    "TokenPayload",
    "UserResponse",
    "OrganizationResponse",
    "OrganizationUpdate",
    "APIKeyCreate",
    "APIKeyCreatedResponse",
    "APIKeyResponse",
    "TelemetryPayload",
    "TelemetryBatchIngest",
    "TelemetryIngestResponse",
    "AnalyticsSummary",
    "WorkloadCO2Ranking",
    "DepartmentCO2Breakdown",
    "RecommendationInsight",
    "RecommendationListResponse",
]
