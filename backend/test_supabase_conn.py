import asyncio
import ssl
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text


DATABASE_URL = "postgresql://postgres:lisK8z3Q0GfqmeX2@db.eubugzvpiahtpuhjmmbh.supabase.co:5432/postgres"

# If using the pooler instead:
# DATABASE_URL = "postgresql+asyncpg://postgres.eubugzvpiahtpuhjmmbh:YOUR_ACTUAL_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

async def test_connection():
    print("🔄 Attempting to connect to Supabase PostgreSQL...")

    # Configure SSL context for Supabase remote connection
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"ssl": ctx}
    )

    try:
        async with engine.connect() as conn:
            # 1. Test basic connectivity & version
            result = await conn.execute(text("SELECT version();"))
            version = result.scalar()
            print("✅ Successfully connected to Supabase!")
            print(f"📦 PostgreSQL Version: {version}\n")

            # 2. Check existing tables in public schema
            tables_result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """))
            tables = [row[0] for row in tables_result.fetchall()]

            print(f"📋 Existing tables found in public schema ({len(tables)}):")
            if tables:
                for table in tables:
                    print(f"  - {table}")
            else:
                print("  (No tables found yet - ready for initial migration/startup)")

    except Exception as e:
        print("❌ Connection failed!")
        print(f"Error details: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection())