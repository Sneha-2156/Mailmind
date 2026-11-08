"""FastAPI Application Entrypoint for MailMind AI."""

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import api_router
from app.core.config import get_settings
from app.core.logging_config import setup_logging
from app.database.connection import init_db
from app.services.classifier_service import ClassifierService

setup_logging()
logger = logging.getLogger("mailmind")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown hooks."""
    logger.info("Initializing MailMind AI application...")
    # Schema: Alembic is the source of truth outside dev/test. create_all() is only a
    # convenience for local development and the test suite, and failures are fatal.
    if settings.APP_ENV.lower() in ("development", "test"):
        await init_db()
        logger.info("Database schema created via create_all (dev/test only).")
    else:
        logger.info("Skipping create_all; expecting `alembic upgrade head` to have run.")

    # Load ML Classifier Model Bundle
    try:
        ClassifierService.load_model()
        logger.info("ML Classifier successfully initialized.")
    except Exception as e:
        logger.error("Could not initialize ML model on startup: %s", e)
    if ClassifierService.model_bundle is None:
        logger.error("No classifier model loaded. Run `python -m ml.train`. Emails will be flagged 'Needs Review'.")

    yield

    logger.info("Shutting down MailMind AI application...")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Intelligent Email Intelligence, Classification, and Productivity Platform",
    lifespan=lifespan,
    docs_url="/docs" if settings.APP_DEBUG or settings.APP_ENV == "development" else None,
    redoc_url=None,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Mount API Routers
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["System"])
async def health_check():
    """Service health and diagnostic status endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "classifier_loaded": ClassifierService.model_bundle is not None,
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Fallback handler for unhandled exceptions."""
    logger.exception("Unhandled server exception on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )
