"""Authentication and user schemas."""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr


class UserResponse(BaseModel):
    """Public user profile schema."""

    id: uuid.UUID
    email: EmailStr
    name: str | None = None
    picture_url: str | None = None
    gmail_connected: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """OAuth login / token response schema."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class OAuthCallbackRequest(BaseModel):
    """Google OAuth callback payload."""

    code: str
    state: str
