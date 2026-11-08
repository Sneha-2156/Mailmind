"""Analytics and reporting data schemas."""

from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    """High-level summary metrics across the user's inbox, tasks, and opportunities."""

    total_emails: int
    unread_emails: int
    important_emails: int
    suspicious_emails: int
    total_tasks: int
    pending_tasks: int
    total_opportunities: int
    new_opportunities: int
    upcoming_deadlines_7d: int


class CategoryDistribution(BaseModel):
    """Category count and relative percentage."""

    category: str
    count: int
    percentage: float


class PriorityDistribution(BaseModel):
    """Priority level breakdown."""

    priority: str
    count: int


class WeeklyActivity(BaseModel):
    """Daily email count for recent activity timeline."""

    date: str
    count: int
