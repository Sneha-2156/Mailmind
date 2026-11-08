"""Machine learning classifier service for email categorization."""

import logging
from typing import Optional
from app.core.config import get_settings
from ml.predict import ClassificationResult, get_top_terms, load_model, predict

logger = logging.getLogger(__name__)

CATEGORIES = [
    "Academic",
    "Administration",
    "Campus Service",
    "Career and Opportunity",
    "Financial Services",
    "Service Notification",
    "Scholarship",
    "Skill Development",
    "Miscellaneous",
]


class ClassifierService:
    """Service wrapping email classification inference."""

    model_bundle: Optional[dict] = None

    @classmethod
    def load_model(cls, model_path: Optional[str] = None) -> None:
        """Load model bundle from disk into memory."""
        settings = get_settings()
        path = model_path or settings.ML_MODEL_PATH
        cls.model_bundle = load_model(path)
        if cls.model_bundle is None:
            logger.warning("Classifier model bundle could not be loaded from %s", path)
        else:
            logger.info("Classifier model successfully loaded from %s", path)

    def classify(self, text: str) -> ClassificationResult:
        """Classify email text with the trained model; flags for review if no model is loaded."""
        settings = get_settings()
        threshold = settings.ML_CONFIDENCE_THRESHOLD

        if self.model_bundle is not None:
            return predict(self.model_bundle, text, threshold=threshold)

        # No model loaded: do NOT fabricate categories or confidences.
        logger.error("classify() called but no model bundle is loaded; run `python -m ml.train`.")
        return ClassificationResult(
            category="Needs Review",
            confidence=0.0,
            top_terms=[],
            is_needs_review=True,
        )

    def get_top_terms(self, text: str, n: int = 5) -> list[str]:
        """Extract top TF-IDF explanation terms for prediction."""
        if self.model_bundle is None:
            return []
        return get_top_terms(self.model_bundle, text, n=n)


classifier_service = ClassifierService()
