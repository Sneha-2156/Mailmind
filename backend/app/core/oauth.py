"""Google OAuth 2.0 flow utilities and token lifecycle management."""

import secrets
import time
from urllib.parse import urlencode
import httpx
from fastapi import HTTPException, status
from app.core.config import get_settings

# In-memory TTL state store: state -> expiry_timestamp
_state_store: dict[str, float] = {}
STATE_TTL_SECONDS = 300  # 5 minutes


def _clean_expired_states() -> None:
    """Purge expired states from the in-memory store."""
    now = time.time()
    expired = [k for k, exp in _state_store.items() if now > exp]
    for k in expired:
        _state_store.pop(k, None)


def generate_oauth_state() -> str:
    """Generate cryptographically secure state parameter and store with 5m TTL."""
    _clean_expired_states()
    state = secrets.token_urlsafe(32)
    _state_store[state] = time.time() + STATE_TTL_SECONDS
    return state


def validate_oauth_state(state: str) -> bool:
    """Validate and consume OAuth state. States are strictly single-use."""
    _clean_expired_states()
    if not state or state not in _state_store:
        return False
    expiry = _state_store.pop(state)
    return time.time() <= expiry


def get_authorization_url(state: str) -> str:
    """Construct the Google OAuth 2.0 authorization URL."""
    settings = get_settings()
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(settings.GOOGLE_SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
        "include_granted_scopes": "true",
    }
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"


async def exchange_code_for_tokens(code: str) -> dict:
    """Exchange authorization code for access and refresh tokens."""
    settings = get_settings()
    url = "https://oauth2.googleapis.com/token"
    payload = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(url, data=payload)
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to exchange authorization code: {response.text}",
            )
        return response.json()


async def refresh_access_token(refresh_token: str) -> dict:
    """Obtain a new access token using a valid refresh token."""
    settings = get_settings()
    url = "https://oauth2.googleapis.com/token"
    payload = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(url, data=payload)
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to refresh access token: {response.text}",
            )
        return response.json()


async def revoke_token(token: str) -> bool:
    """Revoke a token (access or refresh token) with Google."""
    if not token:
        return True
    url = f"https://oauth2.googleapis.com/revoke?token={token}"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, headers=headers)
            return response.status_code == 200
    except Exception:
        return False


async def get_user_info(access_token: str) -> dict:
    """Fetch user profile information from Google OAuth2 userinfo endpoint."""
    url = "https://www.googleapis.com/oauth2/v3/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, headers=headers)
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch user profile from Google",
            )
        return response.json()
