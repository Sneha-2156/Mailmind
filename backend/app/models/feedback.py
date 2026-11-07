"""Classification feedback database model for active learning."""

import uuid
from sqlalchemy import ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin


class ClassificationFeedback(Base, TimestampMixin):
    """User feedback on email classification corrections."""

    __tablename__ = "classification_feedback"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    email_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("emails.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    original_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    corrected_category: Mapped[str] = mapped_column(String(100), nullable=False)
