from app.services.phishing_service import analyze_phishing


def test_clean_email_has_no_risk():
    r = analyze_phishing({"sender_email": "prof@college.edu", "subject": "Lecture notes", "body_text": "Attached."})
    assert r.risk_level == "none" and r.reasons == []


def test_raw_ip_link_is_flagged_with_reason():
    r = analyze_phishing({
        "sender_email": "x@example.com",
        "subject": "Document",
        "body_text": "Open http://192.168.4.20/login now",
    })
    assert r.risk_level != "none"
    assert any("IP address" in reason for reason in r.reasons)


def test_suspicious_tld_flagged():
    r = analyze_phishing({"sender_email": "x@example.com", "body_text": "see http://claim-prize.xyz/now"})
    assert any("top-level domains" in reason for reason in r.reasons)


def test_reply_to_domain_mismatch_flagged():
    r = analyze_phishing({
        "sender_email": "hr@company.com",
        "reply_to": "hr@evil-mail.net",
        "subject": "Offer",
        "body_text": "Congrats",
    })
    assert any("Reply-To" in reason for reason in r.reasons)


def test_more_signals_raise_risk_level():
    one = analyze_phishing({"sender_email": "a@b.com", "body_text": "http://1.2.3.4/x"})
    many = analyze_phishing({
        "sender_email": "a@b.com",
        "reply_to": "z@other.org",
        "body_text": "http://1.2.3.4/x and http://win.xyz/y",
    })
    order = ["none", "low", "medium", "high"]
    assert order.index(many.risk_level) > order.index(one.risk_level)
