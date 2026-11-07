"""Inference engine for email classification using the trained model bundle."""

from dataclasses import dataclass, field
import logging
import os
import joblib
import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class ClassificationResult:
    """Result returned by the classifier."""

    category: str
    confidence: float
    top_terms: list[str] = field(default_factory=list)
    is_needs_review: bool = False


def load_model(path: str) -> dict | None:
    """Load model bundle from disk.

    Returns:
        dict: Bundle containing {'model': pipeline, 'categories': list, 'metadata': dict}
    """
    if not os.path.exists(path):
        logger.warning("Classifier model bundle not found at %s", path)
        return None
    try:
        bundle = joblib.load(path)
        logger.info("Successfully loaded model bundle from %s", path)
        return bundle
    except Exception as e:
        logger.error("Failed to load model bundle from %s: %s", path, e)
        return None


def get_top_terms(bundle: dict, text: str, n: int = 5) -> list[str]:
    """Extract top TF-IDF terms from the text that contributed to classification."""
    try:
        pipeline = bundle.get("model")
        if not pipeline or not hasattr(pipeline, "named_steps"):
            return []
        tfidf = pipeline.named_steps.get("tfidf")
        if not tfidf:
            return []

        features = np.array(tfidf.get_feature_names_out())
        vec = tfidf.transform([text])
        if vec.nnz == 0:
            return []

        scores = vec.toarray()[0]
        top_indices = scores.argsort()[::-1][:n]
        return [str(features[i]) for i in top_indices if scores[i] > 0]
    except Exception:
        return []


def predict(bundle: dict | None, text: str, threshold: float = 0.45) -> ClassificationResult:
    """Predict the category and calibrated confidence for the given email text.

    Args:
        bundle: Loaded model dictionary bundle.
        text: Input email text (subject + body).
        threshold: Minimum confidence required before categorizing as 'Needs Review'.

    Returns:
        ClassificationResult with predicted category and confidence.
    """
    cleaned_text = (text or "").strip()
    if not cleaned_text or len(cleaned_text) < 10 or bundle is None:
        return ClassificationResult(
            category="Miscellaneous",
            confidence=0.0,
            top_terms=[],
            is_needs_review=False,
        )

    pipeline = bundle.get("model")
    if pipeline is None:
        return ClassificationResult(
            category="Miscellaneous",
            confidence=0.0,
            top_terms=[],
            is_needs_review=False,
        )

    try:
        # Calibrated classifier produces probability distributions
        probs = pipeline.predict_proba([cleaned_text])[0]
        classes = pipeline.classes_
        top_idx = int(np.argmax(probs))
        raw_category = str(classes[top_idx])
        confidence = float(probs[top_idx])
        top_terms = get_top_terms(bundle, cleaned_text, n=5)

        if confidence < threshold:
            return ClassificationResult(
                category="Needs Review",
                confidence=round(confidence, 4),
                top_terms=top_terms,
                is_needs_review=True,
            )

        return ClassificationResult(
            category=raw_category,
            confidence=round(confidence, 4),
            top_terms=top_terms,
            is_needs_review=False,
        )
    except Exception as e:
        logger.error("Error during prediction: %s", e)
        return ClassificationResult(
            category="Miscellaneous",
            confidence=0.0,
            top_terms=[],
            is_needs_review=False,
        )
