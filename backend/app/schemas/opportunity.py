"""Opportunity and career intelligence schemas."""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class OpportunityCreate(BaseModel):
    """Schema for creating an opportunity."""

    title: str = Field(..., min_length=1, max_length=500)
    company: str | None = None
    role: str | None = None
    opportunity_type: str = Field(..., max_length=50)
    eligibility: str | None = None
    skills_required: list[str] = Field(default_factory=list)
    location: str | None = None
    work_mode: str | None = None
    stipend: str | None = None
    application_url: str | None = None
    deadline: datetime | None = None
    status: str = Field(default="new", pattern="^(new|saved|applied|assessment|interview|rejected|offer)$")
    notes: str | None = None
    confidence: float | None = None
    email_id: uuid.UUID | None = None


class OpportunityResponse(BaseModel):
    """Public opportunity response schema."""

    id: uuid.UUID
    title: str
    company: str | None = None
    role: str | None = None
    opportunity_type: str
    eligibility: str | None = None
    skills_required: list[str] = Field(default_factory=list)
    location: str | None = None
    work_mode: str | None = None
    stipend: str | None = None
    application_url: str | None = None
    deadline: datetime | None = None
    status: str
    notes: str | None = None
    confidence: float | None = None
    email_id: uuid.UUID | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OpportunityStatusUpdate(BaseModel):
    """Schema for updating opportunity pipeline status."""

    status: str = Field(..., pattern="^(new|saved|applied|assessment|interview|rejected|offer)$")


class OpportunityNotesUpdate(BaseModel):
    """Schema for updating opportunity notes."""

    notes: str


class OpportunityFilter(BaseModel):
    """Query filter parameters for opportunities."""

    opportunity_type: str | None = None
    status: str | None = None
    upcoming_days: int | None = None
