from typing import Generator, AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.core.config import settings

# Synchronous SQLAlchemy Engine & Session Factory
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Asynchronous SQLAlchemy Engine & Session Factory
async_engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a synchronous database session.
    Automatically closes the session after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields an asynchronous database session.
    Automatically closes the session after request completion.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
