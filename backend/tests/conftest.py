"""Shared test environment. Sets env vars BEFORE any app module is imported."""

import os
from pathlib import Path

from cryptography.fernet import Fernet

TEST_DB = Path(__file__).resolve().parent / "test_mailmind.sqlite3"

os.environ["APP_ENV"] = "test"
os.environ["APP_DEBUG"] = "false"
os.environ["APP_SECRET_KEY"] = "test-secret-key-for-ci-only-32-chars"
os.environ["JWT_SECRET_KEY"] = "test-jwt-secret-key-for-ci-32-chars"
os.environ["ENCRYPTION_KEY"] = Fernet.generate_key().decode()
os.environ["GOOGLE_CLIENT_ID"] = "test-client-id"
os.environ["GOOGLE_CLIENT_SECRET"] = "test-client-secret"
os.environ["AI_PROVIDER"] = ""
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{TEST_DB.as_posix()}"
os.environ["CORS_ORIGINS"] = "http://localhost:5173"
