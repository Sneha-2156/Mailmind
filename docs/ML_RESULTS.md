# ML Results

Reproduce: `cd backend && python -m ml.train && python -m ml.cross_validate`

**Dataset:** 451 labelled, synthetic, templated emails across 9 categories (about 42-52 per class).
**Protocol:** 5-fold x3 repeats, stratified. A single 15% hold-out is only ~68 rows, so it is too noisy to quote on its own.

| Model | Accuracy | Macro-F1 |
|---|---|---|
| majority_baseline | 0.111 ± 0.001 | 0.022 ± 0.000 |
| tfidf+logreg | 0.761 ± 0.031 | 0.759 ± 0.029 |
| tfidf+linearsvc | 0.763 ± 0.030 | 0.757 ± 0.028 |
| tfidf+calibrated_linearsvc (shipped) | 0.763 ± 0.028 | 0.760 ± 0.026 |

## Out-of-fold confusion matrix (shipped model)

| true \ pred | Academ | Admini | Campus | Career | Financ | Miscel | Schola | Servic | Skill  |
|---|---|---|---|---|---|---|---|---|---|
| Academic | 32 | 3 | 3 | 0 | 1 | 0 | 0 | 2 | 1 |
| Administration | 6 | 29 | 8 | 0 | 6 | 1 | 0 | 1 | 1 |
| Campus Service | 1 | 8 | 32 | 0 | 1 | 7 | 0 | 3 | 0 |
| Career and Opportunity | 0 | 0 | 0 | 48 | 0 | 1 | 0 | 1 | 1 |
| Financial Services | 0 | 8 | 1 | 0 | 38 | 0 | 4 | 0 | 0 |
| Miscellaneous | 0 | 4 | 11 | 2 | 0 | 31 | 0 | 1 | 2 |
| Scholarship | 0 | 0 | 0 | 0 | 2 | 1 | 47 | 0 | 1 |
| Service Notification | 2 | 1 | 1 | 0 | 0 | 0 | 0 | 45 | 1 |
| Skill Development | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 47 |

## How to read this honestly

- The shipped calibrated LinearSVC is **~76% accurate**, far above the 11% majority baseline, but **no better than plain logistic regression** on this data. Calibration is kept because it provides usable confidence scores for the "Needs Review" threshold, not because it is more accurate.
- Most errors are among **Administration / Campus Service / Miscellaneous**, categories whose definitions overlap.
- The data is synthetic and templated, so accuracy on real inboxes is expected to be **lower**. Next step: collect and label real (anonymised) emails and report on those separately.
