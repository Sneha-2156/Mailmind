"""Smart reply draft generator service."""

from typing import Any, Optional


class ReplyService:
    """Service generating suggested email replies across multiple tones."""

    @classmethod
    def generate_replies(
        cls,
        subject: str,
        body_text: str,
        sender_name: Optional[str] = None,
        category: Optional[str] = None,
    ) -> dict[str, str]:
        """Generate smart replies in professional, concise, and friendly tones."""
        salutation = f"Hi {sender_name}," if sender_name else "Hello,"
        clean_subj = subject.replace("Re: ", "").replace("RE: ", "").strip()
        lower_body = (body_text or "").lower()

        # Context-aware responses
        if "interview" in lower_body or "opportunity" in lower_body or category == "Career and Opportunity":
            return {
                "professional": (
                    f"{salutation}\n\n"
                    f"Thank you very much for reaching out regarding '{clean_subj}'. "
                    f"I would be glad to discuss this further. I am available at your convenience. "
                    f"Looking forward to the next steps.\n\nBest regards,\n[Your Name]"
                ),
                "concise": (
                    f"{salutation}\n\n"
                    f"Thank you for the update. I confirm my interest and availability. "
                    f"Please let me know the scheduled time.\n\nBest,\n[Your Name]"
                ),
                "friendly": (
                    f"{salutation}\n\n"
                    f"Thanks so much for reaching out! I'm really excited about this opportunity "
                    f"and look forward to speaking soon. Please share the details when ready.\n\nWarm regards,\n[Your Name]"
                ),
            }

        if "deadline" in lower_body or "action required" in lower_body:
            return {
                "professional": (
                    f"{salutation}\n\n"
                    f"Thank you for the notification regarding '{clean_subj}'. "
                    f"I have received the details and will ensure the required actions are completed ahead of the deadline.\n\n"
                    f"Best regards,\n[Your Name]"
                ),
                "concise": (
                    f"{salutation}\n\n"
                    f"Understood. I will complete this and send over confirmation before the deadline.\n\n"
                    f"Thanks,\n[Your Name]"
                ),
                "friendly": (
                    f"{salutation}\n\n"
                    f"Thanks for the helpful reminder! Working on this now and will have it submitted shortly.\n\n"
                    f"Cheers,\n[Your Name]"
                ),
            }

        # Default general responses
        return {
            "professional": (
                f"{salutation}\n\n"
                f"Thank you for your message regarding '{clean_subj}'. "
                f"I have received your email and will review the contents and follow up shortly.\n\n"
                f"Sincerely,\n[Your Name]"
            ),
            "concise": (
                f"{salutation}\n\n"
                f"Thank you for the update. Received and noted.\n\n"
                f"Best,\n[Your Name]"
            ),
            "friendly": (
                f"{salutation}\n\n"
                f"Thanks for following up on this! Great hearing from you. "
                f"I will take a look and get back to you soon.\n\n"
                f"Warmly,\n[Your Name]"
            ),
        }
