"""Gmail sync and connection status API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.oauth import generate_oauth_state, get_authorization_url, revoke_token
from app.core.security import decrypt_token, get_current_user
from app.database.connection import get_db
from app.models.oauth_credential import OAuthCredential
from app.models.user import User
from app.services.gmail_service import GmailNotConnectedError, GmailService, GmailSyncError

router = APIRouter()


@router.get("/connect")
async def connect_gmail():
    """Start Google OAuth so the user can connect Gmail."""
    state = generate_oauth_state()
    url = get_authorization_url(state)
    return {"auth_url": url, "authorization_url": url, "state": state}


@router.post("/sync")
async def sync_gmail(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Synchronize user emails via Gmail API or demo seed data."""
    service = GmailService(db, user)
    try:
        return await service.sync_emails()
    except GmailNotConnectedError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    except GmailSyncError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))


@router.get("/sync/status")
async def sync_status(user: User = Depends(get_current_user)):
    """Retrieve sync status and connection state."""
    return {
        "is_syncing": False,
        "last_synced_at": user.updated_at.isoformat() if hasattr(user, "updated_at") and user.updated_at else None,
        "gmail_connected": user.gmail_connected,
        "total_synced": None,
    }


@router.post("/disconnect")
async def disconnect_gmail(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revoke Google tokens and mark Gmail as disconnected."""
    stmt = select(OAuthCredential).where(
        OAuthCredential.user_id == user.id, OAuthCredential.provider == "google"
    )
    cred = (await db.execute(stmt)).scalar_one_or_none()
    if cred:
        refresh = decrypt_token(cred.refresh_token or "")
        access = decrypt_token(cred.access_token or "")
        await revoke_token(refresh or access)
        await db.delete(cred)
    user.gmail_connected = False
    await db.commit()
    return {"status": "success", "message": "Gmail disconnected."}
