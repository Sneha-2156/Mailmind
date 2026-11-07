"""Application settings and configuration management."""

from functools import lru_cache
from typing import Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables and .env file."""

    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "default-insecure-secret-key-32-chars-minimum-change-me"
    APP_NAME: str = "MailMind AI"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    APP_DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://mailmind:mailmind_secret@localhost:5432/mailmind_db"

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"
    GOOGLE_SCOPES: list[str] = [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.modify",
    ]

    ENCRYPTION_KEY: str = ""
    JWT_SECRET_KEY: str = "default-insecure-jwt-key-32-chars-minimum-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    SESSION_COOKIE_SECURE: bool = False
    SESSION_COOKIE_SAMESITE: str = "lax"
    CORS_ORIGINS: Union[list[str], str] = ["http://localhost:5173", "http://localhost:3000"]

    AI_PROVIDER: str = ""
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    ML_MODEL_PATH: str = "ml/artifacts/model_v1.pkl"
    ML_CONFIDENCE_THRESHOLD: float = 0.45

    GMAIL_MAX_EMAILS_PER_SYNC: int = 50
    GMAIL_SYNC_HISTORY_DAYS: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, list[str]]) -> list[str]:
        if isinstance(v, str):
            return [item.strip() for item in v.split(",") if item.strip()]
        return v


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings singleton."""
    return Settings()
