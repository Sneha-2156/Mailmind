"""OAuthCredential database model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, JSON, String, Text, Uuid
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class OAuthCredential(Base, TimestampMixin):
    """User OAuth token credentials stored with Fernet encryption."""

    __tablename__ = "oauth_credentials"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False, default="google")
    encrypted_access_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    encrypted_refresh_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    access_token = synonym("encrypted_access_token")
    refresh_token = synonym("encrypted_refresh_token")
    token_expiry: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    scopes: Mapped[list[str]] = mapped_column(
        ARRAY(String).with_variant(JSON, "sqlite"),
        default=list,
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="oauth_credentials")
