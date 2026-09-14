import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.database import engine
from app.models import Base


def main() -> None:
    """
    Standalone bootstrap script executing Base.metadata.create_all() directly on target PostgreSQL.
    """
    print("==================================================")
    print("EcoCode Analytics - Database Initialization")
    print("==================================================")
    print(f"Target Database URL: {settings.sync_database_url}")
    print(f"PostgreSQL Host:     {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}")
    print(f"Database Name:       {settings.POSTGRES_DB}")
    print(f"PostgreSQL User:     {settings.POSTGRES_USER}")
    print("--------------------------------------------------")

    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Successfully initialized database schema.")
        print("Created tables:")
        for table_name in sorted(Base.metadata.tables.keys()):
            print(f"  - {table_name}")
        print("--------------------------------------------------")
        print("Database bootstrap complete!")
    except Exception as e:
        print(f"❌ Error initializing database tables: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
