# Compatibility alias for database sessions and engines
from app.core.database import engine, async_engine, SessionLocal, AsyncSessionLocal, get_db, get_async_db

__all__ = [
    "engine",
    "async_engine",
    "SessionLocal",
    "AsyncSessionLocal",
    "get_db",
    "get_async_db",
]
