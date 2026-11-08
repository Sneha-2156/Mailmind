"""Phishing and email security analysis service."""

from dataclasses import dataclass, field
import re
from typing import Any
from urllib.parse import urlparse

SUSPICIOUS_TLDS = {".xyz", ".top", ".click", ".buzz", ".monster", ".work", ".fit", ".rest"}

URGENT_CREDENTIAL_PHRASES = [
    r"\bverify your account\b",
    r"\bconfirm your password\b",
    r"\baccount suspended\b",
    r"\bsecurity alert\b.*\blogin\b",
    r"\bunauthorized access detected\b",
    r"\bupdate your billing\b",
    r"\bimmediate action required\b",
    r"\bwire transfer\b",
    r"\bclaim your prize\b",
    r"\bwon the lottery\b",
    r"\bcrypto transfer\b",
    r"\breset password immediately\b",
    r"\benter your (ssn|credit card|credentials|bank)\b",
]

SPOOFED_BRAND_PATTERNS = [
    (r"paypal", r"@.*paypal\.com$"),
    (r"google", r"@.*google\.com$"),
    (r"microsoft", r"@.*microsoft\.com$"),
    (r"apple", r"@.*apple\.com$"),
    (r"netflix", r"@.*netflix\.com$"),
    (r"amazon", r"@.*amazon\.com$"),
    (r"bank of america", r"@.*bankofamerica\.com$"),
    (r"chase", r"@.*chase\.com$"),
    (r"wells fargo", r"@.*wellsfargo\.com$"),
]


@dataclass
class PhishingAnalysisResult:
    """Analysis result describing email phishing risk and specific reasons."""

    risk_level: str  # none | low | medium | high
    reasons: list[str] = field(default_factory=list)
    confidence: float = 0.0


def analyze_phishing(email_data: dict[str, Any]) -> PhishingAnalysisResult:
    """Analyze email metadata and content for phishing indicators.

    Produces explainable security warnings and calculates risk level.
    """
    reasons: list[str] = []
    sender_email = (email_data.get("sender_email") or "").lower().strip()
    sender_name = (email_data.get("sender_name") or "").lower().strip()
    subject = (email_data.get("subject") or "").lower()
    body_text = (email_data.get("body_text") or "").lower()
    body_html = (email_data.get("body_html") or "").lower()

    content = f"{subject}\n{body_text}"

    # 1. Brand Spoofing Check: Display name impersonates a major brand but sender domain doesn't match
    for brand, legit_pattern in SPOOFED_BRAND_PATTERNS:
        if brand in sender_name or brand in subject:
            if sender_email and not re.search(legit_pattern, sender_email):
                # Only flag if sender domain is clearly not the brand
                if not any(domain in sender_email for domain in [f"{brand}.com", f"{brand}.org", f"{brand}.net"]):
                    reasons.append(
                        f"Sender display name mentions '{brand.title()}' but sender address ({sender_email}) is from an unrelated domain."
                    )

    # 2. Urgent Credential / Account Suspension phrases
    found_phrases = []
    for pattern in URGENT_CREDENTIAL_PHRASES:
        if re.search(pattern, content):
            matched = pattern.replace(r"\b", "").replace(".*", "...")
            found_phrases.append(matched)

    if found_phrases:
        reasons.append(
            f"Contains high-urgency security or credential phrasing: {', '.join(found_phrases[:3])}."
        )

    # 3. URL Analysis
    urls = re.findall(r'https?://[^\s<>"\']+', content + " " + body_html)
    ip_in_url = False
    suspicious_tld_found = False

    for url in urls:
        try:
            parsed = urlparse(url)
            hostname = parsed.hostname or ""
            # Check for IP address as hostname
            if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", hostname):
                ip_in_url = True
            # Check for suspicious top-level domains
            for tld in SUSPICIOUS_TLDS:
                if hostname.endswith(tld):
                    suspicious_tld_found = True
        except Exception:
            continue

    if ip_in_url:
        reasons.append("Contains link(s) pointing directly to a raw numerical IP address instead of a domain.")

    if suspicious_tld_found:
        reasons.append("Contains links hosted on top-level domains frequently associated with phishing or malware.")

    # 4. Mismatched Reply-To
    reply_to = (email_data.get("reply_to") or "").lower().strip()
    if reply_to and sender_email and reply_to != sender_email:
        sender_domain = sender_email.split("@")[-1] if "@" in sender_email else ""
        reply_domain = reply_to.split("@")[-1] if "@" in reply_to else ""
        if sender_domain and reply_domain and sender_domain != reply_domain:
            reasons.append(
                f"Reply-To address domain ({reply_domain}) does not match sender domain ({sender_domain})."
            )

    # Calculate overall risk
    num_issues = len(reasons)
    if num_issues == 0:
        return PhishingAnalysisResult(risk_level="none", reasons=[], confidence=0.95)
    elif num_issues == 1:
        return PhishingAnalysisResult(risk_level="low", reasons=reasons, confidence=0.75)
    elif num_issues == 2:
        return PhishingAnalysisResult(risk_level="medium", reasons=reasons, confidence=0.88)
    else:
        return PhishingAnalysisResult(risk_level="high", reasons=reasons, confidence=0.96)
