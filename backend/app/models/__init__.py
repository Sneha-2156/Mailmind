"""Database models registry."""

from app.models.email import Email
from app.models.feedback import ClassificationFeedback
from app.models.oauth_credential import OAuthCredential
from app.models.opportunity import Opportunity
from app.models.sync_history import SyncHistory
from app.models.task import Task
from app.models.user import User

__all__ = [
    "User",
    "OAuthCredential",
    "Email",
    "Task",
    "Opportunity",
    "ClassificationFeedback",
    "SyncHistory",
]
