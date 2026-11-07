"""Gmail API service with real Google client integration and realistic mock sync fallback."""

import base64
from datetime import datetime, timedelta, timezone
import email
from email import policy
import logging
from typing import Any, Optional
import uuid

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import decrypt_token
from app.models.email import Email
from app.models.oauth_credential import OAuthCredential
from app.models.opportunity import Opportunity
from app.models.sync_history import SyncHistory
from app.models.task import Task
from app.models.user import User
from app.services.classifier_service import ClassifierService
from app.services.extraction_service import ExtractionService
from app.services.phishing_service import analyze_phishing
from app.services.priority_service import score_priority
from app.utils.email_parser import extract_header, get_body_parts, parse_recipients, parse_sender

logger = logging.getLogger(__name__)

MOCK_SAMPLE_EMAILS = [
    {
        "subject": "Google Summer Internship 2026: Application Confirmation & Next Steps",
        "sender_email": "university-recruiting@google.com",
        "sender_name": "Google University Programs",
        "category": "Career and Opportunity",
        "body_text": (
            "Dear Candidate,\n\n"
            "Thank you for applying to the Google Software Engineering Summer 2026 Internship program. "
            "We have reviewed your application and would like to invite you to the online technical assessment. "
            "Please complete the coding assessment before March 25, 2026. "
            "You must review the guidelines and complete the sample test beforehand.\n\n"
            "Assessment link: https://careers.google.com/assessment/swe2026\n"
            "Stipend: $8,500 / month with housing stipend.\n\n"
            "Best regards,\nGoogle University Recruiting Team"
        ),
        "is_read": False,
        "is_important": True,
        "priority": "critical",
    },
    {
        "subject": "National Merit STEM Scholarship 2026 - Final Call for Applications",
        "sender_email": "scholarships@stemfoundation.org",
        "sender_name": "STEM Scholarship Foundation",
        "category": "Scholarship",
        "body_text": (
            "Dear Scholar,\n\n"
            "This is a reminder that the application portal for the 2026 National STEM Excellence Scholarship closes on April 10, 2026. "
            "Selected candidates will receive a $5,000 tuition grant and mentorship from industry leaders. "
            "Please upload your updated academic transcript, statement of purpose, and one recommendation letter before the deadline.\n\n"
            "Submit application: https://stemfoundation.org/apply-2026\n\n"
            "Sincerely,\nScholarship Selection Committee"
        ),
        "is_read": False,
        "is_important": True,
        "priority": "high",
    },
    {
        "subject": "End-Semester Examination Schedule - Spring 2026",
        "sender_email": "registrar@university.edu",
        "sender_name": "Office of the University Registrar",
        "category": "Academic",
        "body_text": (
            "Dear Students,\n\n"
            "The final examination timetable for the Spring 2026 semester is now officially published on the student portal. "
            "Examinations will commence on May 4, 2026 and conclude on May 18, 2026. "
            "Please check your registered courses and download your hall ticket by April 28, 2026. "
            "Any scheduling conflicts must be reported to the departmental exam coordinator by April 20.\n\n"
            "Regards,\nOffice of the Registrar"
        ),
        "is_read": True,
        "is_important": True,
        "priority": "high",
    },
    {
        "subject": "URGENT: Verify your PayPal account credentials immediately",
        "sender_email": "security-alert@paypal-update-center.xyz",
        "sender_name": "PayPal Security Team",
        "category": "Service Notification",
        "body_text": (
            "Dear customer,\n\n"
            "We detected unauthorized access to your account from an unknown IP address (192.168.1.100). "
            "Your account has been temporarily restricted. You must confirm your password and verify your account "
            "within 24 hours to prevent permanent account suspension. "
            "Click here immediately: http://192.168.1.100/login/verify-credentials.php\n\n"
            "PayPal Security Department"
        ),
        "is_read": False,
        "is_important": False,
        "priority": "critical",
    },
    {
        "subject": "Campus Hackathon 2026: Build with Generative AI & Win $10,000",
        "sender_email": "hackathon@campusinnovation.org",
        "sender_name": "Campus Innovation Club",
        "category": "Career and Opportunity",
        "body_text": (
            "Hey Hackers!\n\n"
            "Registration is now open for HackSpring 2026! 36 hours of non-stop hacking, workshops, and mentorship. "
            "Over $10,000 in cash prizes, API credits, and fast-track interviews with top sponsoring tech startups. "
            "Team registration deadline is April 5, 2026. Teams can have 2 to 4 members.\n\n"
            "Register team: https://hackspring2026.dev/register\n\n"
            "Happy coding!\nThe HackSpring Team"
        ),
        "is_read": True,
        "is_important": False,
        "priority": "medium",
    },
    {
        "subject": "Tuition Fee Invoice - Spring 2026 Second Installment",
        "sender_email": "bursar@university.edu",
        "sender_name": "Student Accounts & Bursar",
        "category": "Financial Services",
        "body_text": (
            "Dear Student,\n\n"
            "Your student statement for the second installment of tuition fees for Spring 2026 has been generated. "
            "Balance due: $2,450.00. The due date for payment without late fees is April 15, 2026. "
            "You can pay online via the student finance portal using ACH or credit card.\n\n"
            "Thank you,\nStudent Bursar Office"
        ),
        "is_read": False,
        "is_important": True,
        "priority": "high",
    },
    {
        "subject": "Workshop: Cloud Native & Kubernetes Fundamentals",
        "sender_email": "events@techacademy.io",
        "sender_name": "Tech Academy",
        "category": "Skill Development",
        "body_text": (
            "Hi there,\n\n"
            "Join our free 2-day hands-on workshop covering Docker containers, Kubernetes clusters, and Helm charts. "
            "Gain real-world cloud deployment experience and receive a digital certificate of completion upon finishing the labs.\n"
            "Date: Saturday, April 12, 2026 at 10:00 AM EST.\n\n"
            "Reserve your seat: https://techacademy.io/workshops/k8s\n\n"
            "See you there!"
        ),
        "is_read": True,
        "is_important": False,
        "priority": "low",
    },
    {
        "subject": "Campus Library Renovation: Partial Closure Notice",
        "sender_email": "library-services@university.edu",
        "sender_name": "University Libraries",
        "category": "Campus Service",
        "body_text": (
            "Notice to all library patrons:\n\n"
            "The 3rd floor quiet study area will be closed for HVAC upgrades from Monday, April 7 through Wednesday, April 9. "
            "All other floors, book borrowing, and study rooms remain operational.\n\n"
            "Library Management"
        ),
        "is_read": True,
        "is_important": False,
        "priority": "low",
    },
]


class GmailService:
    """Service handling Gmail API interactions and syncing."""

    def __init__(self, db: AsyncSession, user: User):
        self.db = db
        self.user = user
        self.classifier = ClassifierService()

    async def get_valid_access_token(self) -> Optional[str]:
        """Retrieve and decrypt stored Google OAuth access token."""
        stmt = (
            select(OAuthCredential)
            .where(OAuthCredential.user_id == self.user.id)
            .where(OAuthCredential.provider == "google")
        )
        res = await self.db.execute(stmt)
        cred = res.scalar_one_or_none()
        if not cred or not cred.access_token:
            return None
        return decrypt_token(cred.access_token)

    async def sync_emails(self, max_results: int = 50) -> dict[str, Any]:
        """Synchronize emails from Gmail API or populate demo data if credentials are not present."""
        token = await self.get_valid_access_token()

        if token:
            try:
                return await self._sync_real_gmail(token, max_results)
            except Exception as e:
                logger.warning("Real Gmail sync failed (%s), falling back to demo sync.", e)

        return await self._sync_mock_emails()

    async def _sync_mock_emails(self) -> dict[str, Any]:
        """Generate and upsert realistic mock emails and opportunities for testing/demo."""
        synced_count = 0
        new_count = 0
        now = datetime.now(timezone.utc)

        for i, sample in enumerate(MOCK_SAMPLE_EMAILS):
            msg_id = f"mock-msg-{self.user.id}-{i+1}"
            stmt = select(Email).where(Email.user_id == self.user.id, Email.gmail_message_id == msg_id)
            existing = (await self.db.execute(stmt)).scalar_one_or_none()

            # ML classification
            class_res = self.classifier.classify(sample["body_text"])
            category = sample.get("category") or class_res.category

            # Priority scoring
            p_res = score_priority({
                "subject": sample["subject"],
                "body_text": sample["body_text"],
                "sender_email": sample["sender_email"],
                "category": category,
            })

            # Phishing analysis
            phish_res = analyze_phishing({
                "subject": sample["subject"],
                "body_text": sample["body_text"],
                "sender_email": sample["sender_email"],
                "sender_name": sample["sender_name"],
            })

            received_time = now - timedelta(hours=i * 6, minutes=i * 15)

            if not existing:
                email_obj = Email(
                    id=uuid.uuid4(),
                    user_id=self.user.id,
                    gmail_message_id=msg_id,
                    gmail_thread_id=f"mock-thread-{i+1}",
                    subject=sample["subject"],
                    sender_email=sample["sender_email"],
                    sender_name=sample["sender_name"],
                    recipients=[self.user.email],
                    snippet=sample["body_text"][:150] + "...",
                    body_text=sample["body_text"],
                    body_html=f"<p>{sample['body_text'].replace(chr(10), '<br>')}</p>",
                    received_at=received_time,
                    is_read=sample["is_read"],
                    is_important=sample["is_important"],
                    is_spam=(phish_res.risk_level == "high"),
                    category=category,
                    priority=sample.get("priority", p_res.priority),
                    classification_confidence=class_res.confidence,
                    phishing_risk=phish_res.risk_level,
                    phishing_reasons=phish_res.reasons,
                )
                self.db.add(email_obj)
                await self.db.flush()

                # Extract tasks
                tasks_data = ExtractionService.extract_tasks(
                    sample["subject"], sample["body_text"], email_obj.priority
                )
                for t in tasks_data:
                    task = Task(
                        user_id=self.user.id,
                        email_id=email_obj.id,
                        title=t["title"],
                        description=t["description"],
                        due_date=t["due_date"],
                        priority=t["priority"],
                        confidence=t["confidence"],
                        is_completed=False,
                    )
                    self.db.add(task)

                # Extract opportunities
                opp_data = ExtractionService.extract_opportunity(
                    sample["subject"], sample["body_text"], category
                )
                if opp_data:
                    opp = Opportunity(
                        user_id=self.user.id,
                        email_id=email_obj.id,
                        title=opp_data["title"],
                        company=opp_data["company"],
                        role=opp_data["role"],
                        opportunity_type=opp_data["opportunity_type"],
                        eligibility=opp_data["eligibility"],
                        skills_required=opp_data["skills_required"],
                        stipend=opp_data.get("stipend"),
                        application_url=opp_data.get("application_url"),
                        deadline=opp_data.get("deadline"),
                        status="new",
                        confidence=opp_data["confidence"],
                    )
                    self.db.add(opp)

                new_count += 1

            synced_count += 1

        history = SyncHistory(
            user_id=self.user.id,
            emails_fetched=synced_count,
            emails_classified=synced_count,
            status="success",
            sync_type="demo",
            completed_at=datetime.now(timezone.utc),
        )
        self.db.add(history)
        await self.db.commit()

        return {
            "status": "success",
            "mode": "demo_sync",
            "synced_count": synced_count,
            "new_count": new_count,
        }

    async def _sync_real_gmail(self, token: str, max_results: int) -> dict[str, Any]:
        """Fetch emails via Gmail REST API."""
        headers = {"Authorization": f"Bearer {token}"}
        url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults={max_results}"

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code != 200:
                raise Exception(f"Gmail API returned {resp.status_code}: {resp.text}")

            msg_list = resp.json().get("messages", [])
            synced_count = 0
            new_count = 0

            for m in msg_list:
                msg_id = m["id"]
                stmt = select(Email).where(Email.user_id == self.user.id, Email.gmail_message_id == msg_id)
                existing = (await self.db.execute(stmt)).scalar_one_or_none()

                if existing:
                    synced_count += 1
                    continue

                # Fetch full message
                detail_resp = await client.get(
                    f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}?format=full",
                    headers=headers,
                )
                if detail_resp.status_code != 200:
                    continue

                msg_data = detail_resp.json()
                payload = msg_data.get("payload", {}) or {}
                raw_headers = payload.get("headers", []) or []
                subject = extract_header(raw_headers, "subject") or "No Subject"
                from_header = extract_header(raw_headers, "from") or ""
                sender_name, sender_email = parse_sender(from_header)
                recipients = parse_recipients(extract_header(raw_headers, "to"))
                snippet = msg_data.get("snippet", "")
                label_ids = msg_data.get("labelIds", [])
                bodies = get_body_parts(payload)
                body_text = bodies.get("plain") or snippet
                body_html = bodies.get("html") or ""
                internal = msg_data.get("internalDate")
                received_at = (
                    datetime.fromtimestamp(int(internal) / 1000, tz=timezone.utc)
                    if internal
                    else datetime.now(timezone.utc)
                )
                # Classification and scoring
                class_res = self.classifier.classify(f"{subject}\n{body_text}")
                p_res = score_priority({
                    "subject": subject,
                    "body_text": body_text,
                    "sender_email": sender_email or from_header,
                    "category": class_res.category,
                })
                phish_res = analyze_phishing({
                    "subject": subject,
                    "body_text": body_text,
                    "sender_email": sender_email or from_header,
                    "sender_name": sender_name,
                })

                email_obj = Email(
                    id=uuid.uuid4(),
                    user_id=self.user.id,
                    gmail_message_id=msg_id,
                    gmail_thread_id=msg_data.get("threadId"),
                    subject=subject,
                    sender_email=sender_email or from_header,
                    sender_name=sender_name or sender_email or from_header,
                    recipients=recipients,
                    snippet=snippet,
                    body_text=body_text,
                    body_html=body_html or f"<p>{snippet}</p>",
                    received_at=received_at,
                    is_read="UNREAD" not in label_ids,
                    is_important="IMPORTANT" in label_ids or "STARRED" in label_ids,
                    is_spam="SPAM" in label_ids or phish_res.risk_level == "high",
                    category=class_res.category,
                    priority=p_res.priority,
                    classification_confidence=class_res.confidence,
                    phishing_risk=phish_res.risk_level,
                    phishing_reasons=phish_res.reasons,
                )
                self.db.add(email_obj)
                await self.db.flush()

                # Extract tasks and opportunities
                tasks_data = ExtractionService.extract_tasks(subject, body_text, email_obj.priority)
                for t in tasks_data:
                    self.db.add(Task(
                        user_id=self.user.id,
                        email_id=email_obj.id,
                        title=t["title"],
                        description=t["description"],
                        due_date=t["due_date"],
                        priority=t["priority"],
                        confidence=t["confidence"],
                    ))

                opp_data = ExtractionService.extract_opportunity(subject, body_text, class_res.category)
                if opp_data:
                    self.db.add(Opportunity(
                        user_id=self.user.id,
                        email_id=email_obj.id,
                        title=opp_data["title"],
                        company=opp_data["company"],
                        role=opp_data["role"],
                        opportunity_type=opp_data["opportunity_type"],
                        eligibility=opp_data["eligibility"],
                        skills_required=opp_data["skills_required"],
                        stipend=opp_data.get("stipend"),
                        application_url=opp_data.get("application_url"),
                        deadline=opp_data.get("deadline"),
                        status="new",
                        confidence=opp_data["confidence"],
                    ))

                new_count += 1
                synced_count += 1

            await self.db.commit()
            return {
                "status": "success",
                "mode": "live_gmail",
                "synced_count": synced_count,
                "new_count": new_count,
            }

    async def mark_read(self, email_obj: Email, is_read: bool = True) -> None:
        """Update read status in DB and Gmail API."""
        email_obj.is_read = is_read
        await self.db.commit()
        token = await self.get_valid_access_token()
        if token and email_obj.gmail_message_id and not email_obj.gmail_message_id.startswith("mock-"):
            headers = {"Authorization": f"Bearer {token}"}
            body = {"removeLabelIds": ["UNREAD"]} if is_read else {"addLabelIds": ["UNREAD"]}
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    await client.post(
                        f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{email_obj.gmail_message_id}/modify",
                        headers=headers,
                        json=body,
                    )
            except Exception as e:
                logger.warning("Failed to update read state on Gmail: %s", e)

    async def mark_spam(self, email_obj: Email) -> None:
        """Mark email as spam in DB and Gmail API."""
        email_obj.is_spam = True
        await self.db.commit()
        token = await self.get_valid_access_token()
        if token and email_obj.gmail_message_id and not email_obj.gmail_message_id.startswith("mock-"):
            headers = {"Authorization": f"Bearer {token}"}
            body = {"addLabelIds": ["SPAM"], "removeLabelIds": ["INBOX"]}
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    await client.post(
                        f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{email_obj.gmail_message_id}/modify",
                        headers=headers,
                        json=body,
                    )
            except Exception as e:
                logger.warning("Failed to mark spam on Gmail: %s", e)

    async def trash_email(self, email_obj: Email) -> None:
        """Move email to trash in DB and Gmail API."""
        token = await self.get_valid_access_token()
        if token and email_obj.gmail_message_id and not email_obj.gmail_message_id.startswith("mock-"):
            headers = {"Authorization": f"Bearer {token}"}
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    await client.post(
                        f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{email_obj.gmail_message_id}/trash",
                        headers=headers,
                    )
            except Exception as e:
                logger.warning("Failed to trash on Gmail: %s", e)

        await self.db.delete(email_obj)
        await self.db.commit()
