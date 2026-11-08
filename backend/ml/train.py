#!/usr/bin/env python
"""Train the MailMind AI email classifier using Calibrated LinearSVC and TF-IDF."""

from datetime import datetime, timezone
import json
import logging
import os
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
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

NORMALIZED_CATEGORY_MAP = {c.lower(): c for c in CATEGORIES}


def normalize_label(label: str) -> str:
    """Strip whitespace and normalize casing against supported category taxonomy."""
    if not isinstance(label, str):
        return "Miscellaneous"
    cleaned = label.strip()
    return NORMALIZED_CATEGORY_MAP.get(cleaned.lower(), cleaned.title())


def load_and_clean_data(csv_path: str) -> pd.DataFrame:
    """Load, deduplicate, normalize labels, and filter missing or short rows."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Training dataset not found at {csv_path}")

    df = pd.read_csv(csv_path)
    if "text" not in df.columns or "category" not in df.columns:
        raise ValueError("CSV dataset must contain 'text' and 'category' columns.")

    logger.info("Raw dataset loaded: %d rows", len(df))

    # Normalize category labels
    df["category"] = df["category"].apply(normalize_label)

    # Clean text
    df["text"] = df["text"].astype(str).str.strip()

    # Drop missing or very short texts
    df = df[df["text"].str.len() >= 10]

    # Deduplicate
    df = df.drop_duplicates(subset=["text"])

    # Keep only supported categories
    df = df[df["category"].isin(CATEGORIES)]

    logger.info("Cleaned dataset: %d rows across %d categories", len(df), df["category"].nunique())
    return df.reset_index(drop=True)


def train(
    csv_path: str = "ml/data/email_dataset.csv",
    output_path: str = "ml/artifacts/model_v1.pkl",
    random_state: int = 42,
) -> dict:
    """Full training pipeline with 70/15/15 stratified train/val/test splits."""
    df = load_and_clean_data(csv_path)

    X = df["text"].values
    y = df["category"].values

    # Step 1: 70% train vs 30% temp (val + test)
    split1 = StratifiedShuffleSplit(n_splits=1, test_size=0.30, random_state=random_state)
    train_idx, temp_idx = next(split1.split(X, y))

    X_train, y_train = X[train_idx], y[train_idx]
    X_temp, y_temp = X[temp_idx], y[temp_idx]

    # Step 2: Split 30% temp into 15% validation and 15% test
    split2 = StratifiedShuffleSplit(n_splits=1, test_size=0.50, random_state=random_state)
    val_idx, test_idx = next(split2.split(X_temp, y_temp))

    X_val, y_val = X_temp[val_idx], y_temp[val_idx]
    X_test, y_test = X_temp[test_idx], y_temp[test_idx]

    logger.info("Split sizes - Train: %d, Val: %d, Test: %d", len(X_train), len(X_val), len(X_test))

    # Pipeline definition
    vectorizer = TfidfVectorizer(
        max_features=10000,
        ngram_range=(1, 2),
        sublinear_tf=True,
    )

    base_svc = LinearSVC(C=1.0, max_iter=2000, random_state=random_state)
    calibrated_clf = CalibratedClassifierCV(estimator=base_svc, cv=3, method="sigmoid")

    pipeline = Pipeline([
        ("tfidf", vectorizer),
        ("clf", calibrated_clf),
    ])

    logger.info("Fitting model pipeline on training data...")
    pipeline.fit(X_train, y_train)

    # Validation evaluation
    val_preds = pipeline.predict(X_val)
    val_acc = float(accuracy_score(y_val, val_preds))
    logger.info("Validation Accuracy: %.4f", val_acc)

    # Test evaluation
    test_preds = pipeline.predict(X_test)
    test_acc = float(accuracy_score(y_test, test_preds))
    logger.info("Test Accuracy: %.4f", test_acc)

    report = classification_report(y_test, test_preds, output_dict=True, zero_division=0)
    print("\n--- Test Set Classification Report ---")
    print(classification_report(y_test, test_preds, zero_division=0))

    # Save artifacts
    out_dir = Path(output_path).parent
    out_dir.mkdir(parents=True, exist_ok=True)

    metadata = {
        "version": "1.0.0",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "train_samples": int(len(X_train)),
        "val_samples": int(len(X_val)),
        "test_samples": int(len(X_test)),
        "val_accuracy": round(val_acc, 4),
        "test_accuracy": round(test_acc, 4),
        "classes": list(pipeline.classes_),
    }

    bundle = {
        "model": pipeline,
        "categories": CATEGORIES,
        "metadata": metadata,
    }

    joblib.dump(bundle, output_path)
    logger.info("Model bundle successfully saved to %s", output_path)

    return {
        "metadata": metadata,
        "classification_report": report,
    }


if __name__ == "__main__":
    metrics = train()
    print(json.dumps(metrics["metadata"], indent=2))
