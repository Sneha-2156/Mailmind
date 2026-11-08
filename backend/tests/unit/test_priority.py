from app.services.priority_service import score_priority


def _p(**kw):
    return score_priority(kw).priority


def test_urgent_subject_is_critical():
    assert _p(subject="URGENT: fee payment overdue") == "critical"


def test_interview_in_subject_is_high():
    assert _p(subject="Interview schedule for SDE intern") == "high"


def test_career_category_is_high_even_without_keywords():
    assert _p(subject="Update", body_text="see portal", category="Scholarship") == "high"


def test_promotional_is_low():
    assert _p(subject="Big sale this weekend", body_text="unsubscribe anytime") == "low"


def test_official_domain_is_medium():
    assert _p(subject="Notice", body_text="FYI", sender_email="registrar@college.ac.in") == "medium"


def test_default_is_medium_and_has_reason():
    r = score_priority({"subject": "Hello", "body_text": "How are you"})
    assert r.priority == "medium" and r.reason


def test_handles_missing_fields():
    assert score_priority({}).priority == "medium"
