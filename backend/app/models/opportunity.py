"""Career and student opportunity database model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Text, Uuid
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.email import Email
    from app.models.user import User


class Opportunity(Base, TimestampMixin):
    """Extracted student and career opportunity model."""

    __tablename__ = "opportunities"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    email_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("emails.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    role: Mapped[str | None] = mapped_column(String(255), nullable=True)
    opportunity_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    eligibility: Mapped[str | None] = mapped_column(Text, nullable=True)
    skills_required: Mapped[list[str]] = mapped_column(
        ARRAY(String).with_variant(JSON, "sqlite"),
        default=list,
        nullable=False,
    )
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    work_mode: Mapped[str | None] = mapped_column(String(50), nullable=True)
    stipend: Mapped[str | None] = mapped_column(String(255), nullable=True)
    application_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(30), default="new", nullable=False, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="opportunities")
    email: Mapped["Email | None"] = relationship("Email", back_populates="opportunities")
