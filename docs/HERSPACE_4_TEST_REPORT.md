# HerSpace Island 4.0 — Phase B Test Report

Date: 2026-11-10 (Asia/Shanghai)

| Check | Result | Notes |
| --- | --- | --- |
| ESLint | Pass | 0 errors; one pre-existing `no-img-element` warning in `src/features/island/island-home.tsx`. |
| TypeScript | Pass | `npm run typecheck`. |
| Unit tests | Pass | `npm test`: 22 files, 119/119 tests. New checks cover clamped pointer coordinates and ±10° tilt math. |
| Production build | Pass | `npm run build`; routes generated successfully. |
| Browser E2E (non-model) | Pass | 29/29 selected tests after running Chromium outside the sandbox. Includes live community, women, island, responsive and reduced-motion flows; AI routes in this selection used explicitly mocked responses. |
| Real Ollama | Not run | Intentionally excluded from this phase; neither model nor connection settings were touched. |
| Glass/refraction visual QA | Not yet verified | Primitives are not integrated into the live homepage. SVG edge-filter support/performance must be checked when mounted in later phases. |

## Browser environment note

The first in-sandbox E2E attempt failed before test bodies because Chromium exited at `bootstrap_check_in ... Permission denied (1100)`. The selected suite was rerun outside the sandbox with approval and passed. This is an environment launch restriction, not an application assertion failure.

## Scope note

This is a Phase B foundation report, not full HerSpace 4.0 acceptance. It does not certify scroll timelines, animated ocean, live card spotlight behavior, full-site restyling, or real Ollama reliability.
