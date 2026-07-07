# AegisAid — Hackathon Submission Checklist

Mapped directly against the *WiePrompt Hackathon: Data for the Displaced*
specification book. Use this as the final pass before you submit.

## A. Required Deliverable Components (spec p.6)

| # | Requirement | Status | File(s) | Notes |
|---|---|:---:|---|---|
| 1 | Working prototype: needs-prediction / allocation model | ✅ Done | `index.html`, `app.js`, `scripts/privacy_allocation.py` | Verified end-to-end: Python backend + browser dashboard both run and agree. |
| 2 | Data Protection & Do-No-Harm Assessment, **max 2 pages** | ✅ Done | `do_no_harm_assessment.pdf` | Renders as **1 page**. Source in `do_no_harm_assessment.md`. |
| 3 | Documentation: setup, data sources, privacy technique | ✅ Done | `README.md` | Includes run instructions, formulas, repo structure. |
| 4 | A presentation slide | ✅ Done (exceeds ask) | `presentation.html` | Full 7-slide interactive deck, not just one slide. |
| 5 | Public GitHub repository with clear README | ⚠️ **Action needed** | — | Not yet pushed. See "Publishing to GitHub" section in `README.md` for the exact commands. **Do this before the deadline — an un-pushed repo scores 0 on this line.** |

## B. Hard Constraints (must not violate)

| Constraint | Status | Evidence |
|---|:---:|---|
| No real personal data on displaced/refugee individuals | ✅ | `synthetic_gen.py` generates fully synthetic households; no names, no GPS, no real IDs anywhere in the repo. |
| System must operate without storing/requiring identifying data | ✅ | Offline, client-side only; ages generalized into 5 bands; k-anonymity + DP applied before any aggregate is shown. |
| Trade-offs made explicit, not just claimed | ✅ | `do_no_harm_assessment.pdf`, "Conclusion" section quantifies the ~8% utility cost of privacy protection. |

## C. Evaluation Criteria Self-Check (spec p.7, 95 pts total)

| Criterion | Max | Self-assessed strength | Where it's demonstrated |
|---|---:|---|---|
| Technical Implementation | 25 | Strong | Both Python scripts and the JS dashboard run without errors; verified numerically. |
| AI Solution Quality | 20 | **Weakest area — see Section D** | DP/k-anonymity/fairness-allocation are classical statistics, not learned models. |
| Privacy & Ethical Design | 20 | Strongest | Three-layer defense (k-anon → DP → offline-first), see `do_no_harm_assessment.pdf`. |
| Explainability | 10 | Good | Dashboard shows confidence/utility %, allocation summary text, DP noise displayed live. |
| SDG Impact | 10 | Good | Explicit SDG 1/2/3/10 mapping in README and presentation slide 7. |
| Presentation | 5 | Strong | Interactive `presentation.html` deck. |
| GitHub & Documentation | 5 | Pending repo push | README is ready; **must publish repo** (see Section A, item 5). |

## D. Gaps Worth Closing If You Have Time Left

These are not required to submit, but they are the most likely places judges
will deduct points relative to teams with genuine ML components:

1. **"AI/ML Solution Quality"**: the spec's suggested techniques list includes
   on-device ML, real NLP for survey analysis, and learned anomaly detection.
   This project's intelligence layer is currently statistical (DP, k-anonymity,
   a linear fairness formula), not a trained model. Quick wins if time permits:
   - Swap the linear `allocate_resources()` formula for a small
     `scikit-learn` regressor trained on the synthetic vulnerability scores
     to *predict* need, then apply the same fairness/DP layers on top.
   - Replace the browser TTS-based "multilingual consent" with an actual
     translated-text NLP pass (even a simple keyword classifier on
     free-text survey responses) to legitimately claim the NLP bonus item.
2. **Early-warning system**: currently a manually-triggered visual spike
   (`btn-trigger-outbreak` in `app.js`). For the bonus points on p.8, a real
   (even simple) time-series anomaly check — e.g. a rolling z-score on the
   `chronic_disease_present` rate — would turn this from a demo into an
   actual detector.
3. **Linkage-attack simulator**: it computes real singleton groups from the
   dataset but the displayed risk % comes from a separate tuned formula, not
   directly from that count. Fine for a demo, but be ready to explain this
   distinction if a judge asks "is this attacking real data?"

## E. Final Packaging Steps

1. [ ] Run `python scripts/synthetic_gen.py` then `python scripts/privacy_allocation.py` once more locally to confirm the console output matches the numbers in `do_no_harm_assessment.pdf`.
2. [ ] Push this folder to a **public** GitHub repo (commands in `README.md`).
3. [ ] Open `index.html` and `presentation.html` in a browser one last time to confirm nothing broke.
4. [ ] Paste the GitHub URL, and attach `do_no_harm_assessment.pdf`, into the official hackathon submission form.
5. [ ] (Optional, Section D) If time allows, add one small real ML/NLP component to strengthen the "AI Solution Quality" score.
