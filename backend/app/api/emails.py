"""Email management and intelligence API endpoints."""

import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database.connection import get_db
from app.models.email import Email
from app.models.feedback import ClassificationFeedback
from app.models.opportunity import Opportunity
from app.models.task import Task
from app.models.user import User
from app.schemas.email import EmailDetail, EmailListItem, PaginatedEmailResponse
from app.services.gmail_service import GmailService
from app.services.reply_service import ReplyService
from app.services.summarizer_service import SummarizerService

router = APIRouter()


class FeedbackRequest(BaseModel):
    suggested_category: str
    feedback_notes: Optional[str] = None


class ReadStatusRequest(BaseModel):
    is_read: bool = True


class ImportantStatusRequest(BaseModel):
    is_important: bool = True


class CategoryUpdateRequest(BaseModel):
    category: str


class PriorityUpdateRequest(BaseModel):
    priority: str


class ReplySuggestionRequest(BaseModel):
    style: Optional[str] = "professional"


@router.get("", response_model=PaginatedEmailResponse)
async def list_emails(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    is_read: Optional[bool] = Query(None),
    is_important: Optional[bool] = Query(None),
    is_spam: bool = Query(False),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    sort: str = Query("newest"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List paginated emails for the current authenticated user with multi-field search and filters."""
    query = select(Email).where(Email.user_id == user.id, Email.is_spam == is_spam)

    if category:
        query = query.where(Email.category == category)
    if priority:
        query = query.where(Email.priority == priority)
    if is_read is not None:
        query = query.where(Email.is_read == is_read)
    if is_important is not None:
        query = query.where(Email.is_important == is_important)
    if date_from is not None:
        query = query.where(Email.received_at >= date_from)
    if date_to is not None:
        query = query.where(Email.received_at <= date_to)

    if search:
        s_pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                Email.subject.ilike(s_pattern),
                Email.sender_email.ilike(s_pattern),
                Email.sender_name.ilike(s_pattern),
                Email.body_text.ilike(s_pattern),
            )
        )

    # Count total matching
    count_stmt = select(func.count()).select_from(query.subquery())
    total_count = (await db.execute(count_stmt)).scalar() or 0

    # Paginate and order by received_at descending
    offset = (page - 1) * page_size
    order_clause = Email.received_at.asc() if sort == "oldest" else desc(Email.received_at)
    query = query.order_by(order_clause).offset(offset).limit(page_size)
    items = (await db.execute(query)).scalars().all()

    has_next = (page * page_size) < total_count

    return PaginatedEmailResponse(
        items=items,
        total=total_count,
        page=page,
        page_size=page_size,
        has_next=has_next,
    )


@router.post("/sync")
async def sync_emails(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger email synchronization with Gmail API or demo seed data."""
    gmail_service = GmailService(db, user)
    result = await gmail_service.sync_emails()
    return result


@router.get("/{email_id}", response_model=EmailDetail)
async def get_email_detail(
    email_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full email detail, ensuring user ownership."""
    stmt = select(Email).where(Email.id == email_id, Email.user_id == user.id)
    email_obj = (await db.execute(stmt)).scalar_one_or_none()

    if not email_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found.")

    # Fetch associated tasks
    tasks_stmt = select(Task).where(Task.email_id == email_id, Task.user_id == user.id)
    tasks = (await db.execute(tasks_stmt)).scalars().all()

    # Fetch associated opportunities
    opp_stmt = select(Opportunity).where(Opportunity.email_id == email_id, Opportunity.user_id == user.id)
    opportunities = (await db.execute(opp_stmt)).scalars().all()

    detail = EmailDetail.model_validate(email_obj)
    return detail.model_copy(update={"tasks": tasks, "opportunities": opportunities})


@router.patch("/{email_id}/read", response_model=EmailListItem)
async def mark_email_read(
    email_id: uuid.UUID,
    payload: ReadStatusRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark an email as read or unread."""
    stmt = select(Email).where(Email.id == email_id, Email.user_id == user.id)
    email_obj = (await db.execute(stmt)).scalar_one_or_none()

    if not email_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found.")

    service = GmailService(db, user)
    await service.mark_read(email_obj, payload.is_read)
    return email_obj


@router.patch("/{email_id}/important", response_model=EmailListItem)
async def mark_email_important(
    email_id: uuid.UUID,
    payload: ImportantStatusRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark an email as important or not."""
    stmt = select(Email).where(Email.id == email_id, Email.user_id == user.id)
    email_obj = (await db.execute(stmt)).scalar_one_or_none()

    if not email_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found.")

    email_obj.is_important = payload.is_important
    await db.commit()
    await db.refresh(email_obj)
    return email_obj


@router.patch("/{email_id}/category", response_model=EmailListItem)
async def update_email_category(
    email_id: uuid.UUID,
    payload: CategoryUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually update an email's category."""
    stmt = select(Email).where(Email.id == email_id, Email.user_id == user.id)
    email_obj = (await db.execute(stmt)).scalar_one_or_none()

    if not email_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found.")

    email_obj.category = payload.category
    await db.commit()
    await db.refresh(email_obj)
    return email_obj


@router.patch("/{email_id}/priority", response_model=EmailListItem)
async def update_email_priority(
    email_id: uuid.UUID,
    payload: PriorityUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually update an email's priority."""
    stmt = select(Email).where(Email.id == email_id, Email.user_id == user.id)
    email_obj = (await db.execute(stmt)).scalar_one_or_none()

    if not email_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found.")

    email_obj.priority = payload.priority
    await db.commit()
    await db.refresh(email_obj)
    return email_obj


@router.post("/{email_id}/spam")
async def mark_email_spam(
    email_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark an email as spam."""
    stmt = select(Email).where(Email.id == email_id, Email.user_id == user.id)
    email_obj = (await db.execute(stmt)).scalar_one_or_none()

    if not email_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found.")

    service = GmailService(db, user)
    await service.mark_spam(email_obj)
    return {"status": "success", "message": "Email moved to Spam."}


@router.post("/{email_id}/trash")
async def trash_email(
    email_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Move an email to Trash."""
    stmt = select(Email).where(Email.id == email_id, Email.user_id == user.id)
    email_obj = (await db.execute(stmt)).scalar_one_or_none()

    if not email_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found.")

    service = GmailService(db, user)
    await service.trash_email(email_obj)
    return {"status": "success", "message": "Email deleted."}


@router.post("/{email_id}/summarize")
async def summarize_email(
    email_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate or retrieve AI summary for an email."""
    stmt = select(Email).where(Email.id == email_id, Email.user_id == user.id)
    email_obj = (await db.execute(stmt)).scalar_one_or_none()

    if not email_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found.")

    summary_result = await SummarizerService.summarize(
        subject=email_obj.subject or "",
        body_text=email_obj.body_text or "",
        category=email_obj.category,
    )

    email_obj.ai_summary = summary_result.get("summary")
    await db.commit()

    return summary_result


@router.post("/{email_id}/reply")
@router.post("/{email_id}/reply-suggestions")
async def generate_smart_replies(
    email_id: uuid.UUID,
    payload: Optional[ReplySuggestionRequest] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate multi-tone suggested reply drafts."""
    stmt = select(Email).where(Email.id == email_id, Email.user_id == user.id)
    email_obj = (await db.execute(stmt)).scalar_one_or_none()

    if not email_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found.")

    replies = ReplyService.generate_replies(
        subject=email_obj.subject or "",
        body_text=email_obj.body_text or "",
        sender_name=email_obj.sender_name,
        category=email_obj.category,
    )
    style = payload.style if payload and payload.style else "professional"
    draft = replies.get(style, replies.get("professional", ""))
    return {"replies": replies, "draft": draft, "style": style}


@router.post("/{email_id}/feedback")
async def submit_category_feedback(
    email_id: uuid.UUID,
    feedback: FeedbackRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit user correction on email classification for active learning."""
    stmt = select(Email).where(Email.id == email_id, Email.user_id == user.id)
    email_obj = (await db.execute(stmt)).scalar_one_or_none()

    if not email_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found.")

    fb = ClassificationFeedback(
        user_id=user.id,
        email_id=email_obj.id,
        original_category=email_obj.category or "Miscellaneous",
        corrected_category=feedback.suggested_category,
    )
    db.add(fb)

    # Update email category immediately
    email_obj.category = feedback.suggested_category
    await db.commit()

    return {"status": "success", "updated_category": feedback.suggested_category}
