"""Email schemas for list, detail, and update operations."""

import uuid
from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.opportunity import OpportunityResponse
from app.schemas.task import TaskResponse


class EmailListItem(BaseModel):
    """Email item representation for list and inbox views."""

    id: uuid.UUID
    gmail_message_id: str
    subject: str | None = None
    sender_email: str | None = None
    sender_name: str | None = None
    snippet: str | None = None
    received_at: datetime | None = None
    is_read: bool = False
    is_important: bool = False
    is_spam: bool = False
    category: str | None = None
    priority: str = "medium"
    phishing_risk: str = "none"
    classification_confidence: float | None = None

    model_config = ConfigDict(from_attributes=True)


class EmailDetail(EmailListItem):
    """Detailed email response including body, tasks, and opportunities."""

    body_text: str | None = None
    body_html: str | None = None
    recipients: list[str] = Field(default_factory=list)
    ai_summary: str | None = None
    ai_summary_structured: dict[str, Any] = Field(default_factory=dict)
    phishing_reasons: list[str] = Field(default_factory=list)
    tasks: list[TaskResponse] = Field(default_factory=list)
    opportunities: list[OpportunityResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class EmailFilter(BaseModel):
    """Filter parameters for querying user emails."""

    category: str | None = None
    priority: str | None = None
    is_read: bool | None = None
    is_important: bool | None = None
    is_spam: bool | None = None
    search: str | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class CategoryUpdateRequest(BaseModel):
    """Schema for updating email category and submitting feedback."""

    category: str = Field(..., min_length=1, max_length=100)


class PriorityUpdateRequest(BaseModel):
    """Schema for overriding email priority."""

    priority: str = Field(..., pattern="^(critical|high|medium|low)$")


class PaginatedEmailResponse(BaseModel):
    """Paginated list response for emails."""

    items: list[EmailListItem]
    total: int
    page: int
    page_size: int
    has_next: bool
