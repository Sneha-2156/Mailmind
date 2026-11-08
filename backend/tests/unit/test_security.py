from datetime import timedelta

from app.core.security import (
    create_access_token,
    decrypt_token,
    encrypt_token,
    verify_access_token,
)


def test_encrypt_decrypt_roundtrip_and_ciphertext_differs():
    secret = "ya29.a0-fake-google-access-token"
    enc = encrypt_token(secret)
    assert enc != secret and secret not in enc
    assert decrypt_token(enc) == secret


def test_empty_values():
    assert encrypt_token("") == ""
    assert decrypt_token("") == ""


def test_decrypt_garbage_returns_empty_string_not_exception():
    assert decrypt_token("not-a-valid-fernet-token") == ""


def test_jwt_roundtrip():
    token = create_access_token({"sub": "123", "email": "a@b.com"})
    payload = verify_access_token(token)
    assert payload["sub"] == "123" and payload["email"] == "a@b.com"


def test_tampered_jwt_rejected():
    token = create_access_token({"sub": "123"})
    assert verify_access_token(token[:-2] + ("aa" if not token.endswith("aa") else "bb")) is None


def test_expired_jwt_rejected():
    token = create_access_token({"sub": "123"}, expires_delta=timedelta(seconds=-5))
    assert verify_access_token(token) is None
