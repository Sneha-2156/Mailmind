#!/usr/bin/env python
"""Evaluate saved MailMind AI classifier on test set."""

import json
import logging
import os
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import StratifiedShuffleSplit

from ml.train import load_and_clean_data

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def evaluate(
    csv_path: str = "ml/data/email_dataset.csv",
    model_path: str = "ml/artifacts/model_v1.pkl",
    artifacts_dir: str = "ml/artifacts",
    random_state: int = 42,
) -> dict:
    """Evaluate trained model bundle on the unseen test set."""
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Trained model bundle not found at {model_path}. Run train.py first.")

    bundle = joblib.load(model_path)
    pipeline = bundle["model"]
    classes = list(pipeline.classes_)

    df = load_and_clean_data(csv_path)
    X = df["text"].values
    y = df["category"].values

    # Reproduce identical 70/15/15 split
    split1 = StratifiedShuffleSplit(n_splits=1, test_size=0.30, random_state=random_state)
    _, temp_idx = next(split1.split(X, y))

    X_temp, y_temp = X[temp_idx], y[temp_idx]
    split2 = StratifiedShuffleSplit(n_splits=1, test_size=0.50, random_state=random_state)
    _, test_idx = next(split2.split(X_temp, y_temp))

    X_test, y_test = X_temp[test_idx], y_temp[test_idx]

    logger.info("Evaluating on %d test samples...", len(X_test))
    y_pred = pipeline.predict(X_test)

    accuracy = float(accuracy_score(y_test, y_pred))
    report_dict = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    report_text = classification_report(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=classes)

    print("\n================== TEST SET EVALUATION ==================")
    print(f"Test Accuracy: {accuracy:.4f}")
    print("\nClassification Report:\n")
    print(report_text)
    print("\nConfusion Matrix:")
    print(cm)
    print("=========================================================\n")

    # Save evaluation artifacts
    out_dir = Path(artifacts_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    cm_record = {
        "classes": classes,
        "matrix": cm.tolist(),
        "accuracy": accuracy,
        "sample_count": len(X_test),
    }

    with open(out_dir / "confusion_matrix.json", "w", encoding="utf-8") as f:
        json.dump(cm_record, f, indent=2)

    with open(out_dir / "evaluation_report.txt", "w", encoding="utf-8") as f:
        f.write(f"MailMind AI Classifier Evaluation\nAccuracy: {accuracy:.4f}\n\n")
        f.write(report_text)

    logger.info("Evaluation artifacts saved to %s", artifacts_dir)

    return {
        "accuracy": accuracy,
        "report": report_dict,
        "confusion_matrix": cm.tolist(),
    }


if __name__ == "__main__":
    evaluate()
