# HerIsland collection wall illustrations

74 independent illustrations generated with the built-in ImageGen tool on 2026-11-10, using the existing `public/island/editorial-v1.png` as the sole visual reference. Each item was generated separately with transparent background; no downloaded third-party illustration pack, emoji or icon substitution was used.

Production assets: `public/pegboard/items/*.webp`. High-resolution generated originals are preserved in `artifacts/pegboard-originals/`.

Packaging trims transparent padding, resizes to at most 512×768, preserves alpha, and calculates top-silhouette attachment anchors. The source SHA-256 hashes, dimensions and alpha checks are in `asset-report.json`. Regenerate packaging with `python3 scripts/prepare-pegboard-assets.py`.

`asset-manifest.ts` marks only packaged assets as ready. Layout version 2 includes an asset revision, allowing safe relocation to legal holes after footprint changes. Normal interactions preserve the existing 5-item limit, independent collision bounds and local-only persistence. Mona Lisa is a generated miniature interpretation of the public-domain painting. Character collectibles use original non-franchise designs.
