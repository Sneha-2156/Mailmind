"""GmailService behaviour with a mocked Gmail HTTP layer."""

import asyncio
import uuid

import pytest

from app.core.security import encrypt_token
from app.database.connection import AsyncSessionLocal
from app.models.oauth_credential import OAuthCredential
from app.models.user import User
from app.services import gmail_service as gs


async def _setup_user_with_cred():
    async with AsyncSessionLocal() as db:
        user = User(id=uuid.uuid4(), email="g@example.com", google_id="g-1")
        db.add(user)
        await db.flush()
        db.add(OAuthCredential(
            user_id=user.id, provider="google",
            access_token=encrypt_token("old-access"), refresh_token=encrypt_token("refresh-1"),
        ))
        await db.commit()
        return user.id


def test_failed_gmail_sync_raises_instead_of_falling_back_to_mock(monkeypatch):
    async def boom(self, token, max_results):
        raise gs.GmailSyncError("Gmail API returned 500")

    monkeypatch.setattr(gs.GmailService, "_sync_real_gmail", boom)

    async def run():
        uid = await _setup_user_with_cred()
        async with AsyncSessionLocal() as db:
            user = await db.get(User, uid)
            with pytest.raises(gs.GmailSyncError):
                await gs.GmailService(db, user).sync_emails()

    asyncio.run(run())


def test_expired_token_is_refreshed_once_and_retried(monkeypatch):
    calls = []

    async def fake_real(self, token, max_results):
        calls.append(token)
        if token == "old-access":
            raise PermissionError("expired")
        return {"synced_count": 1, "new_count": 1}

    async def fake_refresh(refresh_token):
        assert refresh_token == "refresh-1"
        return {"access_token": "new-access"}

    monkeypatch.setattr(gs.GmailService, "_sync_real_gmail", fake_real)
    monkeypatch.setattr(gs, "refresh_access_token", fake_refresh)

    async def run():
        uid = await _setup_user_with_cred()
        async with AsyncSessionLocal() as db:
            user = await db.get(User, uid)
            result = await gs.GmailService(db, user).sync_emails()
            assert result["mode"] == "gmail"
            assert await gs.GmailService(db, user).get_valid_access_token() == "new-access"

    asyncio.run(run())
    assert calls == ["old-access", "new-access"]
