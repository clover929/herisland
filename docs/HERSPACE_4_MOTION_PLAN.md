# HERSPACE ISLAND 4.0 — Phase A Audit and Motion Plan

Audit date: 2026-11-10 (Asia/Shanghai). This document records Phase A only. No application code, routes, data, AI settings, or visual assets were changed for 4.0. Existing uncommitted work was preserved.

## Phase A: current product baseline

### Repository protection

- Branch: `main`; the only recent commit is `8c1dea5 Initial HerSpace prototype`.
- The working tree was already extensively modified before this task. The modifications include community UI/state, routes, women data and review batches, Sunny/Ollama, island art and components, footer assets, tests, and prior audit documents. They are user work and must remain untouched unless a later phase makes a narrowly scoped, approved change.
- No reset, clean, commit, or deployment was run.

### Runtime and route structure

- Existing application: Next.js 16.4.5, React 19.3.1, TypeScript 6.0.3; single repository, no GSAP dependency.
- The main community surfaces are served through `src/app/[[...slug]]/page.tsx` and `CommunityApp`; AI and women routes also have dedicated app entries. Existing route families include `/`, `/discussions`, `/discussions/[id]`, `/create`, `/communities`, `/communities/[id]`, `/profile`, `/login`, `/register`, `/stories/[id]`, `/women`, `/women/[slug]`, `/ai`, and `/api/ai/chat`.
- Homepage is one route (`/`) with vertically ordered content, not three separate routes. Header/navigation is rendered by `CommunityApp`; the global Sunny panel and footer are rendered by `src/app/layout.tsx`.

### Homepage section mapping (preserve business semantics)

| Requested chapter | Existing DOM/component | Current content and behavior | Planned visual-only mapping |
| --- | --- | --- | --- |
| Section 01 — The Living Island | `IslandHome` in `src/features/island/island-home.tsx` | Island illustration, six route hotspots, pan/zoom/reset, keyboard controls, six stable NPCs per visit, daily host marker/card, Sunny sun, fallback navigation | Keep component and links. Add a surrounding ocean stage and separately layered ambient decoration; do not animate the whole map as a proxy for leaf/person motion. |
| Section 02 — Her Stories & Let's Talk | Home-only `.hi-legacy-home` in `src/components/community-app.tsx`, followed by the home discussion `.columns` section | Four fictional story cards route to `/stories/1..4`; “Let's Talk” previews/filter controls, four local discussion cards, real links to discussion, create and communities | Add chapter wrappers/hooks around these existing blocks without moving or replacing their data or controls. Existing stories are explicitly fictional; do not merge them with real-women records. |
| Section 03 — Hall of Heroines | `FeaturedWomen` from `src/components/women-cards.tsx`, rendered after `IslandHome` in the catch-all page | Published and featured records link to `/women` and `/women/[slug]`; current public pool controls display | Treat this as the requested chapter. There is no existing “Hall of Heroines” label, separate route, or dedicated background asset. Preserve current records, review gates, and links. |

The actual visual DOM order is island + host card + six-region navigation, then Her Stories, then Let's Talk/discussion preview, then FeaturedWomen. Today's host and region navigation currently follow the map inside `IslandHome`; they are not adjacent desktop glass tiles. A design pass may restyle them but must not remove or relocate their semantics. The rest of the site has ordinary reading and form layouts and should not inherit the home ocean animation.

### Assets, data, AI, and existing behavior

- Active map is `public/island/editorial-v1.png` (a single raster illustration, 1582×994), selected in `IslandHome`; `public/island/map.svg` and `map-v1-backup.svg` remain present. There are no independently addressable tree, flag, bird, or in-map character layers. Existing clouds and beacon are CSS/DOM overlays; the island image itself is static.
- `public/art/water-lines.svg`, `water-lines-mobile.svg`, and lakeside etching files belong to the optional footer illustration. They are not an existing full-viewport ocean or an island water animation.
- `src/features/women/candidates.json` has 102 records: 10 published, 92 verified but awaiting editorial review. Public UI/AI/NPC/host access remains gated through `src/features/women/catalog.ts`; source and portrait/license metadata must not be bypassed.
- Sunny uses the existing server endpoint `src/app/api/ai/chat/route.ts`, service and Ollama adapter under `src/features/ai/`. Local `/api/tags` check returned `qwen3:4b`. No AI config or credentials were changed/read into this plan. Prior reports document real-model reliability issues; an E2E baseline that uses real Ollama is reported separately from Mock UI tests.
- Existing island reduced-motion CSS disables island animation/transition. The global theme is `src/app/herisland-theme.css`; it has a small set of theme variables and page styles, not yet a complete token catalog.
- Existing project has four local footer art assets; no new dependency is present for scroll animation or glass refraction.

### Phase A verification baseline

| Check | Result |
| --- | --- |
| `npm run lint` | Pass, 0 errors; one pre-existing `@next/next/no-img-element` warning in `src/features/island/island-home.tsx`. |
| `npm run typecheck` | Pass. |
| `npm test` | Pass: 20 files, 113 tests. Existing Vite native config warning remains. |
| `npm run build` | Pass on Next.js 16.4.5. |
| Playwright | Sandbox run could not start Chromium (macOS Mach-port permission); approved out-of-sandbox rerun completed: 29 passed, 2 failed, 1 did not run (3m54s). All non-model tests passed, including real community flows, women search/details, island/NPC/map controls, reduced motion, responsive layouts and explicitly Mock AI flows. The real-model audit failed: Companion and Write each timed out waiting 100s; Explore returned HTTP 200 with citations. The serial recovery flow also timed out waiting for its second real AI message; its mobile case did not run after the desktop failure. These failures match the previously documented real qwen3:4b instability and are not Mock failures. |
| Reference directory | The requested `~/Documents/codex/HerIsand/reference/` is not present/readable in this environment. The repo's prior `docs/design/HERISLAND_ILLUSTRATION_V1.md` records an earlier image review and explicitly documents original-asset constraints. No reference artwork was copied or reused in this audit. |

## Proposed 4.0 visual and motion architecture

This is a staged implementation proposal, not code already implemented.

1. **Design tokens and reusable interaction primitives:** extend the existing global theme with named color, type, spacing, radius, shadow, glass, motion, focus and z-index variables. Build reusable glass/spotlight and tilt primitives once; use pointer CSS variables with animation-frame scheduling and disable pointer-follow behavior for touch and reduced motion. Keep text/content above decorative refraction layers.
2. **Home chapter wrappers:** give the three existing homepage content blocks stable IDs/refs while retaining their current React ownership, order, state, data and routes.
3. **Animated ocean:** make a dedicated, low-saturation outer ocean layer, separate from the saturated island art. Build at least two seamless, low-frequency vector wave paths/layers with transform-only motion. Do not reuse footer water lines as a full scene without evaluating scale and loop seams. Pause when offscreen and disable for reduced motion.
4. **Island ambience:** because the active map is a flat PNG, no tree/flag/person animation can be claimed from that bitmap. Use only separate authored transparent overlays (for example, wind/cloud/bird details or localized light on existing CSS beacon/sun), positioned outside hotspot and NPC hit targets. Detailed in-map movement requires a commissioned/authored aligned layer asset; do not fake it by moving or distorting the whole island.
5. **Scroll narrative:** introduce a single lifecycle-managed ScrollTrigger timeline only if the installed Next.js-compatible GSAP path is confirmed in the relevant local Next docs and the bundle/accessibility cost is acceptable. Use real section progress (scrub) for ocean opacity/background position/scale/blur. Keep native document scrolling, anchors, history and touch behavior. If GSAP is not justified, document a browser-supported equivalent only after verifying that it provides true continuous scroll progress, not observer-triggered entrance transitions.
6. **Chapter 03 art:** current PNG is 1582×994. A close-up museum zoom would enlarge and soften it; avoid that. Before section 03 zoom, create an original high-resolution, aligned museum crop/layer in the same visual language or transition to a separately composed background with comparable source resolution.
7. **Glass/refraction:** apply `backdrop-filter: blur(28px)` only to the glass surface; apply CSS mask/highlight and any low-amplitude SVG displacement only to an isolated pseudo-element/highlight. Verify support and frame cost in Chromium/WebKit; keep readable background fallback without blurring the content layer.
8. **Home card motion:** one `SpotlightCard` behavior shared by host, six region cards and Section 03. `TiltCard` is limited to Stories; Let's Talk uses small scale/brightness feedback. Disable cursor tilt and loop decoration under reduced motion; never gate interaction on hover.
9. **Lifecycle/performance:** initialize and tear down ScrollTriggers and media/visibility observers with React effects; no render-state updates on pointermove; avoid large-area animated filters; pause nonessential loops offscreen; preserve route links, dialog focus, drag/zoom and reduced-motion behavior.

### Dependency decision

- Current project has no GSAP. Do not install a dependency during Phase A.
- GSAP ScrollTrigger is the leading candidate because this brief requires continuous scroll-scrubbed progress across multiple chapters. Phase B must first read the installed Next.js animation/client-component guidance, confirm package compatibility and ESM behavior, then decide whether to add GSAP/ScrollTrigger. The dependency introduces client bundle weight and lifecycle cleanup obligations; measure the production bundle impact before accepting it.
- Prefer CSS/SVG/WAAPI for looping environmental layers and pointer effects. Avoid adding a second scroll controller or wheel hijacking.

## Risks and safeguards

- **Static art vs animated claims:** current raster cannot provide true internal tree/people/flag movement. Use separately authored layers; clearly label any remaining static detail.
- **Museum zoom quality:** current 1582px image may blur when enlarged. Create original close-up art before zooming; do not upscale and call it high resolution.
- **Scroll performance:** three chapter-sized backgrounds, blur, and SVG filters can cause repaint pressure. Keep background and content in separate layers; profile at 1440×900, 1024×768, 390×844 and 320×700.
- **Glass legibility:** alpha and blur can reduce text contrast as scenes change. Measure foreground contrast and retain a readable fallback.
- **Hydration and route state:** scroll progress, pointer position and browser preference are client-only. Initialize them after mount and keep server markup deterministic.
- **Feature preservation:** cards must remain their current anchors/buttons; no decorative layer may intercept hits. Preserve `IslandHome` gesture rules and all forum/women/AI state flows.
- **AI/privacy:** no external model or network service is proposed. Keep Ollama server-only and all current data boundaries unchanged.

## Acceptance checklist for later phases

- [ ] Three continuous chapters mapped to current DOM, one `/` route, no content/data loss.
- [ ] Theme tokens and shared glass/spotlight/tilt primitives documented and tested.
- [ ] Outer ocean is a continuous multi-layer animation, visibly lower-saturation than the island, no seams; pauses offscreen and under reduced motion.
- [ ] Any claimed island ambient movement targets actual independent layers and does not alter map hit testing.
- [ ] Host and six feature cards retain routes, support keyboard focus, glass fallback, spotlight and touch behavior.
- [ ] Real scrub progress drives Section 01→02 and 02→03 scene transitions; no wheel hijack, snap requirement, flashing or blurred foreground content.
- [ ] Stories remain fictional and unchanged; tilt max 10deg with 800px perspective and reset; Let's Talk interactions remain live.
- [ ] Hall of Heroines continues to show only the existing published/featured records and working women detail links.
- [ ] 102-record integrity, 10 public / 92 awaiting review; no source/license/status changes.
- [ ] Existing map pan/zoom/reset, six regions, NPC, host, Sunny and community features regressions pass.
- [ ] `prefers-reduced-motion`, keyboard, touch and 320px layout verified.
- [ ] Lint, typecheck, unit tests, E2E, build; identify Mock versus real Ollama results.
- [ ] Check `git diff` after each authorized phase; do not commit or deploy.

## Stop point

Phase A was the initial stop point. The user later explicitly authorized continuation with Phase B while asking that the Ollama runtime and configuration remain unchanged.

## Phase B progress (2026-11-10)

- Added named CSS tokens for color, typography, spacing, radius, shadow, glass, motion, focus, and z-index in `src/app/herisland-theme.css`. Existing theme selectors and values remain in place for compatibility; this phase does not restyle or restructure page content.
- Added reusable `GlassCard`, `SpotlightCard`, and `TiltCard` client components in `src/components/motion/interaction-primitives.tsx`, with pointer math isolated in `pointer-math.ts` and frame-scheduled CSS-variable updates. Components are foundational and are not yet applied to homepage cards.
- Added a low-amplitude SVG displacement filter used only on the glass edge highlight; text and interactive contents are not filtered. Browser rendering still requires the visual verification in Phase G.
- Added focus-within treatment, a 28px glass blur, a readable no-backdrop-filter fallback, and touch/reduced-motion CSS behavior.
- No new dependency was added. Per the local Next.js 16 docs, interactive pointer handling lives behind a small Client Component boundary; global tokens and primitive CSS are loaded from the existing root layout.
- Added two unit checks for pointer normalization and bounded tilt math.
- Not in scope yet: ocean, island ambience, scroll chapters, glass-card adoption, stories tilt adoption, and site-wide page restyling.
