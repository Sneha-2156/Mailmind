"""MIME and Gmail message parsing utilities."""

import base64
import email.utils
from typing import Any


def decode_base64_url(data: str) -> str:
    """Decode URL-safe base64 encoded Gmail data strings."""
    if not data:
        return ""
    # Standardize padding
    cleaned = data.replace("-", "+").replace("_", "/")
    pad = len(cleaned) % 4
    if pad:
        cleaned += "=" * (4 - pad)
    try:
        decoded_bytes = base64.b64decode(cleaned)
        return decoded_bytes.decode("utf-8", errors="replace")
    except Exception:
        return ""


def extract_header(headers: list[dict[str, str]], name: str) -> str | None:
    """Case-insensitive extraction of a header value from Gmail headers list."""
    if not headers:
        return None
    target = name.lower()
    for header in headers:
        if header.get("name", "").lower() == target:
            return header.get("value")
    return None


def parse_sender(from_header: str | None) -> tuple[str, str]:
    """Parse From header into (display_name, email_address)."""
    if not from_header:
        return "", ""
    name, addr = email.utils.parseaddr(from_header)
    return name.strip(), addr.strip().lower()


def parse_recipients(to_header: str | None) -> list[str]:
    """Parse To/Cc headers into a list of normalized email addresses."""
    if not to_header:
        return []
    addresses = email.utils.getaddresses([to_header])
    return [addr.strip().lower() for _, addr in addresses if addr.strip()]


def get_body_parts(payload: dict[str, Any]) -> dict[str, str]:
    """Recursively extract plain text and HTML parts from Gmail payload.

    Returns:
        dict: {"plain": str, "html": str}
    """
    body_parts = {"plain": "", "html": ""}

    if not payload:
        return body_parts

    mime_type = payload.get("mimeType", "")
    data = payload.get("body", {}).get("data", "")

    if mime_type == "text/plain" and data:
        body_parts["plain"] += decode_base64_url(data)
    elif mime_type == "text/html" and data:
        body_parts["html"] += decode_base64_url(data)

    parts = payload.get("parts", [])
    for part in parts:
        sub_parts = get_body_parts(part)
        if sub_parts["plain"]:
            body_parts["plain"] += ("\n" if body_parts["plain"] else "") + sub_parts["plain"]
        if sub_parts["html"]:
            body_parts["html"] += ("\n" if body_parts["html"] else "") + sub_parts["html"]

    return body_parts
