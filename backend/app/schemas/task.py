"""Task and deadline schemas."""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    """Schema for creating a task."""

    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    due_date: datetime | None = None
    event_date: datetime | None = None
    organization: str | None = None
    priority: str = Field(default="medium", pattern="^(critical|high|medium|low)$")
    email_id: uuid.UUID | None = None


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""

    title: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = None
    due_date: datetime | None = None
    event_date: datetime | None = None
    organization: str | None = None
    priority: str | None = Field(default=None, pattern="^(critical|high|medium|low)$")
    is_completed: bool | None = None
    is_date_uncertain: bool | None = None


class TaskResponse(BaseModel):
    """Schema for task responses."""

    id: uuid.UUID
    user_id: uuid.UUID
    email_id: uuid.UUID | None = None
    title: str
    description: str | None = None
    due_date: datetime | None = None
    event_date: datetime | None = None
    organization: str | None = None
    priority: str
    confidence: float | None = None
    is_completed: bool = False
    is_date_uncertain: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskFilter(BaseModel):
    """Query filter parameters for task list."""

    is_completed: bool | None = None
    priority: str | None = None
    upcoming_days: int | None = None
