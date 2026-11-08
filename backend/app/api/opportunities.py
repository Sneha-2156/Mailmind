"""Career and Academic Opportunities API endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database.connection import get_db
from app.models.opportunity import Opportunity
from app.models.user import User
from app.schemas.opportunity import OpportunityCreate, OpportunityNotesUpdate, OpportunityResponse, OpportunityStatusUpdate

router = APIRouter()


@router.get("", response_model=list[OpportunityResponse])
async def list_opportunities(
    opportunity_type: Optional[str] = Query(None),
    pipeline_status: Optional[str] = Query(None, alias="status"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List career & student opportunities with filtering."""
    stmt = select(Opportunity).where(Opportunity.user_id == user.id)
    if opportunity_type:
        stmt = stmt.where(Opportunity.opportunity_type == opportunity_type)
    if pipeline_status:
        stmt = stmt.where(Opportunity.status == pipeline_status)

    stmt = stmt.order_by(desc(Opportunity.created_at))
    opportunities = (await db.execute(stmt)).scalars().all()
    return opportunities


@router.post("", response_model=OpportunityResponse, status_code=status.HTTP_201_CREATED)
async def create_opportunity(
    payload: OpportunityCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new tracked career or student opportunity."""
    opp = Opportunity(
        user_id=user.id,
        title=payload.title,
        company=payload.company,
        role=payload.role,
        opportunity_type=payload.opportunity_type,
        eligibility=payload.eligibility,
        skills_required=payload.skills_required,
        location=payload.location,
        work_mode=payload.work_mode,
        stipend=payload.stipend,
        application_url=payload.application_url,
        deadline=payload.deadline,
        status=payload.status or "new",
        notes=payload.notes,
        confidence=payload.confidence or 1.0,
        email_id=payload.email_id,
    )
    db.add(opp)
    await db.commit()
    await db.refresh(opp)
    return opp


@router.get("/{opp_id}", response_model=OpportunityResponse)
async def get_opportunity(
    opp_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a single opportunity owned by the current user."""
    stmt = select(Opportunity).where(Opportunity.id == opp_id, Opportunity.user_id == user.id)
    opp = (await db.execute(stmt)).scalar_one_or_none()
    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found.")
    return opp


@router.patch("/{opp_id}/status", response_model=OpportunityResponse)
async def update_opportunity_status(
    opp_id: uuid.UUID,
    payload: OpportunityStatusUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update opportunity pipeline tracking status."""
    stmt = select(Opportunity).where(Opportunity.id == opp_id, Opportunity.user_id == user.id)
    opp = (await db.execute(stmt)).scalar_one_or_none()

    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found.")

    opp.status = payload.status
    await db.commit()
    await db.refresh(opp)
    return opp


@router.patch("/{opp_id}/notes", response_model=OpportunityResponse)
async def update_opportunity_notes(
    opp_id: uuid.UUID,
    payload: OpportunityNotesUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update opportunity notes."""
    stmt = select(Opportunity).where(Opportunity.id == opp_id, Opportunity.user_id == user.id)
    opp = (await db.execute(stmt)).scalar_one_or_none()

    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found.")

    opp.notes = payload.notes
    await db.commit()
    await db.refresh(opp)
    return opp


@router.delete("/{opp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_opportunity(
    opp_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an opportunity."""
    stmt = select(Opportunity).where(Opportunity.id == opp_id, Opportunity.user_id == user.id)
    opp = (await db.execute(stmt)).scalar_one_or_none()

    if not opp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found.")

    await db.delete(opp)
    await db.commit()
