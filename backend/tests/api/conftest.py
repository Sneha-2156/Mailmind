"""Fixtures for API/integration tests (need FastAPI + SQLAlchemy)."""

import asyncio
import uuid

import pytest
from fastapi.testclient import TestClient

from tests.conftest import TEST_DB


@pytest.fixture(autouse=True)
def _reset_db():
    from app.core.config import get_settings
    from app.database.connection import engine, init_db

    get_settings.cache_clear()
    if TEST_DB.exists():
        TEST_DB.unlink()
    asyncio.run(init_db())
    yield
    asyncio.run(engine.dispose())


@pytest.fixture()
def client():
    from app.main import app

    with TestClient(app) as c:
        yield c


async def _create_user(email: str, google_id: str):
    from app.database.connection import AsyncSessionLocal
    from app.models.user import User

    async with AsyncSessionLocal() as db:
        user = User(id=uuid.uuid4(), email=email, name=email.split("@")[0], google_id=google_id)
        db.add(user)
        await db.commit()
        return user.id


def make_user(email: str, google_id: str):
    """Create a (non-demo) user and return (user_id, bearer auth headers)."""
    from app.core.security import create_access_token

    user_id = asyncio.run(_create_user(email, google_id))
    token = create_access_token({"sub": str(user_id), "email": email})
    return user_id, {"Authorization": f"Bearer {token}"}


async def _create_email(user_id, subject: str):
    from app.database.connection import AsyncSessionLocal
    from app.models.email import Email

    async with AsyncSessionLocal() as db:
        e = Email(
            id=uuid.uuid4(),
            user_id=user_id,
            gmail_message_id=f"msg-{uuid.uuid4()}",
            subject=subject,
            sender_email="a@b.edu",
            body_text="hello",
        )
        db.add(e)
        await db.commit()
        return e.id


def make_email(user_id, subject: str = "Private subject"):
    return asyncio.run(_create_email(user_id, subject))
