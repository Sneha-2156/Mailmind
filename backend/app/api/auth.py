"""Authentication API endpoints (Google OAuth 2.0 & Development Mock Login)."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import RedirectResponse
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.oauth import (
    exchange_code_for_tokens,
    generate_oauth_state,
    get_authorization_url,
    revoke_token,
    validate_oauth_state,
)
from app.core.security import create_access_token, decrypt_token, encrypt_token, get_current_user
from app.database.connection import get_db
from app.models.oauth_credential import OAuthCredential
from app.models.user import User
from app.schemas.auth import UserResponse

router = APIRouter()
settings = get_settings()


def _set_session_cookie(response: Response, jwt_token: str) -> None:
    """Set the httpOnly session cookie. The JWT never appears in a URL or JS-readable storage."""
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        secure=settings.SESSION_COOKIE_SECURE,
        max_age=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


@router.get("/google")
@router.get("/google/authorize")
async def google_auth_login():
    """Initiate Google OAuth 2.0 flow."""
    state = generate_oauth_state()
    url = get_authorization_url(state)
    return {"authorization_url": url, "state": state}


@router.get("/google/callback")
async def google_auth_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Handle Google OAuth 2.0 callback, exchange tokens, and log in or create user."""
    if not validate_oauth_state(state):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OAuth state parameter.",
        )

    token_data = await exchange_code_for_tokens(code)
    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to retrieve access token from Google.",
        )

    # Fetch Google user profile
    async with httpx.AsyncClient() as client:
        user_info_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if user_info_resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to retrieve user profile from Google.",
            )
        user_profile = user_info_resp.json()

    user_email = user_profile.get("email")
    google_id = user_profile.get("id")
    name = user_profile.get("name")
    picture = user_profile.get("picture")

    # Look up or create user
    stmt = select(User).where((User.email == user_email) | (User.google_id == google_id))
    user = (await db.execute(stmt)).scalar_one_or_none()

    if not user:
        user = User(
            id=uuid.uuid4(),
            email=user_email,
            name=name,
            picture_url=picture,
            google_id=google_id,
            gmail_connected=True,
            preferences={"theme": "dark", "auto_sync": True},
        )
        db.add(user)
        await db.flush()
    else:
        user.name = name or user.name
        user.picture_url = picture or user.picture_url
        user.gmail_connected = True

    # Store encrypted OAuth tokens
    cred_stmt = select(OAuthCredential).where(
        OAuthCredential.user_id == user.id, OAuthCredential.provider == "google"
    )
    cred = (await db.execute(cred_stmt)).scalar_one_or_none()

    if not cred:
        cred = OAuthCredential(
            user_id=user.id,
            provider="google",
            access_token=encrypt_token(access_token),
            refresh_token=encrypt_token(refresh_token) if refresh_token else "",
            scopes=settings.GOOGLE_SCOPES,
        )
        db.add(cred)
    else:
        cred.access_token = encrypt_token(access_token)
        if refresh_token:
            cred.refresh_token = encrypt_token(refresh_token)

    await db.commit()

    # Generate JWT access token
    jwt_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    # Redirect to the app; the session travels only in the httpOnly cookie.
    response = RedirectResponse(url=f"{settings.CORS_ORIGINS[0]}/dashboard")
    _set_session_cookie(response, jwt_token)
    return response


@router.post("/dev-login")
async def dev_login(response: Response, db: AsyncSession = Depends(get_db)):
    """Instant login endpoint for local development and portfolio demonstration."""
    if settings.APP_ENV.lower() not in ("development", "test") and not settings.ALLOW_DEMO_LOGIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo login is disabled in this environment.",
        )
    demo_email = "demo@mailmind.ai"
    stmt = select(User).where(User.email == demo_email)
    user = (await db.execute(stmt)).scalar_one_or_none()

    if not user:
        user = User(
            id=uuid.uuid4(),
            email=demo_email,
            name="Alex Morgan",
            picture_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            google_id="demo-google-id-12345",
            gmail_connected=True,
            preferences={"theme": "dark", "auto_sync": True},
        )
        db.add(user)
        await db.commit()

    jwt_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    _set_session_cookie(response, jwt_token)

    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "picture_url": user.picture_url,
            "gmail_connected": user.gmail_connected,
            "preferences": user.preferences,
        },
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(user: User = Depends(get_current_user)):
    """Retrieve currently authenticated user profile."""
    return user


@router.post("/logout")
async def logout(response: Response):
    """Log out current user by clearing session cookie."""
    response.delete_cookie(key="access_token", path="/")
    return {"status": "success", "message": "Successfully logged out."}


@router.delete("/account")
async def delete_account(
    response: Response,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Permanently delete the current user account and associated data."""
    cred_stmt = select(OAuthCredential).where(
        OAuthCredential.user_id == user.id, OAuthCredential.provider == "google"
    )
    cred = (await db.execute(cred_stmt)).scalar_one_or_none()
    if cred:
        refresh = decrypt_token(cred.refresh_token or "")
        access = decrypt_token(cred.access_token or "")
        await revoke_token(refresh or access)

    await db.delete(user)
    await db.commit()
    response.delete_cookie(key="access_token", path="/")
    return {"status": "success", "message": "Account deleted."}
