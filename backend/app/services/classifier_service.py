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
        """Classify email text using the trained model or heuristic fallback."""
        settings = get_settings()
        threshold = settings.ML_CONFIDENCE_THRESHOLD

        if self.model_bundle is not None:
            return predict(self.model_bundle, text, threshold=threshold)

        # Graceful fallback when ML artifact has not yet been generated
        cleaned = (text or "").strip()
        if not cleaned or len(cleaned) < 10:
            return ClassificationResult(
                category="Miscellaneous",
                confidence=0.0,
                top_terms=[],
                is_needs_review=False,
            )

        lower_text = cleaned.lower()
        if "scholarship" in lower_text or "fellowship" in lower_text:
            return ClassificationResult(category="Scholarship", confidence=0.85, top_terms=["scholarship"])
        if "internship" in lower_text or "placement" in lower_text or "recruitment" in lower_text:
            return ClassificationResult(category="Career and Opportunity", confidence=0.85, top_terms=["placement"])
        if "exam" in lower_text or "assignment" in lower_text or "syllabus" in lower_text:
            return ClassificationResult(category="Academic", confidence=0.80, top_terms=["exam"])
        if "fee" in lower_text or "tuition" in lower_text or "payment" in lower_text:
            return ClassificationResult(category="Financial Services", confidence=0.80, top_terms=["fee"])

        return ClassificationResult(
            category="Miscellaneous",
            confidence=0.0,
            top_terms=[],
            is_needs_review=False,
        )

    def get_top_terms(self, text: str, n: int = 5) -> list[str]:
        """Extract top TF-IDF explanation terms for prediction."""
        if self.model_bundle is None:
            return []
        return get_top_terms(self.model_bundle, text, n=n)


classifier_service = ClassifierService()
