import base64

from app.utils.email_parser import decode_base64_url, extract_header, parse_recipients, parse_sender


def test_decode_base64_url_handles_missing_padding_and_urlsafe_chars():
    raw = "Hello ?>> world"
    enc = base64.urlsafe_b64encode(raw.encode()).decode().rstrip("=")
    assert decode_base64_url(enc) == raw


def test_decode_empty_and_garbage():
    assert decode_base64_url("") == ""


def test_extract_header_is_case_insensitive():
    headers = [{"name": "Subject", "value": "Hi"}]
    assert extract_header(headers, "subject") == "Hi"
    assert extract_header(headers, "From") is None


def test_parse_sender_and_recipients():
    assert parse_sender('"Dr. Rao" <Rao@College.EDU>') == ("Dr. Rao", "rao@college.edu")
    assert parse_recipients("a@x.com, B <b@y.com>") == ["a@x.com", "b@y.com"]
    assert parse_sender(None) == ("", "")
