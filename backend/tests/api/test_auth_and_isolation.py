"""Auth, cookie handling, and cross-user isolation (IDOR) tests."""

import uuid

from tests.api.conftest import make_email, make_user

PROTECTED_GETS = [
    "/api/v1/auth/me",
    "/api/v1/emails",
    "/api/v1/tasks",
    "/api/v1/opportunities",
    "/api/v1/analytics/summary",
]


def test_protected_routes_require_auth(client):
    for path in PROTECTED_GETS:
        resp = client.get(path)
        assert resp.status_code in (401, 404), f"{path} -> {resp.status_code}"
        assert resp.status_code != 200


def test_health_is_public(client):
    assert client.get("/health").status_code == 200


def test_demo_login_sets_httponly_cookie_and_does_not_return_jwt_in_body(client):
    resp = client.post("/api/v1/auth/dev-login")
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" not in body
    assert body["user"]["email"] == "demo@mailmind.ai"
    set_cookie = resp.headers.get("set-cookie", "").lower()
    assert "access_token=" in set_cookie and "httponly" in set_cookie
    # Cookie alone authenticates subsequent requests
    assert client.get("/api/v1/auth/me").status_code == 200


def test_logout_clears_session(client):
    client.post("/api/v1/auth/dev-login")
    client.post("/api/v1/auth/logout")
    client.cookies.clear()
    assert client.get("/api/v1/auth/me").status_code == 401


def test_garbage_bearer_token_rejected(client):
    resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not.a.jwt"})
    assert resp.status_code == 401


def test_user_cannot_read_or_modify_another_users_email(client):
    owner_id, _ = make_user("owner@example.com", "g-owner")
    _, intruder_headers = make_user("intruder@example.com", "g-intruder")
    email_id = make_email(owner_id)

    assert client.get(f"/api/v1/emails/{email_id}", headers=intruder_headers).status_code == 404
    assert client.patch(f"/api/v1/emails/{email_id}/read", json={"is_read": True}, headers=intruder_headers).status_code == 404
    assert client.post(f"/api/v1/emails/{email_id}/trash", headers=intruder_headers).status_code == 404


def test_email_list_only_contains_own_emails(client):
    owner_id, owner_headers = make_user("owner@example.com", "g-owner")
    other_id, other_headers = make_user("other@example.com", "g-other")
    make_email(owner_id, "Owner secret")
    make_email(other_id, "Other secret")

    resp = client.get("/api/v1/emails", headers=owner_headers)
    assert resp.status_code == 200
    text = resp.text
    assert "Owner secret" in text and "Other secret" not in text


def test_unknown_email_id_is_404(client):
    _, headers = make_user("u@example.com", "g-u")
    assert client.get(f"/api/v1/emails/{uuid.uuid4()}", headers=headers).status_code == 404
