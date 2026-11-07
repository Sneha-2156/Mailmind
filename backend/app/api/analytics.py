"""Analytics and visualization data API endpoints."""

from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database.connection import get_db
from app.models.email import Email
from app.models.opportunity import Opportunity
from app.models.task import Task
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsSummary,
    CategoryDistribution,
    PriorityDistribution,
    WeeklyActivity,
)

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve high-level summary KPI metrics for user dashboard."""
    # Email metrics
    total_emails = (
        await db.execute(select(func.count(Email.id)).where(Email.user_id == user.id, Email.is_spam == False))
    ).scalar() or 0

    unread_emails = (
        await db.execute(
            select(func.count(Email.id)).where(
                Email.user_id == user.id, Email.is_read == False, Email.is_spam == False
            )
        )
    ).scalar() or 0

    important_emails = (
        await db.execute(
            select(func.count(Email.id)).where(
                Email.user_id == user.id, Email.is_important == True, Email.is_spam == False
            )
        )
    ).scalar() or 0

    suspicious_emails = (
        await db.execute(
            select(func.count(Email.id)).where(
                Email.user_id == user.id, Email.phishing_risk.in_(["medium", "high"])
            )
        )
    ).scalar() or 0

    # Task metrics
    total_tasks = (
        await db.execute(select(func.count(Task.id)).where(Task.user_id == user.id))
    ).scalar() or 0

    pending_tasks = (
        await db.execute(
            select(func.count(Task.id)).where(Task.user_id == user.id, Task.is_completed == False)
        )
    ).scalar() or 0

    # Opportunity metrics
    total_opps = (
        await db.execute(select(func.count(Opportunity.id)).where(Opportunity.user_id == user.id))
    ).scalar() or 0

    new_opps = (
        await db.execute(
            select(func.count(Opportunity.id)).where(Opportunity.user_id == user.id, Opportunity.status == "new")
        )
    ).scalar() or 0

    # Upcoming deadlines within 7 days
    now = datetime.now(timezone.utc)
    in_7d = now + timedelta(days=7)
    upcoming_tasks = (
        await db.execute(
            select(func.count(Task.id)).where(
                Task.user_id == user.id,
                Task.is_completed == False,
                Task.due_date >= now,
                Task.due_date <= in_7d,
            )
        )
    ).scalar() or 0

    return AnalyticsSummary(
        total_emails=total_emails,
        unread_emails=unread_emails,
        important_emails=important_emails,
        suspicious_emails=suspicious_emails,
        total_tasks=total_tasks,
        pending_tasks=pending_tasks,
        total_opportunities=total_opps,
        new_opportunities=new_opps,
        upcoming_deadlines_7d=upcoming_tasks,
    )


@router.get("/categories", response_model=list[CategoryDistribution])
async def get_category_distribution(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve category breakdown counts and percentages."""
    stmt = (
        select(Email.category, func.count(Email.id))
        .where(Email.user_id == user.id, Email.is_spam == False)
        .group_by(Email.category)
    )
    rows = (await db.execute(stmt)).all()
    total = sum(r[1] for r in rows) or 1

    return [
        CategoryDistribution(
            category=r[0] or "Miscellaneous",
            count=r[1],
            percentage=round((r[1] / total) * 100, 1),
        )
        for r in rows
    ]


@router.get("/priorities", response_model=list[PriorityDistribution])
async def get_priority_distribution(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve priority level counts."""
    stmt = (
        select(Email.priority, func.count(Email.id))
        .where(Email.user_id == user.id, Email.is_spam == False)
        .group_by(Email.priority)
    )
    rows = (await db.execute(stmt)).all()

    return [
        PriorityDistribution(
            priority=r[0] or "medium",
            count=r[1],
        )
        for r in rows
    ]


@router.get("/weekly", response_model=list[dict])
@router.get("/weekly-activity", response_model=list[dict])
async def get_weekly_activity(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve daily email volume for the last 7 days."""
    now = datetime.now(timezone.utc)
    activity = []

    for i in range(6, -1, -1):
        day_date = now - timedelta(days=i)
        start_of_day = day_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = day_date.replace(hour=23, minute=59, second=59, microsecond=999999)

        count = (
            await db.execute(
                select(func.count(Email.id)).where(
                    Email.user_id == user.id,
                    Email.received_at >= start_of_day,
                    Email.received_at <= end_of_day,
                )
            )
        ).scalar() or 0

        activity.append({
            "day": day_date.strftime("%a"),
            "date": day_date.strftime("%b %d"),
            "count": count,
        })

    return activity


@router.get("/opportunities", response_model=list[dict])
async def get_opportunities_overview(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve opportunities grouped by pipeline status."""
    stmt = (
        select(Opportunity.status, func.count(Opportunity.id))
        .where(Opportunity.user_id == user.id)
        .group_by(Opportunity.status)
    )
    rows = (await db.execute(stmt)).all()
    return [{"status": r[0], "count": r[1]} for r in rows]
