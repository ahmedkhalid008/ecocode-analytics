import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """
    Application configuration settings loaded from environment variables or .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    ENVIRONMENT: str = Field(default="development", description="Execution environment: development, staging, production")
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")

    POSTGRES_USER: str = Field(default="ecocode")
    POSTGRES_PASSWORD: str = Field(default="ecocode_secret")
    POSTGRES_HOST: str = Field(default="localhost")
    POSTGRES_PORT: int = Field(default=5433)
    POSTGRES_DB: str = Field(default="ecocode_db")

    DATABASE_URL: Optional[str] = Field(
        default=None,
        description="SQLAlchemy synchronous connection string"
    )
    
    ASYNC_DATABASE_URL: Optional[str] = Field(
        default=None,
        description="SQLAlchemy asynchronous connection string"
    )

    # JWT Authentication Settings
    JWT_SECRET_KEY: str = Field(
        default="ecocode_super_secret_jwt_key_2026",
        description="Secret key for JWT encoding and decoding"
    )
    JWT_ALGORITHM: str = Field(default="HS256", description="Algorithm for JWT signing")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=1440,
        description="Access token expiration time in minutes (default 24 hours)"
    )

    def model_post_init(self, __context) -> None:
        """
        Derive database URLs if not explicitly passed.
        """
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        
        if not self.ASYNC_DATABASE_URL:
            if self.DATABASE_URL.startswith("postgresql+psycopg2://"):
                self.ASYNC_DATABASE_URL = self.DATABASE_URL.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
            elif self.DATABASE_URL.startswith("postgresql://"):
                self.ASYNC_DATABASE_URL = self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
            else:
                self.ASYNC_DATABASE_URL = (
                    f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                    f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
                )

    @property
    def sync_database_url(self) -> str:
        """Returns the synchronous database connection URL."""
        return self.DATABASE_URL or ""

    @property
    def async_database_url(self) -> str:
        """Returns the asynchronous database connection URL."""
        return self.ASYNC_DATABASE_URL or ""


settings = Settings()
