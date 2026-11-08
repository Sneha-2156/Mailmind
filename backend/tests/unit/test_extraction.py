from datetime import datetime, timezone

from app.services.extraction_service import ExtractionService, _extract_date

NOW = datetime(2026, 11, 7, tzinfo=timezone.utc)


def test_day_first_numeric_date_is_parsed_exactly():
    assert _extract_date("Register before 15/11/2026", NOW).date().isoformat() == "2026-11-15"


def test_month_name_with_explicit_year():
    assert _extract_date("Deadline: March 15, 2026", NOW).date().isoformat() == "2026-03-15"


def test_day_then_month_with_ordinal():
    assert _extract_date("apply by 10th November", NOW).date().isoformat() == "2026-11-10"


def test_yearless_past_date_rolls_to_next_year():
    assert _extract_date("Submit by Nov 3", NOW).date().isoformat() == "2027-11-03"


def test_relative_dates():
    assert _extract_date("due in 3 days", NOW).date().isoformat() == "2026-11-10"
    assert _extract_date("send it tomorrow", NOW).date().isoformat() == "2026-11-08"


def test_never_invents_a_date():
    assert _extract_date("Please read the attached notes", NOW) is None
    assert _extract_date("by Feb 30", NOW) is None  # impossible date -> None, not a guess


def test_extract_tasks_finds_action_with_real_deadline():
    tasks = ExtractionService.extract_tasks(
        "Placement form",
        "Please submit your resume on the portal. Deadline: 20/11/2026",
        priority="high",
    )
    assert tasks, "expected at least one task"
    assert tasks[0]["priority"] == "high"
    assert tasks[0]["due_date"].date().isoformat() == "2026-11-20"


def test_extract_tasks_empty_for_plain_text():
    assert ExtractionService.extract_tasks("Hi", "Just saying hello to you all.") == []
