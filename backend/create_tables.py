import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

# Import database engines (supporting both core and db aliases)
try:
    from app.core.database import async_engine, engine
except ImportError:
    from app.db.session import async_engine, engine

# Import all models to register metadata
try:
    from app.models import Base, Organization, User, APIKey, Subscription, TelemetryLog
except ImportError:
    from app.db.base import Base


async def init_tables_async() -> None:
    """
    Asynchronously connects to PostgreSQL via asyncpg and creates all database tables.
    Resolves SQLAlchemy Greenlet / Alembic migration errors on Render deployment.
    """
    print("==================================================")
    print("EcoCode Analytics - Automated Database Table Init")
    print("==================================================")
    print(f"Target Sync Database URL:  {settings.sync_database_url}")
    print(f"Target Async Database URL: {settings.async_database_url}")
    print(f"Environment:               {settings.ENVIRONMENT}")
    print("--------------------------------------------------")

    try:
        print("Connecting via Async Engine (asyncpg)...")
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        print("[SUCCESS] Executed Base.metadata.create_all via Async Engine.")
        print("Registered Tables:")
        for table in sorted(Base.metadata.tables.keys()):
            print(f"  - {table}")
        
    except Exception as async_err:
        print(f"[WARNING] Async table creation failed: {async_err}")
        print("Attempting fallback via Synchronous Engine (psycopg2)...")
        try:
            Base.metadata.create_all(bind=engine)
            print("[SUCCESS] Created tables via Sync Engine fallback.")
        except Exception as sync_err:
            print(f"[ERROR] Failed to create database tables: {sync_err}", file=sys.stderr)
            sys.exit(1)
    finally:
        try:
            await async_engine.dispose()
        except Exception:
            pass

    print("--------------------------------------------------")
    print("Database table initialization complete!")


def main() -> None:
    """Main entry point executing the async table initialization runner."""
    try:
        asyncio.run(init_tables_async())
    except KeyboardInterrupt:
        print("\nInitialization cancelled by user.")
        sys.exit(1)


if __name__ == "__main__":
    main()
