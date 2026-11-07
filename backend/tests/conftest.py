"""Shared pytest fixtures for MailMind backend tests."""

import os
from pathlib import Path

TEST_DB = Path(__file__).resolve().parent / "test_mailmind.sqlite3"
os.environ["APP_ENV"] = "test"
os.environ["APP_DEBUG"] = "false"
os.environ["APP_SECRET_KEY"] = "test-secret-key-for-ci-only-32-chars"
os.environ["JWT_SECRET_KEY"] = "test-jwt-secret-key-for-ci-32-chars"
os.environ["ENCRYPTION_KEY"] = ""
os.environ["GOOGLE_CLIENT_ID"] = "test-client-id"
os.environ["GOOGLE_CLIENT_SECRET"] = "test-client-secret"
os.environ["AI_PROVIDER"] = ""
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{TEST_DB.as_posix()}"
os.environ["CORS_ORIGINS"] = "http://localhost:5173"

import pytest
from cryptography.fernet import Fernet
from fastapi.testclient import TestClient

os.environ["ENCRYPTION_KEY"] = Fernet.generate_key().decode()

from app.core.config import get_settings

get_settings.cache_clear()


@pytest.fixture(autouse=True)
def _reset_db():
    if TEST_DB.exists():
        TEST_DB.unlink()
    from app.core.config import get_settings as _gs
    from app.database.connection import engine, init_db
    import asyncio

    _gs.cache_clear()
    asyncio.run(init_db())
    yield
    asyncio.run(engine.dispose())
    if TEST_DB.exists():
        TEST_DB.unlink()


@pytest.fixture
def client():
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_client(client: TestClient):
    response = client.post("/api/v1/auth/dev-login")
    assert response.status_code == 200
    token = response.json()["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client
