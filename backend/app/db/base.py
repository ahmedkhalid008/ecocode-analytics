# Compatibility alias for declarative base and models
from app.models import Base, Organization, User, APIKey, Subscription, TelemetryLog

__all__ = [
    "Base",
    "Organization",
    "User",
    "APIKey",
    "Subscription",
    "TelemetryLog",
]
