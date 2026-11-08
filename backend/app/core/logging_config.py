"""Structured logging configuration with sensitive data redaction."""

import json
import logging
import re
import sys
from datetime import datetime, timezone
from typing import Any
from app.core.config import get_settings

SENSITIVE_KEYS = {
    "token",
    "access_token",
    "refresh_token",
    "encrypted_access_token",
    "encrypted_refresh_token",
    "password",
    "secret",
    "secret_key",
    "authorization",
    "cookie",
    "body_text",
    "body_html",
    "snippet",
    "credentials",
}

TOKEN_PATTERN = re.compile(r"(Bearer\s+)[A-Za-z0-9\-._~+/]+=*", re.IGNORECASE)


def redact_sensitive_data(val: Any) -> Any:
    """Recursively redact sensitive keys from dictionaries, lists, or strings."""
    if isinstance(val, dict):
        clean = {}
        for k, v in val.items():
            if any(sens in k.lower() for sens in SENSITIVE_KEYS):
                clean[k] = "[REDACTED]"
            else:
                clean[k] = redact_sensitive_data(v)
        return clean
    elif isinstance(val, (list, tuple, set)):
        return [redact_sensitive_data(item) for item in val]
    elif isinstance(val, str):
        return TOKEN_PATTERN.sub(r"\1[REDACTED]", val)
    return val


class RedactingFilter(logging.Filter):
    """Logging filter that scrubs sensitive information from log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = TOKEN_PATTERN.sub(r"\1[REDACTED]", record.msg)
        if record.args:
            if isinstance(record.args, dict):
                record.args = redact_sensitive_data(record.args)
            elif isinstance(record.args, tuple):
                record.args = tuple(redact_sensitive_data(arg) for arg in record.args)
        return True


class JSONFormatter(logging.Formatter):
    """JSON log formatter for production environments."""

    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "funcName": record.funcName,
            "lineNo": record.lineno,
        }
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)


def setup_logging() -> None:
    """Configure structured logging based on current APP_ENV."""
    settings = get_settings()
    is_prod = settings.APP_ENV.lower() == "production"
    log_level = logging.INFO if not settings.APP_DEBUG else logging.DEBUG

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Clear existing handlers
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setLevel(log_level)
    stream_handler.addFilter(RedactingFilter())

    if is_prod:
        stream_handler.setFormatter(JSONFormatter())
    else:
        dev_format = "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
        stream_handler.setFormatter(logging.Formatter(dev_format))

    root_logger.addHandler(stream_handler)

    # Silence overly verbose external libraries
    logging.getLogger("googleapiclient").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("passlib").setLevel(logging.WARNING)
