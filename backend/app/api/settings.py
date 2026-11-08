"""User settings and preferences API endpoints."""

from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database.connection import get_db
from app.models.user import User

router = APIRouter()


class SettingsUpdate(BaseModel):
    preferences: dict[str, Any]


@router.get("")
async def get_user_settings(user: User = Depends(get_current_user)):
    """Retrieve current user settings and Gmail connection status."""
    return {
        "email": user.email,
        "name": user.name,
        "gmail_connected": user.gmail_connected,
        "preferences": user.preferences,
    }


@router.patch("")
async def update_user_settings(
    payload: SettingsUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update user preferences."""
    current = dict(user.preferences) if user.preferences else {}
    current.update(payload.preferences)
    user.preferences = current
    await db.commit()
    return {"status": "success", "preferences": user.preferences}
