#!/usr/bin/env python
"""Stratified k-fold cross-validation with baseline comparison.

A single 15% test split of ~450 rows (about 68 samples) is too small to give a
trustworthy accuracy number. This script reports mean +/- std over repeated
stratified folds for several candidate models so claims in the README are
backed by something reproducible.

Usage:  python -m ml.cross_validate
"""

import json
from pathlib import Path

import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import RepeatedStratifiedKFold, StratifiedKFold, cross_val_predict, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

from ml.train import CATEGORIES, load_and_clean_data

SEED = 42


def _tfidf() -> TfidfVectorizer:
    return TfidfVectorizer(max_features=10000, ngram_range=(1, 2), sublinear_tf=True)


def candidates() -> dict[str, Pipeline]:
    return {
        "majority_baseline": Pipeline([("tfidf", _tfidf()), ("clf", DummyClassifier(strategy="most_frequent"))]),
        "tfidf+logreg": Pipeline([("tfidf", _tfidf()), ("clf", LogisticRegression(max_iter=1000, C=10))]),
        "tfidf+linearsvc": Pipeline([("tfidf", _tfidf()), ("clf", LinearSVC(C=1.0, random_state=SEED))]),
        "tfidf+calibrated_linearsvc (shipped)": Pipeline(
            [
                ("tfidf", _tfidf()),
                ("clf", CalibratedClassifierCV(LinearSVC(C=1.0, random_state=SEED), cv=3, method="sigmoid")),
            ]
        ),
    }


def run(csv_path: str = "ml/data/email_dataset.csv", out_path: str = "ml/artifacts/cv_results.json") -> dict:
    df = load_and_clean_data(csv_path)
    X, y = df["text"].values, df["category"].values
    cv = RepeatedStratifiedKFold(n_splits=5, n_repeats=3, random_state=SEED)

    results: dict = {"n_samples": int(len(df)), "cv": "5-fold x3 repeats, stratified", "models": {}}
    for name, pipe in candidates().items():
        scores = cross_validate(pipe, X, y, cv=cv, scoring=["accuracy", "f1_macro"])
        results["models"][name] = {
            "accuracy_mean": round(float(np.mean(scores["test_accuracy"])), 4),
            "accuracy_std": round(float(np.std(scores["test_accuracy"])), 4),
            "f1_macro_mean": round(float(np.mean(scores["test_f1_macro"])), 4),
            "f1_macro_std": round(float(np.std(scores["test_f1_macro"])), 4),
        }

    # Confusion matrix for the shipped model (single 5-fold pass, out-of-fold predictions)
    shipped = candidates()["tfidf+calibrated_linearsvc (shipped)"]
    oof = cross_val_predict(shipped, X, y, cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED))
    labels = sorted(CATEGORIES)
    results["confusion_matrix"] = {
        "labels": labels,
        "matrix": confusion_matrix(y, oof, labels=labels).tolist(),
    }

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    Path(out_path).write_text(json.dumps(results, indent=2))
    return results


if __name__ == "__main__":
    res = run()
    print(f"n={res['n_samples']}  ({res['cv']})\n")
    print(f"{'model':45s} {'accuracy':>16s} {'macro-F1':>16s}")
    for name, m in res["models"].items():
        print(f"{name:45s} {m['accuracy_mean']:.3f} ± {m['accuracy_std']:.3f}   {m['f1_macro_mean']:.3f} ± {m['f1_macro_std']:.3f}")
