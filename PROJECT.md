# Arlan Vault — shared project context

This file is the canonical handoff for both Claude and Codex. Work in this folder and update the log below after material changes. Do not create a parallel workspace or a separate copy of the vault unless Julio asks for one.

## What this project is

A personal vault of small design-engineering experiments, reconstructed from the structure and visual language of `arlan.me/vault` and now being replaced with Julio's own work. The live app is a single Vite + React + TypeScript + Tailwind v4 project.

## Architecture

- `src/App.tsx` owns the feed order and route selection.
- `src/vault-config.ts` is the shared source of truth for feed-visible routes, titles, dates, categories, and previous/next order.
- `src/demos/` contains the interactive previews used by feed cards and detail pages.
- `src/pages/` contains detail pages and the shared `detail-kit.tsx` primitives.
- `public/vault/` contains project-local media.
- `scripts/`, `capture*/`, `diff*/`, `artifacts/`, `REPORT.md`, and `design-qa.md` are reconstruction and visual-QA evidence, not runtime source.
- The app intentionally uses a tiny History API router instead of a routing dependency.

## Design conventions

- Keep changes surgical and preserve the narrow 720 px editorial shell.
- A feed card is a bordered 16:9 preview plus a title/category caption. Dates remain available in detail-page metadata but do not appear in feed captions.
- Prefer direct manipulation inside previews: the visible specimen should trigger its own animation. Avoid redundant helper controls labelled Animate, Toggle, Clear, or Reset when the component already contains a meaningful interactive surface.
- Start sequential or one-shot thumbnail animations when their card enters the viewport, cancel timers while offscreen, and replay on re-entry. Expanded heroes and implementations may begin immediately; always preserve reduced-motion behavior.
- Keep a card's thumbnail and expanded hero/implementation visually synchronized unless Julio explicitly scopes a change to one view.
- A detail page follows: implementation frame, then the controls panel in a shared 24 px group (heading "Description", reset/replay chips in its header), short explanation, code/copy prompt, reference, credits. No breadcrumbs, no "Implementation" heading.
- Feed captions expose each experiment's category. Detail pages expose cyclic previous/next navigation and a close button — three small bordered chips in the header.
- Avoid new dependencies when the interaction can be expressed with React, DOM, and CSS already in the project.
- Verify desktop, 390 px, and 320 px layouts, keyboard controls, console errors, and the production build.

## Current custom routes

- `/vault/reactive-dither`
- `/vault/liquid-connector`
- `/vault/shadcn-attachment`
- `/vault/shadcn-calendar`
- `/vault/shadcn-card`
- `/vault/shadcn-carousel`
- `/vault/shadcn-chart`
- `/vault/shadcn-breadcrumb`
- `/vault/shadcn-command`
- `/vault/skill-design-eng`
- `/vault/skill-apple-design`
- `/vault/card-resize`
- `/vault/number-pop-in`
- `/vault/notification-badge`
- `/vault/text-states-swap`
- `/vault/menu-dropdown`
- `/vault/icon-swap`
- `/vault/error-state-shake`
- `/vault/skeleton-loader-reveal`
- `/vault/tabs-sliding`
- `/vault/shimmer-text`
- `/vault/tooltip-open-close`
- `/vault/accordion`
- `/vault/thinking-reasoning`
- `/vault/ai-web-search`
- `/vault/ai-streaming-text`
- `/vault/ai-inline-citations`
- `/vault/ai-task-list`
- `/vault/border-beam`
- `/vault/chief-keef-index`
- `/vault/micro-buttons`
- `/vault/better-colors`
- `/vault/better-typography`
- `/vault/materials`
- `/vault/bottom-sheet`
- `/vault/fluid-springs`
- `/vault/meeting-overlay`

## Run and verify

The colon in the parent folder path breaks the usual npm binary lookup. Use the binaries directly:

```bash
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build
```

## Update log

### 2026-07-20 — Batch 13: Fluid Cards reverted (toggle out), Scroll Gallery covers swapped to the owner's list (Kimi)

- Fluid Cards: batches 11–12 for this card were reverted at the owner's request — the spring toggle is gone everywhere (`FluidSpringToggle.*` deleted), the detail page is back to the single draggable-card stage + controls with the original prose, and the feed thumbnail renders `FluidSpringDemo` (the blue-dot fluid card) again. One engine, no divergence; the pinned feed order from batch 11 is untouched.
- Scroll Gallery: the eight placeholder covers were replaced with the owner's nine-issue list in exact order — Aug 29 2022 "No Photos, Please!" (Anita Kunz), Jun 6 2022 "Uvalde, May 24, 2022" (Eric Drooker), Aug 9 2021 "Summer Treat" (Mark Ulriksen), May 23 2022 "Making Mischief" (Ana Juan), Jul 3 2000 "Here's Looking at You" (Anita Kunz), Dec 5 2016 "Rat Race" (Peter de Sève), Jul 22 2024 "The Face of Justice" (Anita Kunz), May 23 2022 again (the list includes it twice — kept as a second record sharing the artwork), Oct 24 2011 "Fighting Back" (Barry Blitt). Covers pulled from each issue page's og:image master (verified adjacent to the cover credit in page JSON — provably the front covers), processed to the existing 800x1086 JPEG pipeline; default active cover is now Here's Looking at You.
- QA: feed-card-design 23/23, detail-order 167/167, direct-card-actions pass, reactive-dither 21/21; capture script smoke-checks no toggle remains, all cover assets 200, and the 9-cover order. tsc + build clean. Evidence in `artifacts/design-qa/batch13-2026-07-20/`; full entry in `design-qa.md`.

### 2026-07-20 — Batch 12: spring toggle joins the Fluid Cards detail page — one engine for feed + detail (Kimi)

- Batch-11 fix per user feedback ("thumbnail showing the wrong thing"): the spring toggle is now the lead specimen on /vault/fluid-springs. `FluidSpringToggle.tsx/.css` replaces `FluidToggleThumb.*` — same geometry, double-bounce motion, and grayscale styling; `mode="idle"` keeps the feed's auto-flip behavior byte-identical, `mode="button"` makes the detail specimen interactive (click/keyboard, aria-pressed, reduced-motion instant flip). Draggable cards + sliders untouched below; toggle stays out of the ControlsSection; hero prose now mentions the toggle. Superseded batch-11 divergence notes removed (the Design Engineering fintech thumb remains the only documented feed/detail exception).
- QA: feed-card-design 23/23, detail-order 167/167, direct-card-actions pass; ad-hoc Playwright check for the new interaction (flip, settle at 48px, keyboard, reduced-motion instant); tsc + build clean. Evidence in `artifacts/design-qa/batch12-2026-07-20/`; full entry in `design-qa.md`.

### 2026-07-20 — Batch 11: fluid toggle thumb, fintech DE thumb, filled bell, pinned feed order, Gradient Button (Kimi)

- Fluid Cards feed thumbnail is now a transitions.dev-style spring toggle (`FluidToggleThumb.tsx`, thumbnail-only — detail keeps the draggable springs; documented exception): stadium thumb, 350 ms cubic-bezier(0.34,1.35,0.64,1), 55%/80% double-bounce (~11% overshoot), ~3.3x reference geometry, grayscale on-state, 2600 ms idle loop behind a 35% visibility gate with instant settle offscreen; reduced motion rests in the settled ON end state.
- Design Engineering feed thumbnail is now a static fintech composition from the Pinterest banking-UI reference (gray header card + overlapping white card, segmented pill rows, fee/total rows; all grayscale; compact branch only — detail specimen unchanged; second documented exception). `verify-emil-skills.mjs` updated to assert the static composition.
- Notification badge bell is filled everywhere (one engine, motion untouched). Feed order pinned: first nine = Liquid Dither, Number pop-in, Don't Miss Meetings, Thinking text, Tabs sliding, Streaming Text, Web Search, Fluid Cards, Scroll Gallery — picks in `FEED_CARDS` only, catalogs/VAULT_ITEMS untouched, total still 36; new QA assertion.
- /vault/border-beam renamed Gradient Button (vault-config title drives the detail h1; caption + aria-label updated; zero Gemini refs). Border-beam defaults: strength 8%, color stone; light-mode treatment kept; hero prose updated.
- QA: feed-card-design 23/23, liquid-connector 38/38, detail-order 167/167, reactive-dither 21/21, emil-skills / direct-card-actions / aicss / design-engineering / thinking-reasoning all pass; tsc + build clean. Evidence in `artifacts/design-qa/batch11-2026-07-20/`; full entry in `design-qa.md`.

### 2026-07-19 — Batch 10: LC feed size + white stage, tab-bar↔card alignment, Card demo unclipped (Kimi)

- Four annotated items, measurement-driven (`scripts/probe-batch10.mjs`). LC feed thumbnail reduced to the annotated ~34% of stage width (`min(520px, max(34%, 180px))`, centered; the plain 520 px cap was a measured no-op because the compact stage letterboxes height-bound — interpretation documented). Tab bar realigned: batch 9's pill nudge had moved it to 372; wrapper `-ml-2`→`-ml-1` puts it at 376.0 = the first card's outer left edge exactly; QA now compares against the card, not the headline.
- LC stage background #f2f2f2 → `var(--bg-page)` (#fcfcfc) for BOTH feed and detail (one rule); shadow recalibrated 0.05/0.06 → 0.08/0.11 (grays only, no hairlines) so the #fdfdfd surfaces still separate on white.
- Card demo (shadcn login) feed clipping fixed: the auto-sized grid track top-anchored the 384×368 specimen (same drift bug calendar already had), so it overflowed the stage bottom by 42.5 px at 1440 / 41 px at 390. Absolute center anchor + card-specific scale ladder (0.5/0.4/0.22/0.16); detail page untouched. In passing: the primary "Login" button rendered black-on-black (`.sh-demo button { color: inherit }` beat `.sx-button-default`); variant rule now scoped to `.sh-demo` (pre-existing bug).
- QA: liquid-connector 38/38 (+4), feed-card-design 22/22 (tab assertion switched to card edge, +3 login-fit checks at 1440/390/320), detail-order 167/167, reactive-dither 21/21, direct-card-actions pass; tsc and production build clean. Evidence in `artifacts/design-qa/batch10-2026-07-19/`; full entry in `design-qa.md`.

### 2026-07-19 — Batch 9: spacing rhythm, tab-bar nudge, LC native-width cap, Codex sample, SliderChip ports (Kimi)

- Seven annotated-screenshot items. Detail title→frame gap 40→36 px (`detail-kit` `gap-9`); the "Description" controls header lost its hairline divider; the feed tab bar shifted 4 px left so the active pill's content edge lands on the column (the bar border already aligned — the inset was pill border + padding).
- Liquid Connector detail playground capped at its native 520 px viewBox width, centered in the full-width gray panel; the feed thumbnail is untouched. Corner radii tuned engine-wide (outputRadius 34→24, inputRadius 31→22) — the footer claim is now "vendored — corner radii tuned 24/22", no longer byte-identical.
- Sample content swapped Notion→Codex with an ORIGINAL vector-redrawn mark (8-lobed scalloped ring + terminal `>_`), verified against the official Codex icon from OpenAI's ChatGPT.app bundle; NOTICE, credits, and prose updated; no OpenAI assets copied and no `Notion` references remain in `src/`.
- `lc-`/`rd-`/`bb-` custom range + switch controls replaced by the shared `SliderChip`/`SwitchChip` from `detail-kit`; behavior preserved (immediate gap scrub, exact resets, aria roles), per-key rounding, old control CSS deleted. QA: liquid-connector 34/34, detail-order 167/167, feed-card-design 19/19, reactive-dither 21/21, direct-card-actions pass; tsc and production build clean. Evidence in `artifacts/design-qa/batch9-2026-07-19/`; full entry in `design-qa.md`.

### 2026-07-19 — Liquid Connector reworked to upstream 1:1 (Kimi)

- Julio reviewed the port against the upstream demo video and called seven deltas; the rework keeps the vault lifecycle (35% visibility gate, reduced-motion settle, compact mode) and the detail structure, and aligns everything else with upstream:
  - **Broken feed thumbnail fixed — two root causes.** (a) The batch-7 ambient idle loop (not an upstream behavior) let the thumbnail end up closed with a stuck focus ring. (b) The real bug, present since the initial port: `lc-` namespacing bumped specificity, so `.lc-demo button` (0,1,1) silently beat `.lc-send` (0,1,0) and `.lc-connect` — the send button rendered as a gray tab at the prompt's top-left (batch 7 misidentified it as "upstream's peel notch"; upstream has no rest-state notch) and the Connect pill lost its `#ccd9f2` border. Fixed by prefixing the three component rules with `.lc-demo` (0,2,0).
  - **Soft-shadow white surfaces, zero hairlines.** Stage background is now the upstream demo page's `#f2f2f2`; the fill path carries `drop-shadow(0 1px 2px rgb(20 23 28/.05)) drop-shadow(0 8px 20px rgb(20 23 28/.06))`, calibrated from the upstream panel-shadow recipe (upstream itself ships no surface shadow — Julio explicitly asked for shadows over hairlines); both hairline strokes removed; blue focus outline only under `:focus-within` (upstream behavior).
  - **Ambient loop deleted; interaction model matched.** Nothing moves on its own (verified against upstream `index.html`: only slider scrub, toggle button, and peel params drive the surface). The Rest gap slider now scrubs with `{ immediate: true }` — jumps, no spring, exactly like upstream's range input. Skip keeps upstream focus+close; Connect stays a documented deviation (closes the card so the button never feels dead; upstream only fires an event). Feed card keeps the `interactive` LinkCard.
  - **Default stays upstream's `open` + `gap=10`.** With hairlines gone and the shadow in, the two pills read as one merged unit — the video's default frame. (The batch-8 plan's gap −28 default was discarded after reading upstream's `index.html`.)
  - **Ground-truthed against the real thing:** ran the upstream demo (`/tmp/liquid-connector`) in Playwright and captured its default, settled −28, and hidden states — the port matches all three in layout. Notably, settled −28 is prompt-only upstream too; the video's fused waist exists only mid-scrub.
  - Credits already named both zanwei (MIT port) and Mikk Martin (motion reference) — wording verified in the detail page, prose, and NOTICE.
- `verify-liquid-connector.mjs` 28 → 31 checks: ambient-loop assertions replaced by their opposites (connector card visible by default at opacity 1, nothing re-opens on its own over 9 s, offscreen freeze, re-entry untouched), new stroke-removed/drop-shadow and immediate-scrub (no `data-animating`) assertions, deterministic settled captures (the switch click scrolls the page, so stage captures are element screenshots after `scrollTo(0,0)`).
- Captions/prose updated: feed summary and detail description no longer claim "no filters" (the surface carries a drop-shadow; the path math itself still uses no filters/masks/canvas/shaders); frame caption and build prompt describe the interaction-only model.
- Verification: `tsc -b` 0 errors; production build passes. Against a temporary `127.0.0.1:5173` server (killed, port confirmed free): liquid-connector 31/31, detail-order 139/139 (16 routes), feed-card-design 18/18, reactive-dither 21/21. Evidence: `artifacts/design-qa/liquid-connector-2026-07-19/` (feed-card, detail-top, detail-fused, detail-closed, detail-controls) eyeballed against the upstream ground-truth captures. Supersedes the idle-loop/specificity parts of the 2026-07-18 port-fidelity bullet.

### 2026-07-19 — Controls pulled under the frame, section renamed Description (Kimi)

- Julio scribbled two changes on the "Don't Miss Meetings" page, applied vault-wide: (1) the controls now sit directly under the implementation frame — each page's frame block + `ControlsSection` is wrapped in a nested `flex min-w-0 flex-col gap-6` (24 px, rules of four) inside the main `gap-14` column, which keeps the 56 px rhythm between all other sections; (2) the controls heading is renamed "Controls" → "Description" in `detail-kit.tsx`'s `ControlsSection` (header comment updated; action chips stay in the header row).
- Wrapped at 12 render spots: MeetingOverlayDetail, ReactiveDitherDetail, BorderBeamDetail, LiquidConnectorDetail, FluidSpringsDetail, MaterialsDetail, SheetDetail, MicroButtonsDetail, OpticalTypeDetail, `EmilSkillImplementation` (covers the standalone Emil page and the Design Engineering umbrella), and both SkillDetails components (Better Colors, Better Typography). DesignEngineeringDetail has no `ControlsSection` of its own — it inherits the wrap through `EmilSkillImplementation`. Inner content kept byte-identical (wrapper inserted without re-indenting, per the brief).
- `verify-detail-order.mjs` updated: heading assertions "Controls" → "Description" (order marker, control-free absence check, chips-in-header lookup), plus a new per-route assertion that the frame block and the controls section are the only two children of a 24 px-gap wrapper (12 controls routes, +12 checks → 139 total). The parent-container gap is intentionally not asserted — the umbrella page nests the wrapper inside its own section layout, so that would be a fragile layout assertion.
- Verification: `tsc -b` 0 errors; production build passes. Against a temporary `127.0.0.1:5173` server (killed, port confirmed free): detail-order 139/139 (16 routes), feed-card-design 18/18, reactive-dither 21/21, emil-skills, design-engineering, liquid-connector 28/28 — all green. Evidence: `artifacts/design-qa/batch7-2026-07-19/meeting-overlay-top.png` (frame → 24 px → Description header with Remix/Replay → controls panel → 56 px → prose), eyeballed.

### 2026-07-18 — Nav rework and Liquid Connector card (Kimi)

- **Nav rework on every DetailShell page.** Breadcrumbs (`nav[aria-label="Breadcrumb"]` + the `categoryHref` import) deleted from `detail-kit.tsx`; the header nav is now exactly three bordered 8 px-radius chips: separate Previous and Next links inside a borderless `nav[aria-label="Browse experiments"]` plus a matching bordered Close chip (previously the close was the only bordered control and prev/next were plain glyphs). The `Implementation` h2 + hairline is gone everywhere: pages with controls moved their action chips (Reset, Remix/Replay, Flick, Open/Dismiss, Pulse, Play all, Breathe, Search/Shuffle) into the `ControlsSection` header via a new `actions` prop (replacing the old `note` prop), and control-free pages (Transition, AiCss, Scrollgallery, Shadcn, Design Engineering principles) keep their chips in a bare right-aligned row on the frame. `EmilSkillImplementation` moved the variant description inside the Controls panel. `categoryHref` stays exported for the App.tsx feed tabs.
- **Liquid Connector card — `/vault/liquid-connector`, 36th feed card, category Motion.** A React port of zanwei's MIT-licensed `liquid-connector-web-component` (github.com/zanwei/liquid-connector-web-component), itself an independent SVG path-math recreation of a Mikk Martin motion reference; the demo content is a Notion MCP connector card (Notion name/mark kept as the sample it shipped as — see `src/content/liquid-connector/NOTICE`). An output card peels off a prompt card with a liquid coupling seam: both cards and the gap are one SVG path recomputed per frame (no filters/masks/canvas), driven by a damped spring (1200/38) for scrubs and measured ~0.39 s keyframe transitions for full opens/closes, with strain, blur, and ±2 px smear clones on fast closes.
- **Port fidelity:** `src/demos/liquidPath.js` is the upstream path solver byte-identical (only the IIFE became an ES-module export; types via an adjacent `liquidPath.d.ts` adapted from upstream `index.d.ts`). `LiquidConnectorDemo.tsx` mirrors the upstream custom element's state machine as plain DOM + refs (no shadow DOM, no custom element, no CustomEvent API, no debug overlay, no liquid-frame event stream). Deliberate behavior deviations: Connect closes the card and submit clears the textarea (upstream only dispatches events); Skip keeps upstream behavior (focus prompt + close). Upstream colors kept 1:1 (`#fdfdfd/#191919/#1e55c7`, blue accents allowed per Materials-pill precedent). Vault lifecycle added: 35% visibility gate, idle peel/merge every 4 s standing down 5 s after interaction, reduced-motion settles instantly and disables the idle loop. Controls: Rest gap (−60…10), the four peel parameters (detach gap, transition, coupling radius, pull), and an open switch in the reference row style, plus a Reset chip in the Controls header.
- Registration: `vault-config.ts` item, App.tsx card (`interactive` LinkCard like border-beam — Skip/Connect work inside the thumbnail), FEED_CARDS entry after reactive-dither, route branch. LICENSE + NOTICE bundled under `src/content/liquid-connector/` and exposed as Code tabs alongside the demo TSX/CSS and the vendored path solver.
- Scripts: rewritten `verify-detail-order.mjs` (Implementation-heading/breadcrumb bans, prev/next chip geometry, bordered close, chips-in-Controls-header; materials marked `orphan` — it is a hidden page with no VAULT_ITEMS entry, so it renders no prev/next nav) + new `verify-liquid-connector.mjs` (28 checks: feed Skip action without navigation, idle re-open, offscreen freeze, re-entry resume, direct load, live controls incl. coupling re-solve at a shallow −5 px bridge, switch toggle, reset, send enable/clear, reduced-motion settle, 1440/390/320 fit). `verify-reactive-dither.mjs` pointer check now scrolls the canvas into view first (frame moved above controls). Feed-count assertions bumped 35→36 in `verify-feed-card-design.mjs` and `verify-direct-card-actions.mjs`. Real bug found by the new suite: the send button's disabled flag was set imperatively and got stomped back by React on every idle-loop re-render — it is now React state (`hasText`).
- Verification: `tsc -b` 0 errors; production build passes (pre-existing chunk-size advisory). All 8 suites green against a temporary `127.0.0.1:5173` server (killed, port confirmed free): detail-order 127/127 (16 routes), reactive-dither 21/21, emil-skills, design-engineering, aicss, direct-card-actions (36 captions), feed-card-design 18/18 (36/36 coverage), liquid-connector 28/28. Captures eyeballed in `artifacts/design-qa/liquid-connector-2026-07-18/` (feed card, page top with new nav chips, controls, closed state).

### 2026-07-18 — Reference-style sliders and expanded-page reorder (Kimi)

- Every `type="range"` control restyled to the reference panel look (copied to `artifacts/design-qa/slider-ref-2026-07-18/reference.jpg`): each row is one 44 px rounded rectangle on `#f7f7f7` with the filled portion rendered as a solid `#ebebeb` block anchored left, the label inside the fill, a thin 3×18 px `#a6a6a6` vertical handle at the fill edge, and the formatted value right-aligned in the unfilled area; five subtle 3 px tick dots per track. A real `<input type="range">` overlays every row (opacity 0) as the interaction, keyboard, and accessibility layer; fill/handle positions derive from `(v−min)/(max−min)` via a CSS custom property. Monochrome throughout — the reference's orange swatch was explicitly excluded.
- `ReactiveDitherDemo` gained a controlled split: exported `ReactiveDitherSettings`/`REACTIVE_DITHER_DEFAULTS`, optional `settings`/`onSettingsChange` props, a `chrome: 'full' | 'stage'` switch, and an exported `ReactiveDitherControlPanel` with the seven reference rows plus the invert control restyled as a classic light-gray switch row (`role="switch"`). Feed/compact rendering unchanged.
- `BorderBeamDemo` same split: `BorderBeamSettings`/`BORDER_BEAM_DEFAULTS`, `chrome` prop, exported `BorderBeamControlPanel` — Type and Color chip rows plus the Strength slider share the 44 px reference row shape; old `.bb-controls` grid/`.bb-strength-track` CSS replaced. Stage-only chrome drops the full-mode min-height via `.bb-stage-only`.
- Every `DetailShell` page reordered to: title/nav → Implementation frame (reset/replay chips stay on the frame) → Controls → description (+guides) → Code/copy → Credits/reference. The duplicate top hero preview was removed on ALL 15 page files — each rendered the same component as the implementation, so no hero was kept. New shared `ControlsSection` in `detail-kit.tsx` (h2 + note + bordered panel).
- Page-family handling: tray pages (Meeting Overlay, Fluid Springs, Sheet, Materials, Micro Buttons, Optical Type, Better Colors, Better Typography) detached their attached `-mt-5` control trays into standalone Controls sections; `EmilSkillImplementation` now renders Implementation + Controls, so the standalone Emil page and the Design Engineering umbrella share the structure (umbrella intro paragraphs moved below the playground, per-section summaries became captions); Transition/AiCss/Shadcn/Scrollgallery are hero-out simple reorders with no Controls section. Better Typography's guide moved below Implementation+Controls (was above). OpticalTypeDetail remains an unrouted orphan, updated for consistency anyway.
- Scripts: `verify-reactive-dither.mjs` updated for the new DOM (one engine canvas, `.rd-controls` ranges, switch role, full-canvas reduced-motion) + new fill-block width assertion (21 checks, was 20); `verify-aicss.mjs`/`verify-direct-card-actions.mjs`/`verify-emil-skills.mjs`/`verify-design-engineering.mjs` updated from hero+implementation pairs to the single shared implementation. New `scripts/verify-detail-order.mjs` walks 15 routes and asserts Implementation → Controls (when present) → description → Code (when present) → Credits document order plus no stray hero frame outside the Implementation section (49 checks). New `scripts/capture-batch5.mjs`; evidence in `artifacts/design-qa/batch5-2026-07-18/` (dither + border-beam panels at 1440/390/320, reordered page tops).
- Verification: `tsc -b` 0 errors; production build passes. `verify-feed-card-design.mjs` 18/18, `verify-reactive-dither.mjs` 21/21, `verify-aicss.mjs`, `verify-direct-card-actions.mjs`, `verify-emil-skills.mjs`, `verify-design-engineering.mjs`, `verify-detail-order.mjs` 49/49 all pass against a temporary `127.0.0.1:5173` dev server (stopped afterward, port confirmed free). Slider panels eyeballed against the reference at all three widths.

### 2026-07-18 — Two deletions, tooltip scale-up, accordion + calendar design-system passes, streaming-text thumbnail fix (Kimi)

- Deleted `success-check` (transitions catalog entry, `SuccessCheck` specimen + switch case, `.td-success*` CSS, direct-card-actions block) and `scribble-index` (vault-config entry, `ScribbleIndexCard`, route branch, `src/pages/ScribbleIndexDetail.tsx`, `src/demos/ScribbleIndexDemo.tsx`/`.css`). Feed now renders 35 cards: 12 transitions / 5 AI-CSS / 1 Emil / 7 shadcn / 10 standalone.
- Tooltip open/close specimen scaled ≈1.8×: trigger 38→68 px tall, font 11→18 px, padding 14→28 px, radius 11→20 px; tooltip copy 9→16 px, padding 6/9→12/16 px, radius 8→14 px, offset 9→16 px, arrow 7→12 px. Behavior and timing unchanged; fits 1440/390/320 px within the existing container-query scaling.
- Accordion restyled on vault tokens: inherited neueMontreal, `--text-primary/secondary/tertiary`, `--border-line`, `--bg-hover`, rules-of-four rhythm (52 px trigger, 40 px rows, 16/12 px padding), phosphor `Users`/`UserCircle` icons replacing the plain `User`, bold `CaretDown`, checked-row emphasis via `:has(input:checked)`. Grid-row mechanics, radio group, and keyboard support identical — visual only.
- shadcn Calendar restyled on vault tokens (neueMontreal instead of Geist for this specimen, text tokens, `--border-line`, quiet monochrome states: selected = `--text-primary` fill, today = `--bg-hover` + inset hairline, 32 px cells, 12 px padding/gaps, 13/11 px type; react-day-picker kept). Compact placement fixed: `.sx-native` is now absolutely centered with `translate: -50% -50%` plus a 0.3 scale step under 150 px container height — repairs the pre-existing grid-row drift that clipped the calendar at 390 px and left it blank at 320 px. Detail page uses the same component, so views stay synchronized.
- Streaming Text compact thumbnail now animates per vault convention: IntersectionObserver ≥35% visibility gate, timers cancelled and text reset offscreen, replay on re-entry, reduced-motion renders the fully streamed end state (same pattern as thinking-reasoning).
- Scripts: `verify-feed-card-design.mjs` coverage 37→35; `verify-direct-card-actions.mjs` 35 captions + success-check block removed + new tooltip min-size assertions (≥56 px trigger, ≥14 px copy — still 10 direct-manipulation transitions with tooltip added); `verify-aicss.mjs` gained a compact streaming-thumbnail advance assertion; new `scripts/capture-batch4.mjs` + `scripts/probe-batch4.mjs` for visual evidence and debugging.
- Verification: `tsc -b` 0 errors; production build passes. `verify-feed-card-design.mjs` 18/18 (35/35), `verify-reactive-dither.mjs` 20/20, `verify-aicss.mjs`, `verify-direct-card-actions.mjs`, `verify-emil-skills.mjs`, `verify-design-engineering.mjs`, `verify-thinking-reasoning-thumbnail.mjs` all pass against a temporary `127.0.0.1:5173` dev server (stopped afterward, port confirmed free). Captures eyeballed from `artifacts/design-qa/batch4-2026-07-18/`.

### 2026-07-18 — Ten cards deleted, four merged into Design Engineering umbrella, Gemini Button goes light (Kimi)

- Deleted ten feed cards with their routes, catalog entries, specimens, demo CSS, and detail plumbing: two Emil skills (`/vault/skill-improve-animations` "Motion Audit" and `/vault/skill-animation-opportunities` "Animation Opportunities", including the eight `audit-*`/`counter`/`disclosure`/`press-feedback`/`rejected-label` variants and the bundled `src/content/skills/emil/improve-animations/` + `find-animation-opportunities/` snapshots), the standalone Toast Notifications card (`/vault/sonner` — Julio's "those notifications" meant the sonner card; the `notification-badge` transition stays — including SonnerDetail/SonnerDemo files and `scripts/verify-sonner.mjs`), two shadcn cards (`/vault/shadcn-bubble`, `/vault/shadcn-button-group`), four transitions (`/vault/page-side-by-side`, `/vault/input-clear`, `/vault/texts-reveal`, `/vault/dropdown-menu-morph`), and the standalone World Cup Knockout card (`/vault/knockout-bracket`, including KnockoutBracketDetail/KnockoutBracket files, the `.kb-*` rules in `src/index.css`, and `scripts/verify-knockout.mjs`).
- Merged four cards into one umbrella "Design Engineering" at `/vault/skill-design-eng` (category Skills, sitting where the design-eng card sat): Emil's design-eng Taste and Animation Vocabulary (their definitions moved to `EMIL_SKILL_LIBRARY_DEFINITIONS` in `src/emilskills/catalog.ts`; their content snapshots stay), the 12 Principles of animation, and Better UI. New `src/pages/DesignEngineeringDetail.tsx` renders the design-eng specimen hero, a Taste / Animation Vocabulary / 12 Principles / Better UI chip row that switches sections without reload (Taste and Vocabulary reuse the new exported `EmilSkillImplementation` block from `EmilSkillDetail.tsx`), and credits emilkowalski/skills (MIT, pinned 6bf2443) plus raphaelsalaja/skill and jakubkrehel/skills. Deleted `src/pages/AnimationPrinciplesDetail.tsx` and the `BetterUiDetail` export with its exclusive helpers from `src/pages/SkillDetails.tsx` (colors/typography untouched; the demo components stay). `/vault/skill-apple-design` keeps its standalone EmilSkillDetail page.
- Gemini Button (`/vault/border-beam`) restyled light: white field with dark text on the vault's page tokens, the beam and conic mask fully grayscale in four new palettes (Ink, Graphite — default, Stone, Mist; Colorful/Mono/Ocean/Sunset removed), grayscale focus ring and send control, brightness-pulse keyframes replacing the hue-rotate shimmer. Interaction, layout, and strength/type controls are unchanged; detail-page prose, aria label, and build prompt were rewritten to match.
- Scripts: `verify-feed-card-design.mjs` asserts 37/37 coverage; `verify-emil-skills.mjs` was rewritten around the single standalone Emil page (Fluid Interfaces) plus the umbrella thumbnail (its offscreen-autoplay test now parks at the footer first, since the short skills feed can mount the card in view); `verify-direct-card-actions.mjs` expects 37 captions and 10 direct-manipulation transitions; new `scripts/verify-design-engineering.mjs` covers the umbrella (h1, four chips, in-place switching, variant selectors, Better UI interaction, 1440/390/320 px fit). Deleted `verify-sonner.mjs`, `verify-knockout.mjs`, `capture-emil-skills-audit.mjs` (three of its four capture targets gone), and `verify-skills.mjs` (stale since the 07-17 RichCaption rollout: asserted an 8-card skills feed and in-caption dates — unfixable trim, removed instead).
- Kept `src/content/skills/better-ui/` and `src/content/skills/12-principles-of-animation/` on disk even though no page imports them after the merge — the brief only scheduled the two deleted Emil snapshots for content deletion. Judgment call; easy to prune later.
- Catalogs now hold 13 transitions, 5 AI-CSS, 1 standalone Emil skill, 7 shadcn — 37 feed cards total (13 transitions / 5 AI-CSS / 1 Emil / 7 shadcn / 11 standalone).
- Verification: TypeScript and the production build pass. `verify-feed-card-design.mjs` 18/18, `verify-reactive-dither.mjs` 20/20, `verify-aicss.mjs`, `verify-emil-skills.mjs`, `verify-design-engineering.mjs`, and `verify-direct-card-actions.mjs` all pass against a temporary `127.0.0.1:5173` dev server (stopped afterward, port confirmed free). The Gemini Button restyle was additionally eyeballed via timed Playwright screenshots (line/large types at beam-peak frames).

### 2026-07-18 — Six more cards deleted, three renames (Kimi)

- Deleted six feed cards with their routes, catalog entries, specimens, demo CSS, and detail plumbing: the Panel reveal transition (`/vault/panel-reveal`), three AI-CSS cards (Code Block, Data Table, Comparison Table — their shared `.ac-table-scroll` styles and container-query scale rules went with them), Playwright CLI (`/vault/playwright-cli`, including demo/detail files and the bundled `src/content/skills/playwright-cli/` snapshot — same call as the batch-1 review-animations content deletion), and Interaction Sounds (`/vault/cuelume`, demo/detail files; the `cuelume` npm dependency stays installed).
- Renamed three cards (ids, paths, and component/file names unchanged): "Stop missing your meetings" → "Don't Miss Meetings" (feed caption and detail h1), "Texts reveal" → "Blurred Text Animation" (catalog title and specimen label), "Road Cup Knockout" → "World Cup Knockout" (catalog title and feed caption; the detail h1 "Knockout bracket" and its World Cup aria labels already matched).
- Catalogs now hold 17 transitions, 5 AI-CSS, 5 Emil skills, 9 shadcn — 50 feed cards total. `scripts/verify-feed-card-design.mjs` asserts the new headline and 50/50 coverage; `scripts/verify-aicss.mjs` (5 cards) and `scripts/verify-direct-card-actions.mjs` (12 direct-manipulation transitions) no longer reference the deleted routes; `scripts/verify-knockout.mjs`'s stale "Jul 12, 2026" caption-date assertion (untouched since the initial commit, predating the RichCaption rollout) now asserts the "World Cup Knockout" title.
- Verification: TypeScript and the production build pass. `verify-feed-card-design.mjs` 18/18, `verify-reactive-dither.mjs` 20/20, `verify-aicss.mjs`, `verify-direct-card-actions.mjs`, and `verify-knockout.mjs` 93/93 all pass against a temporary `127.0.0.1:5173` dev server (stopped afterward, port confirmed free).

### 2026-07-18 — Ten cards deleted, skeleton loader and shimmer text renamed (Kimi)

- Deleted ten feed cards with their routes, catalog entries, specimens, and detail plumbing: Gradient Spin (`/vault/gradient-spin`, including its demo/detail files and bundled license), Interface Craft Guidelines (`/vault/interface-guidelines`, including the demo, detail page, and `src/interface-guidelines.ts`), three transitions (Modal open/close, Avatar group hover, 3D tilt), four AI-CSS cards (Thinking State, File Diff, Image Generation, Text Response — Julio's "input generation" had no matching card, so Image Generation was removed as the only "generation" card in that family), and the Emil skill The Craft Bar (`/vault/skill-review-animations`, its four `review-*` variants, and the bundled `src/content/skills/emil/review-animations/` snapshot).
- Renamed two transition cards (ids, paths, and component/file names unchanged): "Skeleton loader and reveal" → "Loading frame and reveal" and "Shimmer text" → "Thinking text". The unrelated `shimmer` variant in the Emil animation-vocabulary skill is untouched.
- Catalogs now hold 18 transitions, 8 AI-CSS, 5 Emil skills, 9 shadcn — 56 feed cards total (the transitions catalog was 21, not the 22 older entries claimed). `scripts/verify-feed-card-design.mjs` now asserts 56/56 coverage; `scripts/verify-aicss.mjs`, `scripts/verify-emil-skills.mjs`, `scripts/verify-direct-card-actions.mjs`, and `scripts/capture-emil-skills-audit.mjs` no longer reference the deleted routes. Two pre-existing verify-emil-skills bugs surfaced and were fixed: the Reset/Replay role queries needed `exact: true` (the Motion Audit specimen buttons are labelled "Replay before/after example…"), and the reduced-motion assertion now accepts Chrome's `1e-05s` duration serialization, matching the verify-sonner convention.
- Verification: TypeScript and the production build pass. `scripts/verify-feed-card-design.mjs` 18/18, `scripts/verify-reactive-dither.mjs` 20/20, and the updated aicss/emil-skills/direct-card-actions suites all pass against a temporary `127.0.0.1:5173` dev server (stopped afterward, port confirmed free).

### 2026-07-18 — Liquid Dither Effect rename, calmer pill spring, new dither defaults (Kimi)

- Renamed the Reactive Dither card to "Liquid Dither Effect" everywhere user-facing: catalog title, feed caption, LinkCard label, detail h1, and preview/controls aria labels. The route `/vault/reactive-dither`, file names, and `ReactiveDither*` component names are unchanged.
- Category pill bounce reduced ~60% on Julio's request: spring damping retention 0.76 → 0.69 per frame (stiffness 0.11 unchanged). Step-response simulation: overshoot drops from 21.5% to 8.8% of travel; the velocity-driven squash/stretch calms down naturally with the lower peak velocity.
- Engine defaults updated per Julio: return stiffness 0.110 → 0.080, damping 0.850 → 0.770 (slower, softer return home); the detail page's reusable example snippet was synced to the same constants. All other defaults unchanged.
- `scripts/verify-reactive-dither.mjs` h1 assertion updated to the new title — 20/20 pass; `scripts/verify-feed-card-design.mjs` — 18/18 pass (pill still settles pixel-exact and travels mid-flight on click). TypeScript and the production build pass. Note for future QA runs: Vite 8 binds IPv6 localhost by default, so start the dev server with `--host 127.0.0.1` for the Playwright scripts.

### 2026-07-17 — Liquid-on-click fix and RichCaption feed-wide rollout (Kimi)

- Fixed the pill jumping instantly on click: the `CategoryFilter` ResizeObserver's initial delivery (fired on every selection change, right after `wake()`) snapped the pill before the spring's first frame. The observer now snaps only on real geometry changes (±0.5 px), so clicks travel with overshoot (probe-verified `209 → 277 peak → 230 settle`); spring retuned softer (0.11/0.76) for a more material feel.
- Rolled the approved RichCaption design out to all 66 feed cards: the four catalog families (transitions 22, AI-CSS 12, Emil skills 6, shadcn 9) reuse the `summary` fields their catalogs already had, and the 17 standalone cards got hand-written one-line summaries. Legacy `Caption` is no longer used anywhere.
- `scripts/verify-feed-card-design.mjs` gained a 66/66 coverage assertion and a liquid-on-click travel assertion; 18/18 pass. TypeScript and the production build pass. Evidence in `artifacts/design-qa/card-design-2026-07-17/`.

### 2026-07-17 — Liquid category pill and spacing revert pass (Kimi)

- Built Julio's liquid category tabs: the selection pill travels on an underdamped spring (soft overshoot) and stretches/squashes with velocity like a droplet; a lighter ghost pill eases behind hovered tabs and fades on leave. One rAF loop writes transforms/widths directly to the DOM (no React state per frame) and sleeps when settled; `prefers-reduced-motion` snaps instantly and disables the ghost. Replaces the 180 ms CSS-transition pill in `CategoryFilter`.
- Spacing after his review: reverted the rule-of-four caption normalization (back to his approved round-4 values — 6 px side/bottom padding, 10 px footer margin); title → tagline gap 4 → 2 px; tabs bar up 2 px (header → tabs 26 px) with tabs → results held at 32 px.
- `scripts/verify-feed-card-design.mjs` gained liquid-pill assertions (settle position within 1.5 px, ghost show/hide, reduced-motion snap); 16/16 pass. TypeScript and the production build pass. Evidence in `artifacts/design-qa/card-design-2026-07-17/`.

### 2026-07-17 — Category-click scroll fix and spacing pass (Kimi)

- Fixed Julio's reported bug where clicking Interactions (and sometimes All) scrolled the page into the feed (deterministic scrollY 851/5883). Traced with instrumented probes to cmdk (shadcn command demo) calling `scrollIntoView` on its selected item when a filtered grid mounts. Fix: while the Feed is mounted, `scrollIntoView` calls originating inside `.vault-filter-results` are swallowed (original restored on unmount; detail pages unaffected; no node_modules patching). Scroll anchoring and focus were ruled out as causes.
- Spacing requests: header → tabs 32 → 28 px (section `gap-8` → `gap-7` with `mt-1` on the results wrapper so tabs → results stays 32 px), and RichCaption normalized to Julio's rule-of-four grid (side/bottom padding 6 → 8 px, footer margin 10 → 12 px).
- `scripts/verify-feed-card-design.mjs` gained scroll-position regression assertions; 12/12 pass. TypeScript and the production build pass. Evidence in `artifacts/design-qa/card-design-2026-07-17/`.

### 2026-07-17 — Feed card pilot polish round 4: regular-weight headline, gap 4 px (Kimi)

- Julio's fourth-pass corrections: headline → summary gap 2 → 4 px (footer margin re-compensated so the summary → footer rhythm stays at 14 px), and the headline drops `font-semibold` to regular weight — matching the summary — while keeping the primary color. Verified with `scripts/verify-feed-card-design.mjs` (10/10) and refreshed captures in `artifacts/design-qa/card-design-2026-07-17/`. TypeScript and the production build pass.

### 2026-07-17 — Feed card pilot polish round 3: 16 px border, tighter pairing (Kimi)

- Julio's third-pass corrections: outer feed-card border radius 14 → 16 px, and headline → summary spacing reduced exactly 4 px (stack gap 6 → 2 px with the footer margin compensated so the summary → footer rhythm is unchanged). Verified with `scripts/verify-feed-card-design.mjs` (10/10) and refreshed captures in `artifacts/design-qa/card-design-2026-07-17/`. TypeScript and the production build pass.

### 2026-07-17 — Feed card pilot polish round 2: 14 px headline, rounder border (Kimi)

- Julio's second-pass corrections: RichCaption headline 15 → 14 px and the outer feed-card border radius 12 → 14 px (`LinkCard` now `rounded-[14px]`; inner stage stays 12 px, detail-page `DemoCard` untouched). Verified with `scripts/verify-feed-card-design.mjs` (10/10) and refreshed captures in `artifacts/design-qa/card-design-2026-07-17/`. TypeScript and the production build pass.

### 2026-07-17 — Feed card pilot polish: sizes and divider removal (Kimi)

- Julio's corrections after reviewing the pilot: removed the hairline divider above the RichCaption footer, card headline 17 → 15 px, card summary 13 → 14 px, and the site title set to 15 px (previously inheriting 16 px). Still pilot-only on the meeting card; feed-wide rollout awaits his go.
- Verified with `scripts/verify-feed-card-design.mjs` (10/10) and refreshed captures in `artifacts/design-qa/card-design-2026-07-17/`. TypeScript and the production build pass.

### 2026-07-17 — Feed card design pilot (RichCaption) and header cleanup (Kimi)

- Piloted Julio's new card design on the meeting-overlay card only (rollout pending his review): new `RichCaption` in `src/components/Card.tsx` adds a 17 px semibold headline, a two-line-clamped summary, and a hairline-divided footer with a "View demo" pill (visual affordance; the card itself stays the link) plus the category. All other cards keep `Caption`; `data-card-caption`/`data-card-category` are preserved for existing QA scripts.
- Applied his red-markup header deletions: title shortened to "Design Experiments", subtitle replaced with "Here are some small projects I've been exploring lately. Feel free to remix them, btw.", the no-op X close anchor removed, and the "Browse by category" / experiment-count row above the filter tabs removed (unused `visibleCount` and `X` import cleaned up).
- Verified with `scripts/verify-feed-card-design.mjs` (10/10: headline, summary renders and clamps to two lines, chip, category, zero console errors, zero overflow at 1440/390/320 px). Evidence in `artifacts/design-qa/card-design-2026-07-17/`. TypeScript and the production build pass.

### 2026-07-17 — Reactive Dither calibration-bench fix and restored merge scale (Kimi)

- Julio reported the render regressed after his settings became defaults. Root cause chain: his ×0.65 / 2.4 px settings were tuned against the pre-DPR-fix engine, where sprite `drawImage` omitted destination size and every dot rendered at 2× nominal radius on his Retina screen (dark regions merged like the reference); the DPR fix halved them. Restoring the scale via `MAX_RADIUS_RATIO` 0.75 → 1.5 then overshot into crushed black because the calibration bench measured its whole canvas — an empty one-pitch border ring diluted every measured coverage to 44% of truth, so sampling picked oversized levels for all mid targets.
- The bench now stamps a 6×6 dot grid and measures only the inner 3×3 cells, which is exactly the infinite-grid coverage. With truthful calibration at `MAX_RADIUS_RATIO` 1.5, the engine reproduces the render Julio approved — with DPR-correct stamping and his exact panel settings unchanged.
- Audit: every patch lands within ±4 luminance of the reference (field 12.3 → 10.5, triangle 133.5 → 129.8, folds within ±3.3, band 154.1 → 155.7). Verified with `scripts/verify-reactive-dither.mjs` (20/20); TypeScript and the production build pass. Evidence in `artifacts/design-qa/reactive-dither-2026-07-18/`.

### 2026-07-17 — Reactive Dither tone audit, artwork tone-field, Julio's defaults (Kimi)

- Ran a tone audit (`scripts/audit-reactive-dither-tones.mjs`, rewritten as a tile-normalized mean-absolute-error comparison) after Julio reported the render still missed the reference. Findings: the eyeballed four-tone values were wrong (the reference's left fold is darkest, right lightest, and faces are gradients, not flats); the theoretical radius law `r = p·√((1−W)/π)` undershoots because antialiasing and sprite overlap bleed coverage; the `#26262a` ink biased the calibration bench and capped the darkest field at luminance 38 vs the reference's 13; and sprite `drawImage` calls omitted destination size, rendering dots at device-pixel size (2× too large at DPR 2).
- Reworked the engine to use Julio's dithered artwork directly as the tone field: `public/vault/reactive-dither/cube-tone.png` loads into the 512 px mask, each grid point box-averages a ±7 px window to descreen the artwork's own dot grid into local white fraction, and every dot picks the sprite level whose EMPIRICALLY measured coverage (16 levels, each stamped on a test grid and measured) is closest to the target ink coverage. Sprites stamp pure black in normal mode; `drawImage` now passes explicit CSS-px size at both the calibration bench and the main loop; `syncSettings`/`resize` rebuild sprites before resampling since sampling now depends on the coverage table. The flat-region vector fallback remains for artwork load failure.
- Applied Julio's chosen live-control values as the shared `DEFAULT_SETTINGS` for thumbnail, hero, and playground: spacing 2.4 px, dot size ×0.65, interaction radius 100 px, displacement 16 px, stiffness 0.110, damping 0.850, falloff 2.00, Normal color. The capped dot size prevents merging, so mid-tones land on the reference (triangle −4.2, band −15.0 luminance) while the darkest field stays a textured charcoal by design.
- Verified with `scripts/verify-reactive-dither.mjs` (20/20, reset assertion now expects the 2.4 px default); audit deltas and fresh evidence are under `artifacts/design-qa/reactive-dither-2026-07-18/`. TypeScript and the production build pass.

### 2026-07-17 — Reactive Dither shaded cube tile, four-tone mask (Kimi)

- Reworked the Reactive Dither mask after Julio's correction that the binary carve flattened the reference's shades of gray. The engine now paints the tile field, right face, left face, and top face at distinct mask levels and buckets every sampled dot into one of four tones, each stamped from its own sprite (`TONE_RADIUS_SCALE` 3.7/2.6/1.9/1 off the base radius). Shades now come from dot size: the tile's oversized dots nearly merge into black with light speck gaps, the top face keeps sparse pin dots, the side faces sit at two grays, and the wireframe edges carve as clean channels. Inverted mode yields the true halftone negative.
- The Dot radius control is now the base (top-face) radius at 0.3–1.2 px in 0.05 steps (default 0.5 px); spacing stays at the reference-matched 3.2 px default. Sampling reads the mask's red channel for tone bucketing while alpha still gates dot existence; sprites rebuild on radius/invert changes and resampling on spacing changes, as before.
- Verified with `scripts/verify-reactive-dither.mjs` (20/20); settled, feed, displaced, and inverted captures match the reference region for region. Evidence and references are under `artifacts/design-qa/reactive-dither-2026-07-18/`. TypeScript and the production build pass.

### 2026-07-17 — Reactive Dither cube-tile mark and reference dot density (Kimi)

- Swapped the Reactive Dither mark to Julio's dithered cube app-tile logo: the mask draws a rounded-square tile (radius 13, spanning 12–88 of the 100-box) and carves the isometric cube as negative space — solid top face plus nine uniform 2.6-unit edge channels — with vertices measured tile-relative from the reference. Reinstated `roundedRectPath` for the tile; updated header comment, aria-label, build prompt, guide section, and intro prose.
- Matched the reference's dot density (measured ≈ 19–20 px pitch over a ≈ 1098 px tile): default spacing 5.8 → 3.2 px and dot radius 1.36 → 0.5 px, with slider ranges extended (spacing min 2.4, radius min 0.4) so the new defaults stay reachable. QA reset assertion updated to the 3.2 px default.
- Verified with `scripts/verify-reactive-dither.mjs` (20/20); settled and inverted captures match the reference structure and its white-on-black texture. Evidence and all three symbol references are under `artifacts/design-qa/reactive-dither-2026-07-18/`. TypeScript and the production build pass.

### 2026-07-17 — Reactive Dither pixel-invader mark (Kimi)

- Swapped the Reactive Dither mark to Julio's supplied classic arcade invader sprite, recreated 1:1 as the canonical 11 × 8 bitmap (`MARK_BITMAP`) drawn cell by cell as one merged fill on a 68-unit-wide centered grid in `drawSourceMark`; the unchanged engine samples it into the same dot field. Removed the now-unused `roundedRectPath` helper and updated the header comment, aria-label, build prompt, guide section, and intro prose.
- Verified with `scripts/verify-reactive-dither.mjs` (20/20); settled desktop capture matches the reference silhouette row for row, and the 390/320 px thumbnails stay legible with zero overflow. Evidence (feed, hero, settled, controls, displaced, inverted, mobile, and both symbol references) is under `artifacts/design-qa/reactive-dither-2026-07-18/`. TypeScript and the production build pass.

### 2026-07-17 — Reactive Dither waveform mark and smaller dots (Kimi)

- Swapped the Reactive Dither mark from the rounded-square ring to Julio's supplied waveform symbol: nine vertical bars with rounded caps (twin tall peaks, a dipped center bar that runs lowest, small capsules at the edges) drawn as `MARK_BARS` in `drawSourceMark` and sampled by the unchanged offscreen-mask dot-grid engine. Updated the engine header comment, canvas aria-label, build prompt, guide section, and intro prose to describe the waveform mark.
- Reduced the default dot radius 20% (1.7 → 1.36 px) in the shared defaults; one engine and one set of defaults still powers the feed thumbnail, expanded hero, and implementation, and the detail control reflects the new default.
- Verified with `scripts/verify-reactive-dither.mjs` (20/20) plus desktop evidence captures (feed card, hero, settled mark, controls, pointer-displaced, inverted) written to the previously missing `artifacts/design-qa/reactive-dither-2026-07-18/` alongside the symbol reference; reusable evidence capture is `scripts/capture-reactive-dither-evidence.mjs`. TypeScript and the production build pass.

### 2026-07-18 — Reactive Dither card (Kimi)

- Added `/vault/reactive-dither` directly after the promoted meeting card, titled "Reactive Dither" and categorized under Motion, from Julio's reference post (Emil Kowalski's canvas dither interaction, x.com/emilkowalski/status/2036778116748542220). Clean-room implementation; no upstream source copied.
- Built a real canvas particle system in `src/demos/ReactiveDitherDemo.tsx` (+ `.css`, `rd-` namespace): a vector-drawn rounded-square ring with a solid center dot is rendered into an offscreen 512 px mask and sampled into an evenly spaced dot grid. An invisible circular influence field follows the pointer with light smoothing; dots inside it are pushed radially outward with cubic falloff (`strength x (1 - d / R)^3`) and return home through a damped spring (`v = (v + (target - p) x stiffness) x damping`).
- One engine and one set of visual defaults power the feed thumbnail, expanded hero, and implementation. The thumbnail idles with a subtle Lissajous influence drift, gates on 35% viewport visibility, pauses offscreen, yields to the pointer immediately, and resumes after 4.5 s idle. Rendering is requestAnimationFrame-based, devicePixelRatio-aware (capped at 2), sprite-stamped via drawImage, delta-time normalized, and sleeps once every dot settles; ResizeObserver resamples instead of stretching. No React state is touched inside the loop, and all frames, observers, listeners, and timers clean up on unmount.
- The expanded page (`src/pages/ReactiveDitherDetail.tsx`) follows the vault's detail structure: hero, explanation, live implementation with Reset, a compact light-mode controls panel (dot spacing, dot radius, interaction radius, displacement strength, return stiffness, damping, cubic falloff intensity, invert colors), a ten-part How it works guide with a reusable engine example, full local source in Code tabs and the copy prompt, credits, and the reference link.
- Reduced motion renders the settled mark once with the loop, idle drift, and pointer response disabled. Pointer input covers mouse, touch, and pen, and the stage keeps vertical page scrolling via `touch-action: pan-y`.
- Registered the card in the central catalog, feed order, breadcrumbs, category counts, and cyclic previous/next navigation. Fixed one defect found during QA: reading `event.currentTarget` inside a deferred state updater threw and unmounted the app; the value is now captured during dispatch.
- Verified with `scripts/verify-reactive-dither.mjs` (20/20): idle drift, pointer displacement, offscreen pause, re-entry resume, direct-load route, live controls, invert, reset, reduced motion, zero console errors, and zero horizontal overflow at 1440/390/320 px. TypeScript and the production build pass (the pre-existing bundle-size warning remains). Evidence is under `artifacts/design-qa/reactive-dither-2026-07-18/`.

### 2026-07-16 — Easing Blueprint remediation with Emil Design Engineering (Codex)

- Re-audited all 65 registered cards using the existing Easing Blueprint matrix plus Emil Kowalski's current `emil-design-eng` skill. Confirmed that the bundled skill is byte-for-byte identical to GitHub commit `6bf24434f7730ad169077756cf9c7cd7bd675fc6`.
- Implemented all 18 previously identified tuning items. Added the exact shared on-screen movement curve `cubic-bezier(0.77, 0, 0.175, 1)`; retuned Card Resize, Text States, Panel Reveal, Page Side-by-Side, Icon Swap, Tabs Sliding, Dropdown Morph, Accordion, Thinking + Reasoning, To-do List, Scroll Gallery, and Road Cup Knockout; and separated Web Search entrances from gentle state changes.
- Removed the delayed ease-in behavior from Panel Reveal and Input Clear, made 3D Tilt pointer tracking transition-free, made keyboard-driven tab/category changes immediate, and shortened repeated spatial reflows to 180–260 ms. Corrected the Animation Principles guide so it no longer teaches ease-in exits.
- Added a settled reduced-motion rendering path to Meeting Overlay. Continuous linear effects, real springs, direct drawing/dragging, and intentional instructional “Before” examples remain explicit exceptions rather than false positives.
- Measured the Embla Carousel rather than rewriting dependency-owned motion: it covers about 84% of its snap distance in the first 45 ms, then settles progressively and remains interruptible. Added Gradient Spin as the 65th aligned card.
- Final disposition: 55 aligned, 10 static/N/A, 0 remaining tuning items. TypeScript, `git diff --check`, and the production build pass. The report, source captures, implementation captures, complete matrix, and limitations are in `artifacts/audits/easing-blueprint-fixes-2026-07-16/AUDIT.md`.

### 2026-07-16 — Gradient Spin card (Codex)

- Added `/vault/gradient-spin` directly after the promoted meeting card, titled “Gradient Spin” and categorized under Motion. The central catalog now drives its feed caption, category count, breadcrumb, route, and cyclic previous/next neighbors.
- Rebuilt the MIT-licensed `BIAsia/gradient-spin` mechanism locally: a single shared opacity keyframe, negative per-cell phase delays, exact Arrow/Diagonal/Snake/Ripple phase maps, path/top-down axes, and OKLab sampling across all eight source palettes. The upstream license is bundled beside the implementation.
- Kept the feed thumbnail focused on one quiet spring/snake loading specimen. It animates only while at least 35% visible, pauses offscreen, and freezes to a useful state under reduced motion. The expanded hero stays visually synchronized and the Implementation section exposes the original palette, pattern, axis, timing, dim, grid, size, and gap controls.
- Added a self-contained expanded page with interaction explanation, implementation notes, full React/CSS source, copy prompt, reference links, MIT credit, and a note explaining why linear timing is intentional for this perpetual cycle.
- Verified palette/pattern/axis interaction, live cell-opacity changes in the detail and feed specimens, viewport gating, clean browser logs, TypeScript, and the production build. Source/implementation captures and the passing comparison are under `artifacts/design-qa/gradient-spin-2026-07-16/`; the QA report is at the top of `design-qa.md`.

### 2026-07-16 — Vault-wide Easing Blueprint audit (Codex)

- Audited all 64 registered cards against animations.dev's Easing Blueprint using a full source scan plus focused live checks of the feed, category navigation, the animation-principles guide, the explicit Motion Audit comparison, and a spring-driven reference implementation.
- Classified 36 cards as aligned, 18 as needing easing/accessibility tuning, and 10 as static or not meaningfully subject to spatial easing. Intentional “Before” examples and legitimate continuous linear motion such as spinners, shimmer travel, and hue cycles were kept exempt.
- Highest-priority findings: reconcile the Animation Principles card's `ease-in` exit recommendation with the chosen blueprint; add reduced-motion behavior to Meeting Overlay; remove ease-in exits from Panel Reveal and Input Clear; stop filtering pointer-driven 3D Tilt through a 400 ms tween; and retune the long Scroll Gallery/Road Cup reflows.
- Made no runtime changes. The complete 64-card matrix, source locations, screenshots, limitations, and recommended implementation order are in `artifacts/audits/easing-blueprint-2026-07-16/AUDIT.md`.

### 2026-07-16 — Scribble Index card (Codex)

- Added `/vault/scribble-index` directly after the promoted meeting card, titled “Scribble Index” and categorized under Interactions. Feed metadata, filters, breadcrumbs, and cyclic previous/next navigation use the central vault catalog.
- Recreated Benji Taylor’s writing index from Julio’s screenshot and the live `benji.org` DOM/CSS: muted Writing heading, fixed year/title/date columns, title-column separators, full-width year boundaries, 140 ms sibling fading, tabular dates, and the rough magenta New annotation.
- Built a real responsive canvas above the list. Mouse, pen, and touch drags create normalized two-pass magenta strokes that survive resizing; Undo removes the latest mark and Reset restores the initial rough circle. Pointer hit-testing drives the same row-hover behavior through the canvas, while semantic row buttons preserve keyboard selection.
- The compact feed thumbnail automatically advances one highlighted row every 1450 ms only while at least 35% visible, pauses when hovered or offscreen, and settles under reduced motion. Drawing in the thumbnail remains contained and does not open the detail page; the caption still navigates normally.
- Refined the magenta renderer into a drier pencil/brush texture without changing its outer stroke thickness: a deterministically broken core, fine offset fibers, and restrained graphite-like grain now roughen both the initial New circle and user-drawn marks at every size.
- Verified the screenshot comparison, desktop hover/drawing, feed autoplay and containment, keyboard selection, Undo/Reset, 390/320 px fit with zero overflow, clean browser logs, TypeScript, and the production build. Evidence is under `artifacts/design-qa/scribble-index-2026-07-16/` and the passing report is at the top of `design-qa.md`.

### 2026-07-16 — Attachment layout and interaction correction (Codex)

- Rebuilt only the Attachment specimen's responsive layout after Julio's screenshots showed the shared transform scaler pushing its status rows below the expanded and feed crop boundaries. The three images now use a true responsive grid, the two status files share a second row, the composition is centered from its real dimensions, and the Attachment-only Implementation stage is 360 px rather than 480 px.
- Added direct functionality to the shared feed/detail component: clicking an image opens a full-size contained preview; Escape, the backdrop, and the close control dismiss it; upload cancellation, image removal, and completed-file removal now update local state. Explicit event containment keeps thumbnail actions from navigating to the detail route.
- Added compact height treatments for the fixed-ratio feed card. At 320 px the complete compact specimen fits with balanced top/bottom space and zero document overflow; the tiny image-removal overlay is suppressed at that breakpoint so it cannot compete with the image-preview target, while upload cancellation remains available.
- Visually compared both supplied diagnostic screenshots with settled browser captures, tested desktop and 390/320 px layouts, exercised cancel/open/close/containment behavior, confirmed zero console errors, and passed TypeScript and the production build. Evidence and the passing report are under `artifacts/design-qa/attachment-2026-07-16/` and at the top of `design-qa.md`.

### 2026-07-16 — Interface Craft Guidelines card (Codex)

- Added `/vault/interface-guidelines` directly after the shadcn/ui collection, titled “Interface Craft Guidelines” and categorized under Skills.
- Used Rauno Freiberg’s live Web Interface Guidelines, official 1200 × 630 social preview, production CSS, and repository commit `81f523a5b469ba1ea877fef262588f3b4b65d31f` as research. The repository has no declared license, so no upstream source, font, icon, or prose was copied; the implementation and wording are a clean-room, credited adaptation.
- Built one shared light-mode review specimen for the feed thumbnail, expanded hero, and implementation. Cyan construction lines and a large stacked title sit behind a raised white audit sheet; the compact card demonstrates immediate inline copy feedback, a radius-following focus ring, and a sub-200 ms state transition without a toast.
- Expanded the card into seven selectable review categories—Interactivity, Typography, Motion, Touch, Optimizations, Accessibility, and Design—with 52 locally written principles. Every row is directly reviewable, category tabs are semantic and horizontally resilient, Reset restores the initial audit, and the layout has compact container-query treatments for the vault’s wide thumbnails.
- Added a complete four-step audit workflow, the full categorized guide, copyable React/CSS/data source, Rauno and source-snapshot credits, central feed metadata, category counts, breadcrumbs, and cyclic navigation.
- TypeScript and the production build pass, and the local route responds. Browser-rendered implementation capture and pixel comparison remain blocked because no approved browser-control path is available in this session; the QA note is at the top of `design-qa.md`.

### 2026-07-16 — Command complete documentation card (Codex)

- Canonicalized the existing `/vault/shadcn-command` entry as “Command” rather than creating a duplicate “Command Menu” card.
- Kept the feed thumbnail, expanded hero, and Implementation section on the official `command-demo`, then added the complete documentation supplied by Julio directly after Implementation: About, CLI/manual installation, Usage, component composition, Basic, Shortcuts, Groups, Scrollable, RTL, and cmdk API reference.
- Reproduced all five secondary official examples locally. Basic, Shortcuts, Groups, and Scrollable open real searchable command dialogs; RTL renders the complete Arabic command surface. Dialogs close on backdrop or Escape, scrollable content stays constrained, and the exact official labels, groups, icons, and shortcuts are preserved.
- Added the guide and example source to the Command card’s Code tabs and Copy prompt so the expanded page remains self-contained. Renamed shared feed metadata, breadcrumbs, and navigation through the central catalog.
- TypeScript and the production build pass. The existing non-blocking bundle-size warning remains.

### 2026-07-16 — shadcn/ui exact-demo correction (Codex)

- Replaced the earlier Shadcn interpretations with the official primary demo structures and copy from `shadcn-ui/ui@c49c3061b5b86b130736d36bf20008349f89b416`: Attachment, Calendar, Card, Carousel, Chart, Breadcrumb, Bubble, Button Group, and Command.
- Removed the invented Example selector, Reset/Replay wrapper actions, alternate variants, vault typography inheritance, and custom demo content. Feed thumbnails, expanded heroes, and implementation stages now render the same canonical specimen; only the outer vault frame and proportional thumbnail scaling remain.
- Added the source dependencies used by those demos (`react-day-picker`, Embla, Recharts, cmdk, Lucide) plus self-hosted Geist and Inter. Downloaded the three exact Attachment reference images into `public/vault/shadcn/` so the demos do not rely on Unsplash at runtime.
- Rebuilt the component styling from the official base-nova and base-rhea source tokens: exact light surfaces, font families, compact sizing, radii, hairlines, menu geometry, bubble spacing, chart layout, calendar cells, and command content. The catalog descriptions and copy prompt now document the canonical demo rather than the removed alternates.
- TypeScript and the production build pass using the direct binaries documented above. Browser-rendered pixel comparison remains pending because this session has no approved browser-control path.

### 2026-07-16 — shadcn/ui component collection, initial pass (Codex, superseded)

> Superseded by the exact-demo correction above after Julio requested literal upstream fidelity.

- Added nine light-mode component cards from the supplied shadcn/ui references: Attachment, Calendar, Card, Carousel, Chart, Breadcrumb, Bubble, Button Group, and the screenshot-derived Command Menu. The collection sits directly after Toast Notifications in the feed.
- Built one catalog-driven React/CSS system for all nine routes. The same stateful specimen powers the feed thumbnail, expanded hero, and implementation, while one Example selector keeps alternate states out of the thumbnails.
- Kept each default card focused on one direct interaction: attachment status/removal, date selection, login card, swipe/arrow carousel, chart tooltip selection, collapsed breadcrumb menu, message reaction, split action, and keyboard-searchable command menu.
- Recreated the reference’s restrained white surfaces, neutral `#e5e5e5` hairlines, `#171717` foreground, compact spacing, and 10–12 px radii without adding dependencies. Existing vault typography remains inherited so the collection belongs to the same editorial shell.
- Added local source tabs/copy prompts, shadcn documentation links, MIT attribution, and the pinned upstream commit `c49c3061b5b86b130736d36bf20008349f89b416` to every expanded page.
- TypeScript and the production build pass. Browser-rendered desktop/390/320 comparison and interaction QA remain blocked until direct use of the project’s local Playwright runner is approved; the blocking report is at the top of `design-qa.md`.

### 2026-07-16 — Sonner toast notifications card (Codex)

- Added `/vault/sonner` directly after the Emil skills collection, titled “Toast Notifications” and categorized under Interactions. The feed thumbnail stays focused on one default notification and one meaningful “Render a toast” trigger.
- Used the current Sonner site and `emilkowalski/sonner` main commit `45d894085af8ca8421912789a8f5a4ac4ac3d0ea` as the behavior source. The implementation is local React/CSS rather than a new runtime dependency, while preserving the reference’s 356/306 px fixed-width logic, 400 ms retargetable transitions, 45 px swipe threshold, three-toast stack, edge-aware entry/dismissal, and MIT attribution.
- The expanded page exposes eight toast types, all six positions, compact hover-expanding or always-expanded stacks, optional close buttons, action dismissal, in-place promise resolution, Reset/Replay, and pointer/touch swipe dismissal. The same stateful component powers the feed thumbnail, expanded hero, and implementation.
- Compact autoplay begins only at 35% viewport visibility, resets offscreen, and shows a settled notification under reduced motion. Stack gaps retain hover with invisible interaction bridges, back-toast content stays hidden until expansion, and the feed trigger remains interactive without opening the card.
- Verified the full route at 1440 px, 390 px, and 320 px; type/position control counts; promise, action, close, stack, hover, swipe, reduced-motion, feed-containment, and detail navigation behavior; zero overflow; clean browser logs; TypeScript; and production build. Evidence and the reusable QA script are under `artifacts/design-qa/sonner-2026-07-16/` and `scripts/verify-sonner.mjs`.

### 2026-07-16 — Motion Audit wrong/correct comparison pilot (Codex)

- Piloted Julio’s proposed skills-card comparison on Motion Audit only. After the first framed version felt too structural, simplified it to match Julio’s follow-up sketch: one open canvas, two equal interactive sides, a single center divider, compact Before and After pills, and the motion specimens directly underneath. Removed the outer comparison frame, repeated headers, verdict rows, X, and check.
- Refined the open comparison after live review: the shared stage now fills the full preview, the divider sits on the exact 50% grid line and runs edge-to-edge, and the Before/After pills sit against the upper inset instead of floating near the center. Removed the partial-side gray hover background entirely.
- Kept the card focused on one comparison. The default Easing and duration example replays `linear · 420ms` and `ease-out · 180ms` simultaneously; the expanded selector preserves Purpose, Performance, and Accessibility in the same comparative frame.
- Applied the shared component to the feed thumbnail, expanded hero, and implementation. Either side can replay the comparison, Reset settles both sides, viewport-gated feed autoplay remains intact, and reduced motion keeps both outcomes visible.
- TypeScript and the production build pass. Browser-rendered comparison, responsive capture, interaction QA, and final visual approval remain pending because the in-app Browser control surface is unavailable and direct Playwright use requires explicit user approval. The current blocking report is at the top of `design-qa.md`.

### 2026-07-16 — Emil skills presentation audit and rebuild (Codex)

- Verified the six bundled `SKILL.md` files against the current `emilkowalski/skills` main commit `6bf24434f7730ad169077756cf9c7cd7bd675fc6`; every local skill archive is byte-for-byte current. The audit isolated the problem to the presentation layer, not the source content.
- Rebuilt all six feed thumbnails around one focused default specimen: save feedback, Pop in, one easing audit, a notification counter, one toast review, and an interruptible spring toggle. Removed the compact reports, floating annotations, technical captions, competing controls, and ignored `compact` behavior.
- Added a typed example registry and one native Example selector to every expanded Implementation section. The six pages now expose 23 focused variants without putting those variants into the thumbnails.
- Centralized motion lifecycle behavior: compact autoplay starts at 35% viewport visibility, resets offscreen, and replays on re-entry; expanded examples run once; reduced motion resolves to a meaningful end state. Reset now restores the true initial state, and visible specimens use semantic buttons or a keyboard-operable slider.
- Verified all six routes and every selector option at 1440 px, 390 px, and 320 px; direct interaction/card-navigation containment; viewport entry/leave/re-entry; reduced motion; keyboard controls; zero overflow; clean browser logs; TypeScript; and the production build. Audit evidence is in `artifacts/audits/emil-skills-2026-07-16/`; reusable QA is `scripts/verify-emil-skills.mjs`.

### 2026-07-16 — Emil Kowalski skills collection (Claude)

- Added six Skills cards from emilkowalski/skills (MIT, pinned commit `6bf2443`), registry-driven like the transitions/AI CSS collections: `src/emilskills/catalog.ts` defines paths/titles/summaries; `src/demos/EmilSkillsDemo.tsx` + `.css` (ek- namespace) hold one original interactive specimen per skill; `src/pages/EmilSkillDetail.tsx` renders all six routes (`/vault/skill-*`).
- Specimens: Craft switch (design-eng: naive↔crafted dialog entrance), Name-that-motion (vocabulary: effect plays, term stamps), Audit→plan (improve-animations: modal replayed before/after a prioritized plan), Opportunity scan (pins propose exact values, one deliberate rejection), Craft bar (review: toast reviewed line-by-line, verdict flips on fix), Interruptible spring toggle (apple-design: rAF spring knob, redirect mid-flight). All loop ambiently, stand down 6s after interaction, resolve statically under reduced motion, and compress via container queries — no separate thumbnails.
- Each detail bundles the verbatim SKILL.md + SOURCE.md + MIT LICENSE under `src/content/skills/emil/<slug>/` (Codex's skills-collection convention); the Skill section's copy chip ships install steps + the full skill text with attribution. Feed slot: directly after the meeting card. Also installed all six skills to `~/.claude/skills`-equivalent project skills dir for agent use.
- Verified: 52 feed cards, six in the Skills filter (now 10), all routes with live specimens, specimen-click containment, copy payload (23k incl. license notice), 390/320 no overflow, clean console, tsc, production build. Note: the published claude.ai artifact still carries only the original five Claude-era views and has diverged far behind the app — needs a strategy decision rather than more hand-ports.

### 2026-07-16 — Thinking + Reasoning thumbnail lifecycle (Codex)

- Fixed the Thinking + Reasoning feed thumbnail completing its sequence while still far below the initial viewport. Its compact specimen now observes its own visibility and begins the natural step-by-step reasoning animation only after at least 35% of the card enters view.
- Cancels every reasoning timer and restores the initial state when the thumbnail leaves view, then replays from the beginning when it re-enters. The expanded hero and implementation remain immediate and unchanged.
- Added a reduced-motion branch that resolves directly to the completed summary rather than scheduling progressive animation. This visibility gate reduces background work instead of increasing it, so the fix does not create a page full of concurrent timers.
- Verified a 4.3-second offscreen hold with zero progress, on-entry step progression, leave/reset, re-entry replay, unchanged expanded animation, clean browser logs, TypeScript, and the production build. Evidence is under `artifacts/design-qa/thinking-reasoning-visibility-2026-07-16/`; reusable QA is `scripts/verify-thinking-reasoning-thumbnail.mjs`.

### 2026-07-16 — Direct card actions and category captions (Codex)

- Replaced the Transitions.dev collection’s redundant Animate, Clear text, Reset text, Toggle menu, Toggle modal, and Toggle panel helper actions with direct manipulation. Cards, numbers, badges, statuses, icon swaps, success checks, validation fields, search clearing, profile skeletons, text reveals, and shimmer labels now animate from their own visible surface.
- Renamed the few necessary product triggers to meaningful interface copy: Menu, New project, and Analytics. The search field keeps one contextual trailing control that changes from Clear search to Restore search text, and the panel header itself now owns disclosure.
- Preserved feed-card navigation through the existing interactive-card boundary: clicking a specimen changes its state without navigating, while clicking the surrounding preview or caption still opens the expanded route. Expanded Implementation sections retain their external Reset and Replay tools for controlled inspection.
- Removed dates from every card-caption API and usage, including dormant legacy card components. Feed captions now use the former date position for Skills, Interactions, Motion, or Interfaces, with the title alone on the left; detail metadata and credits still retain dates.
- Verified all forty-six visible caption categories, zero caption dates, twelve direct-manipulation state changes, card-navigation containment, 390 px and 320 px feed fit, clean browser logs, TypeScript, and the production build. Visual evidence is under `artifacts/design-qa/direct-card-actions-2026-07-16/`; reusable QA is `scripts/verify-direct-card-actions.mjs`.

### 2026-07-15 — AI CSS component collection (Codex)

- Audited the complete live AI CSS catalog and resolved it to twelve components across Thinking & Reasoning, Tool & Action States, Text Outputs, and Structured Outputs: thinking state, thinking plus reasoning, web search, file diff, image generation, text response, streaming text, inline citations, code block, to-do list, data table, and comparison table.
- Added one feed card and detail route per component as a contiguous collection immediately after the Transitions.dev cards. A single typed registry now drives titles, categories, source groups, dates, descriptions, credits, routes, feed order, filters, breadcrumbs, and cyclic previous/next navigation.
- Built a clean-room, vault-native React/CSS implementation for every observable behavior: shimmer and reasoning disclosure, progressive source resolution, animated diffs, stable image generation, formatted/streaming prose, selectable evidence, in-place copy confirmation, task progress, sortable data, and selectable comparison columns. The exact same stateful specimen powers the thumbnail, expanded hero, and implementation.
- Preserved AI CSS as the behavior reference while translating all surfaces to the vault’s light design system and avoiding external runtime assets or dependencies. Each expanded card includes Reset/Replay controls, full local source tabs, a complete copy prompt, source-group metadata, and direct AI CSS credit.
- Verified all twelve routes at 1440 px, 390 px, and 320 px; confirmed synchronized two-instance rendering, category links, route titles, Reset/Replay controls, zero document overflow, responsive hero containment, key streaming/search/copy/task/citation/comparison state changes, clean browser logs, TypeScript, and the production build. Evidence lives under `artifacts/design-qa/aicss-2026-07-15/`, and the reusable QA is `scripts/verify-aicss.mjs`.

### 2026-07-15 — Accordion Spider-Man copy (Codex)

- Replaced the Accordion specimen’s appearance content with “best spider man” and the three radio options Tom Holland, Andrew Garfield, and Toby Maguire.
- Updated the icons and radio-group name to match the people-selection content. Because the shared specimen powers every surface, the feed thumbnail, expanded hero, and implementation remain synchronized.

### 2026-07-15 — Sliding category navigation (Codex)

- Applied the Transitions.dev sliding-tabs interaction to the homepage category navigation. One measured pill now follows All, Skills, Interactions, Motion, and Interfaces, interpolating both position and width over the same 250 ms ease while the existing result transition runs below it.
- Upgraded the category group to an accessible tablist with selected state, roving tab focus, Left/Right wrapping, Home/End shortcuts, and a labelled results tabpanel. Mouse selection and keyboard selection continue to update the live count and `?category=` URL.
- Kept the narrow layout horizontally scrollable and automatically brings keyboard-selected tabs fully into view. Verified exact pill-to-tab alignment, all category counts, URL/filter synchronization, wraparound, 320 px overflow and auto-scroll, clean browser logs, TypeScript, and the production build.

### 2026-07-15 — Transitions.dev collection (Codex)

- Audited the current live gallery and its official GitHub source at commit `5ad812dbbe1009ff51d1137dbea5d577f9135814`, resolving the catalog to twenty-one distinct prototypes despite stale lower counts in older repository copy.
- Added one feed card and detail route per prototype, in source order immediately after 12 Principles of Animation: card resize, number pop-in, notification badge, text state swap, menu dropdown, modal, panel reveal, page slide, icon swap, success check, avatar falloff, error shake, input dissolve, skeleton reveal, text reveal, sliding tabs, shimmer text, tooltip, 3D tilt, dropdown morph, and accordion.
- Built a single catalog-driven React/CSS system for all cards. The exact same specimen powers each interactive thumbnail, expanded hero, and implementation; generic detail pages provide explanation, Reset/Replay controls, full local source tabs/copy prompt, Transitions.dev credit, category breadcrumbs, and cyclic previous/next navigation.
- Reproduced the observable triggers, directional relationships, asymmetric entry/exit timing, interruption cleanup, pointer/touch behavior, keyboard support, and reduced-motion fallbacks without importing the source’s unlicensed font, avatar assets, or code. The neutral surfaces, hairlines, typography, and radii stay inside the vault’s light-mode design system.
- Verified all twenty-one detail routes render two synchronized demos with no desktop overflow; tested the ten highest-risk interaction state changes, feed-button containment and card navigation, category counts/order, 390 px and 320 px layouts, the corrected narrow-stage centering, clean browser logs, TypeScript, and the production build.

### 2026-07-15 — Animation principles GitHub-source audit (Codex)

- Audited `/vault/animation-principles` against the current upstream GitHub `SKILL.md` at commit `dc9eef22f13635df77d9b9e67c82aa85d52a97b7`; the local archive is byte-for-byte identical to GitHub.
- Confirmed that the source defines fourteen concrete rules grouped under four categories, while the interactive card exposes only four category-level examples and an inaccurate `12 / 12` badge.
- Reproduced rule failures in the 620 ms keyframed Physics motion, interrupted 90 ms replay reset, symmetric ease-out exits, implicit overlay layering, incomplete tab keyboard pattern, undersized compact controls, and reduced-motion Physics fallback. The evidence-backed report is `artifacts/audits/animation-principles-2026-07-15/AUDIT.md`; runtime source was not changed.

### 2026-07-15 — 12 Principles of Animation card (Codex)

- Added `/vault/animation-principles` immediately after the intentionally promoted meeting card, categorized under Motion, with synchronized feed metadata and expanded-card navigation.
- Built one shared light-mode motion inspector for the thumbnail, expanded hero, and implementation. Timing, Easing, Physics, and Staging are selectable; each example loops, replays on demand, supports keyboard focus, and respects reduced-motion preferences.
- Added a self-contained guide for all fourteen concrete upstream audit rules, audit workflow, review checklist, copyable implementation, and a pinned local snapshot of Raphael Salaja's complete MIT-declared skill at commit `dc9eef22f13635df77d9b9e67c82aa85d52a97b7`.
- Verified feed/detail synchronization, Motion filtering and counts, Timing/Physics/Staging states, replay behavior, cyclic navigation, zero desktop overflow, an exact upstream archive hash, clean browser logs, TypeScript, and the production build. Container-query rules cover the vault's compact thumbnail and narrow implementation states.

### 2026-07-15 — Homepage title and meeting-card promotion (Codex)

- Replaced the homepage introduction headline with “Design Engineering Experiments”.
- Renamed the meeting-overlay experiment to “Stop missing your meetings” and promoted it to the first position in the homepage feed.
- Updated the shared vault order and metadata so feed captions, expanded titles, breadcrumbs, category filtering, and previous/next navigation remain synchronized.

### 2026-07-15 — Vault categories and expanded-card navigation (Codex)

- Added one centralized taxonomy for all twelve visible experiments: Skills, Interactions, Motion, and Interfaces. Every feed caption now shows its category.
- Added a light-mode homepage category filter with live counts, pressed states, URL-backed selection, animated result changes, and a horizontally scrollable mobile layout.
- Added Home / category / experiment breadcrumbs and joined previous/next arrows to the shared detail shell, so all expanded cards navigate in feed order and wrap between the first and last experiment. Category breadcrumbs reopen the matching filtered homepage.
- Used the existing Neue Montreal typography, page/surface/border tokens, compact radii, and Phosphor icons. Verified filter results, query restoration, category breadcrumbs, arrow navigation and wraparound, desktop/390 px/320 px layouts, zero horizontal document overflow, clean browser logs, TypeScript, and the production build. Evidence lives under `artifacts/design-qa/vault-navigation/` and the latest report is at the top of `design-qa.md`.

### 2026-07-15 — Playwright CLI skill card (Codex)

- Added `/vault/playwright-cli` at the top of the feed with one shared light-mode browser-session component powering the thumbnail, expanded hero, and implementation.
- Built an editable URL field, Open/Snapshot/Act/Verify workflow controls, realistic CLI command output, run/reset actions, keyboard focus states, container-responsive compact modes, and reduced-motion support.
- Added a self-contained complete guide plus a pinned local snapshot of Microsoft’s upstream `SKILL.md`, all nine linked reference documents, Apache 2.0 license, and source provenance at commit `eee5a185c98e6b04d88f580d45a854e9692ab50b`.
- Verified feed interaction containment and navigation, URL normalization, workflow state changes, desktop/390 px/320 px layouts, zero horizontal overflow, clean browser logs, TypeScript, and the production build. Source/prototype evidence lives under `artifacts/design-qa/playwright-cli/`.

### 2026-07-15 — Scroll Gallery thumbnail 4 px lift (Codex)

- Moved the complete feed-thumbnail composition—cover rail, active title, and artist—up by exactly 4 px at every container tier by reducing the thumbnail stage endpoint and cover offset together.
- Left the outer card, Scroll Gallery/date caption, expanded hero, full implementation, cover geometry, crops, perspective, and interactions unchanged.
- Verified the revised feed card at desktop, 390 px, and 320 px, plus clean browser logs, TypeScript, and the production build.

### 2026-07-15 — Scroll Gallery vertical spacing rebalance (Codex)

- Shifted the expanded hero's cover rail and title block down by 20 px, creating the requested top inset between the New Yorker header and cover artwork while reducing the unused bottom band from roughly 36 px to 16 px at the 686 px shell.
- Shifted the headerless feed thumbnail down by 16 px on wide cards, with smaller 8 px and 6 px adjustments at the 480 px and 300 px container tiers, so its title/artist block finishes closer to the bottom edge without clipping.
- Kept cover geometry, crop, perspective, typography, controls, interactions, and the full 620 px implementation unchanged. Verified desktop, 390 px, and 320 px fit, artwork loading, browser logs, TypeScript, and the production build.

### 2026-07-15 — Interaction Sounds semantic controls revision (Codex)

- Replaced the generic speaker/play surface with fourteen semantically matched interactions selected from the same top-level dropdown: notification, sparkle, droplet, disclosure, quiet switch, checkbox, pointer press, pointer release, notification switch, confirmation, retry, pagination, loading, and ready-state controls.
- Kept playback on the official MIT-licensed `cuelume@0.1.2` engine. Selecting and interacting with a control calls the matching exact cue; Press and Release fire on their corresponding pointer phases, Toggle/Whisper expose switch state, Tick exposes checkbox state, Page advances, and Loading exposes busy state.
- Changed the near-black split control to Apple-like system fill `#f2f2f3`, roughly 5% darker than the white canvas. Rebalanced the interface with charcoal text, muted helper copy, gray hairlines, squircle corners, and consistent 19 px regular-weight, rounded-terminal Phosphor symbols styled to follow SF Symbols' optical language inside cue-colored setting tiles.
- Verified the semantic states, dropdown keyboard/focus return, feed interaction containment and navigation, 390 px and 320 px fit with all fourteen choices visible, zero horizontal overflow, clean browser logs, TypeScript, and the production build. Revised evidence lives under `artifacts/design-qa/cuelume/revision/`.

### 2026-07-15 — Interaction Sounds card (Codex)

- Added `/vault/cuelume` at the top of the feed with one shared responsive Cuelume demo powering the thumbnail, expanded hero, and implementation.
- Recreated the source’s compact warm-paper interface, live waveform, fourteen color-coded sound cues, keyboard shortcuts, hover tick, press/release save state, and toggle feedback. Every cue is synthesized locally with Web Audio oscillators and filtered noise; no audio files or source runtime code are required.
- Added the complete component and stylesheet to the expanded page’s code/copy payload, plus local implementation notes, Cuelume/Daniel Belyi credit, source reference, and responsive container modes for the vault’s fixed-ratio preview and full implementation.
- Verified cue playback, live readouts, canvas waveforms, press/release, toggle state, 1–0 + Q–R keyboard mapping, feed interaction containment and navigation, zero console warnings/errors, 390 px and 320 px fit with all fourteen cues visible, TypeScript, and the production build. Comparison evidence lives under `artifacts/design-qa/cuelume/`.

### 2026-07-15 — Scroll Gallery hero metadata removal (Codex)

- Removed the Issue, Artist, and Story table from the fixed-ratio expanded hero while retaining the active cover title and artist.
- Kept the same detailed metadata available in the full interactive implementation below; the feed thumbnail remains unchanged.
- Verified zero hero metadata tables, one complete implementation table, retained title/artist text, all artwork loads, TypeScript, and the production build.

### 2026-07-15 — Scroll Gallery label refinement (Codex)

- Changed the muted New Yorker header label from “magazine” to “covers” in the expanded hero and implementation, including synchronized accessibility and copy-prompt language.

### 2026-07-15 — Scroll Gallery typography and clipping fix (Codex)

- Removed the gallery's component-specific font stack and negative heading tracking. All gallery text now inherits the vault's Neue Montreal family and default tracking directly from the page design system.
- Fixed the expanded hero clipping reproduced at 620 px wide by adding compact-hero layouts at 640 px, 480 px, and 300 px container thresholds. The rail, covers, type, and controls scale together while the fixed 1344:520 frame remains unchanged.
- Preserved all three metadata columns in desktop and narrow-desktop heroes; only the miniature mobile hero omits that table so its title and artist remain legible inside the frame. Feed-thumbnail rules remain independently scoped.
- Verified the reported 620 px state with 1.4 px of bottom clearance, exact body/hero font-stack parity, normal heading tracking, direct cover selection, all artwork loads, TypeScript, and the production build.

### 2026-07-15 — Scroll Gallery expanded-header spacing (Codex)

- Changed the gallery interface header from “scroll gallery / covers” to “New Yorker / magazine” in the expanded hero and full implementation; the feed caption remains Scroll Gallery.
- Added a 12 px top inset between the active cover rail and its title in the wide expanded hero. Rebalanced only the compact hero's internal rail and metadata spacing so the existing 1344:520 outer ratio remains unchanged and nothing clips at the bottom.
- Kept the feed thumbnail presentation unchanged through its existing thumbnail-specific overrides.
- Verified the expanded header text, cover-to-title gap, zero bottom clipping, unchanged feed thumbnail, artwork loads, TypeScript, and the production build.

### 2026-07-15 — Scroll Gallery cover crop alignment (Codex)

- Top-aligned every New Yorker image inside its square squircle so the masthead remains visible instead of being vertically center-cropped.
- Removed the source thumbnails' decorative left strip with a one-sided 10% overscan: the artwork extends left beyond the clipped frame while its right edge stays fixed, preserving the intended cover content and eliminating the colored margin.
- Applied the same crop model to the feed thumbnail, expanded hero, implementation, search results, and list view while preserving the existing coverflow geometry and interactions.
- Verified the computed top anchor and one-sided fill in the local browser, all eight artwork loads, direct cover selection, list-view crops, TypeScript, and the production build.

### 2026-07-15 — Scroll Gallery square cover geometry (Codex)

- Renamed the visible feed caption, detail-page title, component wordmark, prose, accessibility label, and copy prompt from Scrollgallery to Scroll Gallery while preserving the existing route and source identifiers.
- Restored the original album-cover geometry everywhere: 1:1 coverflow slots, 26 px desktop squircle corners, the original perspective spacing, and matching square artwork in compact, thumbnail, search, and list states.
- Verified the synchronized feed/detail geometry in the local browser, direct cover selection, all artwork loads, TypeScript, and the production build.

### 2026-07-14 — Scrollgallery New Yorker cover collection (Codex)

- Renamed the feed card and expanded-page title from Scrollable Scrolling Gallery to Scrollgallery while preserving the existing `/vault/chief-keef-index` route and coverflow wrappers.
- Replaced all music-specific content with a temporary eight-cover selection from The New Yorker: portrait artwork, cover titles, artists, issue dates, story notes, search language, list rows, and title/artist sorting. The records are centralized in one array so Julio's final cover choices can be substituted later without changing the interaction.
- Bundled the eight cover images under `public/vault/scrollgallery/`, updated the thumbnail, expanded hero, implementation, code prompt, credits, and reference together, and adapted the cover geometry to the source artwork's portrait ratio.
- Verified the synchronized home card and expanded page in the local browser, all eight 800 x 1086 artwork loads, direct cover selection, the eight-result search dialog, TypeScript, and the production build.

### 2026-07-14 — Feed card naming cleanup (Codex)

- Removed Frosted Materials from the feed while preserving its existing detail route and source files.
- Renamed feed captions only: Meeting Notification Fluid Springs, Fluid Cards, Interactive Pop-Up, Micro Interactions, Scrollable Scrolling Gallery, Gemini Button, Cohesive Color Systems, Typography Skills, and Road Cup Knockout.
- Left every thumbnail, date, detail page, implementation, and route unchanged.

### 2026-07-14 — Border beam interactive thumbnail and continuous loop (Codex)

- Replaced the feed thumbnail and expanded hero's static field with the same controlled “Ask anything...” form used by the implementation, including the send interaction and feedback animation.
- Refactored the feed card's navigation boundary so its input and send button remain directly interactive while clicks on the surrounding preview/caption still open `/vault/border-beam` without nesting a form inside a link.
- Removed the internal pause/play button and external Toggle motion control. The beam now stays on its infinite CSS loop in the thumbnail, hero, and implementation (while preserving the reduced-motion accessibility fallback); Reset still restores Line + Ocean + 60% and clears the draft.
- Verified feed typing/submission without navigation, surrounding-card navigation, two editable detail-page instances, zero remaining motion-toggle controls, infinite running beam animations, TypeScript, and the production build.

### 2026-07-14 — Border beam editable field refinement (Codex)

- Changed the synchronized Ocean + Line default from 70% to 60% and gave the field, option buttons, strength track, and send control Apple-like continuous/squircle corners with rounded-rectangle fallbacks.
- Reduced stage padding by 4 px on each responsive tier and normalized the component's layout padding and gaps to a 4 px spacing grid.
- Replaced the implementation's static label with a real controlled text input. Non-empty submissions trigger a restrained Phosphor paper-plane flight animation and accessible “Message sent” state; Reset also clears the draft. The feed thumbnail and expanded hero retain a non-interactive but visually identical version so card navigation stays valid.
- Updated the live code and copy prompt to document the editable input, 60% default, corner treatment, and send feedback. Verified typing, submission feedback, keyboard strength behavior, desktop/390/320 geometry, zero horizontal overflow, clean browser logs, TypeScript, and the production build.

### 2026-07-14 — Border beam interactive parity revision (Codex)

- Re-captured the source playground and replaced the static Type/Color labels with the complete interactive option set: Large, Small, Line, Colorful, Mono, Ocean, and Sunset. Ocean + Line + 70% remains the synchronized thumbnail/hero/default state.
- Implemented the source's distinct motion models: Large and Small use a 1.96-second rotating conic beam (with the source's 348 x 66 and 80 x 36 geometry), while Line retains its 3.1-second traveling focal beam. Every selection updates the visible implementation and live config snippet.
- Replaced “Ask Gemini” and its sparkle with “Ask anything...”, and lightened the field from `#1d1d1d` to graphite `#29292b` in the card, hero, and implementation.
- Verified all seven option buttons, dynamic code, pointer/keyboard strength changes, pause position, reset, 390 px and 320 px layouts, synchronized feed previews, clean browser logs, TypeScript, and the production build. Revised evidence is under `artifacts/design-qa/border-beam/revision/`.

### 2026-07-14 — Border beam card (Codex)

- Added `/vault/border-beam` at the top of the feed with a synchronized thumbnail, expanded hero, and interactive implementation based on the Ocean + Line + 70% state of `beam.jakubantalik.com`.
- Rebuilt the observable effect locally as a clean-room React/CSS component: a 348 x 66 px dark Gemini-style button, one-pixel masked blue-violet beam, 3.1-second edge travel, width/edge breathing, glow, bloom, and a reduced-motion fallback.
- Added working pause/play, pointer and keyboard strength control, external toggle/reset controls, self-contained source tabs and copy prompt, source credit, and container-responsive layouts for the vault's desktop, 390 px, and 320 px surfaces.
- Preserved the source component geometry and motion while translating the surrounding playground into the vault's light design system. Reference/implementation comparison and responsive evidence live under `artifacts/design-qa/border-beam/`; browser logs were clean and the production build passed.

### 2026-07-14 — Chief Keef index thumbnail simplification (Codex)

- Added a feed-thumbnail presentation mode that keeps the animated coverflow, active track title, and album while removing the wordmark, version, search/shuffle/filter controls, and Year/Producer/Length table.
- Scoped the mode to the feed card only. The expanded hero and implementation retain the complete interface and behavior.
- Added container-responsive thumbnail geometry so artwork, title, and album fit inside the existing 16:9 card at desktop, 390 px, and 320 px without horizontal overflow or broken images. TypeScript, the production build, and a fresh browser console check passed; evidence is under `artifacts/design-qa/chief-keef-index/thumbnail-2026-07-14/`.

### 2026-07-14 — Chief Keef index interaction parity audit (Codex)

- Re-audited the live reference and reproduced the local failure where the coverflow rail captured the pointer before a cover button could receive its click. Pointer capture now begins only after a real drag threshold, so clicking a neighboring cover selects it while horizontal dragging remains available.
- Made every visible distance tier selectable, added the reference's cover semantics, and changed the wordmark control to toggle list/coverflow view like the source.
- Rebuilt the cover geometry from fresh computed reference values: 1100 px perspective, 120/84/48/12 px depth, 52 degree side rotation, 0.86 scale, viewport-specific spacing, and distance-based image fading. The compact feed preview and expanded implementation inherit the same model.
- Corrected captured metadata for Save Me and Boost. Verified first- and second-neighbor direct clicks, keyboard navigation, search, list/coverflow switching, 390 px and 320 px layouts, non-zero image loads, a clean browser console, TypeScript, and the production build. Fresh evidence is under `artifacts/design-qa/chief-keef-index/audit-2026-07-14/`.

### 2026-07-14 — Chief Keef index card (Codex)

- Added `/vault/chief-keef-index` and placed its synchronized preview card at the top of the feed. The implementation is a clean-room recreation of the visible `chiefkeefindex.com` light interface, built from captured desktop, mobile, search, and filter states rather than copied source code.
- Bundled nine square cover assets under `public/vault/chief-keef-index/` so the thumbnail, expanded hero, implementation, and code/copy payload remain self-contained and visually aligned.
- Implemented the core experience: perspective coverflow, cover selection, keyboard arrows, horizontal swipe, live search and Escape dismissal, shuffle, sort options, light/dark surfaces, and list/coverflow views. The compact feed preview auto-advances unless reduced motion is requested.
- Verified the reference/prototype default and search states at the same 686 x 620 stage, plus 390 px and 320 px responsive layouts, non-zero image loads, keyboard behavior, clean-load console, TypeScript, and the production build. Evidence is recorded in `design-qa.md` and `artifacts/design-qa/chief-keef-index/`.

### 2026-07-14 — Account button swap + exit-transition fix (Claude)

- Julio disliked the slide-arrow interaction; replaced "Download for Mac" with Amicro's "Account" morph (user silhouette → emerald user-with-check, standard 0.5-scale crossfade). Slide-arrow CSS/icons removed everywhere (component, index.css, template, prompt, code tabs, prose).
- Fixed a real animation defect found while verifying: the button renderer was a component defined inside `MicroButtonsDemo`, so its identity changed every render and React remounted all nine buttons on every state change — exit transitions snapped instead of animating. Buttons now render as plain `<button {...btnProps(...)}>` with stable node identity; leave-reversals animate (verified mid-transition at opacity 0.11).
- Verified in app + artifact: hover morph + animated reversal, grid geometry stable, copy payload ships the new source with no slide remnants. Republished.

### 2026-07-14 — Micro buttons behavior rework, 1:1 with Amicro (Claude)

- Julio compared against the Amicro GitHub source and found the behaviors wrong (Download, Sponsor, "all a little bit wrong"). Read the repo as a behavioral spec — the original is **hover-driven**, not click-driven, and my invented state machines (Deploy spinner, Delete arming, Subscribe toggle) don't exist there. Repo has no LICENSE file, so no code was copied: behaviors re-implemented from scratch (spring values/directions are facts), credit kept in prose + Credits row.
- New behavior set, matched 1:1: slide-arrow (leading icon slot collapses while a trailing arrow slot expands — the label slides, button width fixed), sparkle (star drops in from below + two mini stars at 0.05/0.1s delays), morphs (0.5-scale crossfade: cloud→cloud-up blue, moon→sun yellow), Copy Hash (icon→green check + label→"Copied", lingering 500ms after leave), pulse (one heartbeat, pink fill), rotate (180° and back), shake (0.4s bob+wiggle, red), ring (bell→ringing bell orange + red dot on a bouncier delayed spring).
- Architecture: a single `.hot` class stands in for hover so mouse (guarded by `(hover: hover)`), keyboard focus, touch (700ms), the idle ghost-hover loop, and Play-all share identical CSS states; one overshoot bezier `cubic-bezier(0.3, 1.25, 0.5, 1)` approximates the original's spring(600, 25). Labels now use Amicro's ("Download for Mac", "Copy Hash", …); brand icons (Apple/GitHub) substituted with neutral glyphs.
- Verified in app + artifact: slide slot swap, Copied linger, 180° gear, ring dot, play-all (9/9), geometry still fixed under hover/click spam, routes, tsc, zero console errors. Republished.

### 2026-07-14 — Micro buttons stability audit (Claude)

- Julio reported spacing jumps and a "height goes all the way up" bug on click. Geometry audit (per-click grid/button rect diffing) found three real defects, all fixed:
  1. Morphing labels ("Deploying…", "Copied", "Subscribed") resized their buttons and reflowed the whole content-sized grid. Fix: equal fixed grid cells — `repeat(3, minmax(88px, 126px))`, buttons `width: 100%`, morph states centered absolutely — content can no longer move layout.
  2. The height blow-up was artifact-only: the demo's animation trigger class was named `play`, which collided with the artifact template's `.play` playground class (`min-height: 190px`), so clicking slide/star/gear/delete/bell grew that button's row 132→286px. Renamed the trigger to `bt-go` everywhere. **Rule: prefix every demo class — the artifact template owns generic names like `play`, `media`, `card`, `chip`.**
  3. Sparkles were clipped by the pill's `overflow: hidden`; base is now `overflow: visible` (only `.bt-slide` clips, for its hidden arrow), and small containers get a compact variant via `@container (max-height: 150px)` so the grid always fits the mobile feed card.
- Also replaced the heart button's key-remount pop with a class-based replay, and removed the per-button min-widths.
- Verified: every click geometry-stable under spam in both app and artifact, uniform 126px buttons, state machines intact, mobile fit, tsc, zero console errors. Republished the artifact.

### 2026-07-14 — Micro buttons card (Claude)

- Added `/vault/micro-buttons`: nine pill buttons, one per micro-interaction family (slide-arrow, sparkle, morph busy→done, copy-confirm, pulse, rotate, shake+arm, ring, icon toggle), written from scratch in plain React + CSS — no new dependencies. Interaction taxonomy credited to Amicro (amicro.vercel.app, Syed Subhan) in the detail page's prose and credits.
- Styles live in `src/index.css` under the `bt-` prefix; two CSS custom properties (`--bt-speed`, `--bt-pop`) drive the whole set, exposed as playground sliders. Idle loop plays one family every ~2.6s, pausing 6s after interaction; demo clicks stopPropagation so the feed card never navigates.
- Feed card placed at the top; verified per conventions: tsc, deploy/delete/subscribe state machines, feed-click containment, 390px overflow, production build, zero console errors.
- Ported to the published claude.ai artifact (vanilla engine, `#/micro-buttons` view, copy button ships the full component source) and republished at the same URL. Note: the artifact still carries only the five Claude-era cards — the Skills collection and Knockout bracket remain local-only.

### 2026-07-13 — Skills collection

- Added one experiment each for Better Colors, Better Typography, and Better UI.
- Added feed cards and detail routes for all three.
- Credited the exact source folders in `jakubkrehel/skills`.
- Restyled Better UI around the vault's existing tokens, hairlines, radii, and chip controls.
- Made the Better UI detail self-contained with all 13 principles, its review checklist, and a locally bundled snapshot of every upstream skill file pinned to commit `f8a1574`.
- Restyled Better Colors and Better Typography as minimal light-mode previews using the vault's existing surfaces, hairlines, radii, text tokens, and metadata pattern.
- Made both expanded cards self-contained: Better Colors includes 10 principles, thresholds, its review checklist, and all 5 upstream documents; Better Typography includes 19 principles, its review checklist, and all 7 upstream documents.
- Pinned both local skill archives to commit `f8a1574`, with per-folder source and MIT license records, so none of the three skill pages depends on GitHub at runtime.
- Restyled the knockout bracket thumbnail, expanded hero, interactive implementation, navigation, and footer in the same vault-native light appearance.
- Established this shared Claude/Codex handoff file.
