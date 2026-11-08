"""API v1 Router package."""

from fastapi import APIRouter
from app.api import analytics, auth, emails, gmail, opportunities, settings, tasks

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(emails.router, prefix="/emails", tags=["Emails"])
api_router.include_router(gmail.router, prefix="/gmail", tags=["Gmail"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(opportunities.router, prefix="/opportunities", tags=["Opportunities"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
