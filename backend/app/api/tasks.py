"""Tasks and Deadlines API endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.database.connection import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter()


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    is_completed: Optional[bool] = Query(None),
    priority: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all extracted and manual tasks for current authenticated user."""
    stmt = select(Task).where(Task.user_id == user.id)
    if is_completed is not None:
        stmt = stmt.where(Task.is_completed == is_completed)
    if priority:
        stmt = stmt.where(Task.priority == priority)

    stmt = stmt.order_by(Task.is_completed.asc(), Task.due_date.asc().nullslast())
    tasks = (await db.execute(stmt)).scalars().all()
    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new manual task."""
    task = Task(
        user_id=user.id,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        priority=payload.priority or "medium",
        confidence=1.0,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update task completion status or properties."""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == user.id)
    task = (await db.execute(stmt)).scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    await db.commit()
    await db.refresh(task)
    return task


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_complete(
    task_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle task is_completed boolean."""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == user.id)
    task = (await db.execute(stmt)).scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    task.is_completed = not task.is_completed
    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a task."""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == user.id)
    task = (await db.execute(stmt)).scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

    await db.delete(task)
    await db.commit()
