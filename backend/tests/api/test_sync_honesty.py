"""Sync must never fabricate emails for a real user."""

from tests.api.conftest import make_user


def test_real_user_without_gmail_gets_409_and_no_emails(client):
    _, headers = make_user("real@example.com", "g-real")

    for path in ("/api/v1/gmail/sync", "/api/v1/emails/sync"):
        resp = client.post(path, headers=headers)
        assert resp.status_code == 409, path
        assert "not connected" in resp.json()["detail"].lower()

    listing = client.get("/api/v1/emails", headers=headers).json()
    items = listing["items"] if isinstance(listing, dict) and "items" in listing else listing
    assert items == [] or items is None


def test_demo_user_gets_clearly_labelled_demo_data(client):
    client.post("/api/v1/auth/dev-login")
    resp = client.post("/api/v1/gmail/sync")
    assert resp.status_code == 200
    assert resp.json()["mode"] == "demo"
