"""User database model."""

import uuid
from typing import TYPE_CHECKING
from sqlalchemy import JSON, Boolean, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.email import Email
    from app.models.feedback import ClassificationFeedback
    from app.models.oauth_credential import OAuthCredential
    from app.models.opportunity import Opportunity
    from app.models.sync_history import SyncHistory
    from app.models.task import Task


class User(Base, TimestampMixin):
    """User account model."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    picture_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    gmail_connected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    preferences: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    # Relationships
    oauth_credentials: Mapped[list["OAuthCredential"]] = relationship(
        "OAuthCredential",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    emails: Mapped[list["Email"]] = relationship(
        "Email",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    tasks: Mapped[list["Task"]] = relationship(
        "Task",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    opportunities: Mapped[list["Opportunity"]] = relationship(
        "Opportunity",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    classification_feedback: Mapped[list["ClassificationFeedback"]] = relationship(
        "ClassificationFeedback",
        cascade="all, delete-orphan",
    )
    sync_history: Mapped[list["SyncHistory"]] = relationship(
        "SyncHistory",
        cascade="all, delete-orphan",
    )
