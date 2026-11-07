"""Summarization service with LLM integration and rule-based heuristic fallbacks."""

import json
import logging
import re
from typing import Any, Optional
import httpx
from app.core.config import get_settings

logger = logging.getLogger(__name__)


class SummarizerService:
    """Service generating structured email summaries."""

    @classmethod
    async def summarize(cls, subject: str, body_text: str, category: Optional[str] = None) -> dict[str, Any]:
        """Generate structured summary: {summary, key_points, action_items, deadlines}."""
        settings = get_settings()
        clean_body = (body_text or "").strip()
        clean_subj = (subject or "").strip()

        if not clean_body and not clean_subj:
            return cls._normalize_summary({
                "summary": "No content available to summarize.",
                "key_points": [],
                "action_items": [],
                "deadlines": [],
                "provider_used": "heuristic",
            })

        # If LLM API keys are configured, attempt LLM summarization
        if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            try:
                res = await cls._summarize_gemini(clean_subj, clean_body, settings.GEMINI_API_KEY)
                if res:
                    res["provider_used"] = "gemini"
                    return cls._normalize_summary(res)
            except Exception as e:
                logger.warning("Gemini summarization failed, falling back to heuristic: %s", e)

        elif settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            try:
                res = await cls._summarize_openai(clean_subj, clean_body, settings.OPENAI_API_KEY, settings.OPENAI_MODEL)
                if res:
                    res["provider_used"] = "openai"
                    return cls._normalize_summary(res)
            except Exception as e:
                logger.warning("OpenAI summarization failed, falling back to heuristic: %s", e)

        heuristic = cls._summarize_heuristic(clean_subj, clean_body, category)
        heuristic["provider_used"] = "heuristic"
        return cls._normalize_summary(heuristic)

    @classmethod
    def _normalize_summary(cls, raw: dict[str, Any]) -> dict[str, Any]:
        """Map provider-specific keys onto the frontend AISummary contract."""
        summary = (raw.get("summary") or raw.get("main_summary") or "").strip()
        action_items = raw.get("action_items") or []
        if isinstance(action_items, str):
            action_items = [action_items]
        required_action = raw.get("required_action")
        if not required_action and action_items:
            required_action = action_items[0]
        deadlines = raw.get("deadlines") or raw.get("dates_deadlines") or []
        if isinstance(deadlines, str):
            deadlines = [deadlines]
        links = raw.get("relevant_links") or []
        if isinstance(links, str):
            links = [links]
        return {
            "summary": summary,
            "main_summary": summary,
            "key_points": raw.get("key_points") or [],
            "action_items": action_items,
            "required_action": required_action,
            "deadlines": deadlines,
            "dates_deadlines": deadlines,
            "relevant_links": links,
            "provider_used": raw.get("provider_used") or "heuristic",
        }

    @classmethod
    async def _summarize_gemini(cls, subject: str, body: str, api_key: str) -> Optional[dict[str, Any]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        prompt = (
            "Analyze the following email and return a strictly valid JSON object with these exact keys:\n"
            "- 'summary': a concise 1-2 sentence executive overview.\n"
            "- 'key_points': list of 2-4 key takeaway bullet strings.\n"
            "- 'action_items': list of actionable steps or todos.\n"
            "- 'deadlines': list of specific dates or deadline strings.\n\n"
            f"Subject: {subject}\n"
            f"Body:\n{body[:3000]}\n\n"
            "Respond ONLY with the JSON object."
        )

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
            )
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                # Clean Markdown code fence if present
                clean_json = re.sub(r"^```(?:json)?\s*", "", text.strip())
                clean_json = re.sub(r"\s*```$", "", clean_json)
                return json.loads(clean_json)
        return None

    @classmethod
    async def _summarize_openai(cls, subject: str, body: str, api_key: str, model: str) -> Optional[dict[str, Any]]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        prompt = (
            "Analyze the following email and return a strictly valid JSON object with these exact keys:\n"
            "- 'summary': a concise 1-2 sentence executive overview.\n"
            "- 'key_points': list of 2-4 key takeaway bullet strings.\n"
            "- 'action_items': list of actionable steps or todos.\n"
            "- 'deadlines': list of specific dates or deadline strings.\n\n"
            f"Subject: {subject}\n"
            f"Body:\n{body[:3000]}\n"
        )
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return json.loads(content)
        return None

    @classmethod
    def _summarize_heuristic(cls, subject: str, body: str, category: Optional[str] = None) -> dict[str, Any]:
        """Extractive rule-based summary using sentence scoring and regex extraction."""
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", body) if len(s.strip()) > 15]

        # Extract deadlines
        deadlines = []
        deadline_patterns = [
            r"(?:deadline|last date|due date|by|before|until|closes on)\s*:?\s*([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?)",
            r"(?:deadline|last date|due date|by|before|until|closes on)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"(\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?\b)",
        ]
        for pattern in deadline_patterns:
            matches = re.findall(pattern, f"{subject} {body}", re.IGNORECASE)
            for m in matches:
                clean_m = m.strip()
                if clean_m and clean_m not in deadlines:
                    deadlines.append(clean_m)

        # Extract action items
        action_items = []
        action_verb_patterns = [
            r"(?:please|kindly|make sure to|remember to|you must|required to|action required)\s+([^.!?\n]+[.!?]?)",
            r"(?:apply (?:at|before|via)|submit (?:your|the)|register (?:at|now|by)|confirm your|fill (?:in|out))\s+([^.!?\n]+[.!?]?)",
        ]
        for pattern in action_verb_patterns:
            matches = re.findall(pattern, body, re.IGNORECASE)
            for m in matches:
                item = m.strip()
                if 10 < len(item) < 150 and item not in action_items:
                    action_items.append(item.rstrip("."))

        # Extract key points
        key_points = []
        for s in sentences[:6]:
            if any(term in s.lower() for term in ["announce", "pleased to", "important", "schedule", "result", "selected", "opportunity", "deadline", "fee", "payment", "session", "interview", "test"]):
                if s not in key_points and len(key_points) < 4:
                    key_points.append(s)

        if not key_points and sentences:
            key_points = sentences[:2]

        # Executive summary sentence
        if sentences:
            summary = sentences[0]
            if len(sentences) > 1 and len(summary) < 80:
                summary += " " + sentences[1]
        else:
            summary = subject or "Email received."

        return {
            "summary": summary,
            "key_points": key_points[:4],
            "action_items": action_items[:3],
            "deadlines": deadlines[:3],
        }
