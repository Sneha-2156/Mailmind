"""Tests for the ML pipeline. These train a real model on the shipped dataset."""

import joblib

from ml.predict import load_model, predict
from ml.train import CATEGORIES, load_and_clean_data, normalize_label, train


def test_normalize_label():
    assert normalize_label("  academic ") == "Academic"
    assert normalize_label("career and opportunity") == "Career and Opportunity"
    assert normalize_label(None) == "Miscellaneous"


def test_dataset_is_clean_and_covers_all_categories():
    df = load_and_clean_data("ml/data/email_dataset.csv")
    assert set(df["category"]) == set(CATEGORIES)
    assert df["text"].is_unique


def test_train_saves_bundle_and_beats_chance_by_a_wide_margin(tmp_path):
    out = tmp_path / "model.pkl"
    result = train(output_path=str(out))
    assert out.exists()
    # 9 classes -> ~11% chance. Guard against regressions without being flaky.
    assert result["metadata"]["test_accuracy"] > 0.55
    bundle = load_model(str(out))
    assert set(bundle["categories"]) == set(CATEGORIES)


def test_predict_known_examples(tmp_path):
    out = tmp_path / "model.pkl"
    train(output_path=str(out))
    bundle = load_model(str(out))
    res = predict(bundle, "Merit scholarship applications are open. Apply for the fellowship before the deadline.")
    assert res.category == "Scholarship"
    assert 0.0 < res.confidence <= 1.0


def test_low_confidence_is_flagged_needs_review(tmp_path):
    out = tmp_path / "model.pkl"
    train(output_path=str(out))
    bundle = load_model(str(out))
    res = predict(bundle, "zzz qqq xxx vvv unknown tokens only", threshold=0.99)
    assert res.is_needs_review and res.category == "Needs Review"


def test_missing_model_returns_none(tmp_path):
    assert load_model(str(tmp_path / "nope.pkl")) is None
