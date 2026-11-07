"""Security utilities: JWT handling, token encryption, and authentication dependency."""

import base64
import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from cryptography.fernet import Fernet
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.database.connection import get_db

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/google/callback",
    auto_error=False,
)


def _get_fernet() -> Fernet:
    """Return Fernet cipher using configured key or derived from APP_SECRET_KEY."""
    settings = get_settings()
    key = settings.ENCRYPTION_KEY.strip() if settings.ENCRYPTION_KEY else ""
    if key:
        try:
            return Fernet(key.encode("utf-8"))
        except Exception:
            pass
    derived = base64.urlsafe_b64encode(hashlib.sha256(settings.APP_SECRET_KEY.encode("utf-8")).digest())
    return Fernet(derived)


def encrypt_token(token: str) -> str:
    """Encrypt a plaintext string (e.g., OAuth access or refresh token) using Fernet."""
    if not token:
        return ""
    fernet = _get_fernet()
    return fernet.encrypt(token.encode("utf-8")).decode("utf-8")


def decrypt_token(encrypted: str) -> str:
    """Decrypt an encrypted token string. Returns empty string on failure."""
    if not encrypted:
        return ""
    try:
        fernet = _get_fernet()
        return fernet.decrypt(encrypted.encode("utf-8")).decode("utf-8")
    except Exception:
        return ""


def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token."""
    settings = get_settings()
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def verify_access_token(token: str) -> Optional[dict[str, Any]]:
    """Verify and decode a JWT access token. Returns payload or None."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        return None


async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """FastAPI dependency: Authenticate user from Bearer header or session cookie."""
    from app.models.user import User  # Deferred import to prevent circular dependency

    auth_token = token
    if not auth_token:
        # Check Authorization header directly
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            auth_token = auth_header.split(" ", 1)[1]
        elif "access_token" in request.cookies:
            auth_token = request.cookies.get("access_token")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not auth_token:
        raise credentials_exception

    payload = verify_access_token(auth_token)
    if payload is None:
        raise credentials_exception

    user_id_str: Optional[str] = payload.get("sub")
    if not user_id_str:
        raise credentials_exception

    try:
        user_uuid = uuid.UUID(user_id_str)
    except (ValueError, TypeError):
        raise credentials_exception

    stmt = select(User).where(User.id == user_uuid)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    return user
