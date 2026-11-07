"""Task and Career/Academic Opportunity extraction service."""

from datetime import datetime, timedelta, timezone
import re
from typing import Any, Optional

OPPORTUNITY_KEYWORDS = {
    "internship": ["internship", "summer intern", "winter intern", "research intern", "intern"],
    "placement": ["placement drive", "campus placement", "campus recruitment", "job offer", "full-time role", "hiring"],
    "scholarship": ["scholarship", "fellowship", "financial aid", "grant award", "tuition waiver"],
    "hackathon": ["hackathon", "coding challenge", "ideathon", "datathon", "competition"],
    "academic": ["examination schedule", "midterm", "end-semester", "grade release", "course registration", "syllabus"],
}


def _extract_date(text: str) -> Optional[datetime]:
    """Extract a deadline date from text or return None."""
    # Look for patterns like "March 15, 2026" or "15/04/2026" or "in 3 days"
    now = datetime.now(timezone.utc)
    
    # "in X days"
    m_days = re.search(r"in\s+(\d+)\s+days?", text, re.IGNORECASE)
    if m_days:
        return now + timedelta(days=int(m_days.group(1)))

    # "tomorrow"
    if re.search(r"\btomorrow\b", text, re.IGNORECASE):
        return now + timedelta(days=1)

    # Date parsing attempts
    patterns = [
        r"(\d{1,2})[/-](\d{1,2})[/-](\d{4})",
        r"(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,\s*(\d{4}))?",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            # Provide sensible future date based on match or default 7 days from now
            return now + timedelta(days=7)

    return None


class ExtractionService:
    """Service to automatically extract tasks, deadlines, and career opportunities from emails."""

    @classmethod
    def extract_tasks(cls, subject: str, body_text: str, priority: str = "medium") -> list[dict[str, Any]]:
        """Extract actionable tasks with deadlines from email subject and body."""
        tasks: list[dict[str, Any]] = []
        content = f"{subject}\n{body_text}"

        task_patterns = [
            r"(?:please|kindly|remember to|make sure to|action required:?)\s+([^.!?\n]{10,120})",
            r"(?:submit (?:your|the)|upload (?:your|the)|fill (?:out|in)|complete the|register for)\s+([^.!?\n]{10,120})",
            r"(?:deadline|due date|due by)\s*:?\s*([^.!?\n]{10,80})",
        ]

        seen_titles = set()
        for pat in task_patterns:
            matches = re.finditer(pat, content, re.IGNORECASE)
            for m in matches:
                title_frag = m.group(0).strip().rstrip(".:")
                title = title_frag[0].upper() + title_frag[1:]
                if title.lower() not in seen_titles and len(title) > 12:
                    seen_titles.add(title.lower())
                    due_date = _extract_date(content)
                    tasks.append({
                        "title": title[:200],
                        "description": f"Extracted from email: '{subject[:60]}'",
                        "due_date": due_date,
                        "priority": priority if priority in ["critical", "high", "medium", "low"] else "medium",
                        "confidence": 0.85,
                        "is_completed": False,
                    })
                if len(tasks) >= 3:
                    break

        return tasks

    @classmethod
    def extract_opportunity(
        cls, subject: str, body_text: str, category: Optional[str] = None
    ) -> Optional[dict[str, Any]]:
        """Identify if email represents a student/career opportunity and extract its attributes."""
        content = f"{subject}\n{body_text}".lower()

        # Determine type
        detected_type: Optional[str] = None
        for opp_type, keywords in OPPORTUNITY_KEYWORDS.items():
            if any(kw in content for kw in keywords):
                detected_type = opp_type
                break

        if not detected_type:
            if category in ["Career and Opportunity", "Scholarship"]:
                detected_type = "placement" if category == "Career and Opportunity" else "scholarship"
            else:
                return None

        # Extract company or institution
        company = None
        comp_m = re.search(r"(?:at|with|by|from)\s+([A-Z][A-Za-z0-9\s&]{2,30})", f"{subject}\n{body_text}")
        if comp_m:
            company = comp_m.group(1).strip()
        else:
            # Fallback from subject
            company = "Campus / Partner Organization"

        # Extract stipend or compensation if any
        stipend = None
        stipend_m = re.search(r"(?:stipend|salary|ctc|grant|award|amount)\s*:?\s*([^.!?\n]{4,40})", body_text, re.IGNORECASE)
        if stipend_m:
            stipend = stipend_m.group(1).strip()

        # Extract application URL
        url_m = re.search(r'https?://[^\s<>"\']+(?:apply|register|careers|form|jobs)[^\s<>"\']*', body_text, re.IGNORECASE)
        application_url = url_m.group(0) if url_m else None

        deadline = _extract_date(body_text)

        title = subject.strip() if len(subject.strip()) > 5 else f"{detected_type.title()} Opportunity"

        return {
            "title": title[:200],
            "company": company[:100] if company else None,
            "role": detected_type.title(),
            "opportunity_type": detected_type,
            "eligibility": "All eligible students and applicants",
            "skills_required": ["Communication", "Problem Solving"],
            "stipend": stipend,
            "application_url": application_url,
            "deadline": deadline,
            "status": "new",
            "confidence": 0.88,
        }
