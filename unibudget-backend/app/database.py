# app/database.py
# Asynchronous database connection pool.
# Inspired by SQLAlchemy 2.0 best practices for high-concurrency environments.

import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./unibudget_dev.db"
    print("WARNING: DATABASE_URL not set. Using local SQLite for development.")
elif SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://") and "+asyncpg" not in SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

_is_postgres = SQLALCHEMY_DATABASE_URL.startswith("postgresql")
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=False,
    connect_args={"statement_cache_size": 0} if _is_postgres else {},
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session