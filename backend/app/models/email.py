"""Email database model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    JSON,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.opportunity import Opportunity
    from app.models.task import Task
    from app.models.user import User


class Email(Base, TimestampMixin):
    """Synchronized and classified email message model."""

    __tablename__ = "emails"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    gmail_message_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    gmail_thread_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subject: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    sender_email: Mapped[str | None] = mapped_column(String(320), nullable=True, index=True)
    sender_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    recipients: Mapped[list[str]] = mapped_column(
        ARRAY(String).with_variant(JSON, "sqlite"),
        default=list,
        nullable=False,
    )
    snippet: Mapped[str | None] = mapped_column(Text, nullable=True)
    body_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    body_html: Mapped[str | None] = mapped_column(Text, nullable=True)
    received_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_important: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    is_spam: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False, index=True)
    classification_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    phishing_risk: Mapped[str] = mapped_column(String(20), default="none", nullable=False)
    phishing_reasons: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_summary_structured: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="emails")
    tasks: Mapped[list["Task"]] = relationship(
        "Task",
        back_populates="email",
        cascade="all, delete-orphan",
    )
    opportunities: Mapped[list["Opportunity"]] = relationship(
        "Opportunity",
        back_populates="email",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint("user_id", "gmail_message_id", name="uq_user_gmail_message_id"),
    )
