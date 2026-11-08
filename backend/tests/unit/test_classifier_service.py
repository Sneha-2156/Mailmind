from app.services.classifier_service import ClassifierService


def test_without_model_it_does_not_fabricate_a_category_or_confidence():
    ClassifierService.model_bundle = None
    res = ClassifierService().classify("Campus recruitment drive for internship positions this month")
    assert res.is_needs_review is True
    assert res.category == "Needs Review"
    assert res.confidence == 0.0
