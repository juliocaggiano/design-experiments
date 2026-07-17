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
- A detail page follows: hero, short explanation, interactive implementation, code/copy prompt, reference, credits.
- Feed captions expose each experiment's category. Detail pages expose Home / category / experiment breadcrumbs plus cyclic previous/next navigation.
- Avoid new dependencies when the interaction can be expressed with React, DOM, and CSS already in the project.
- Verify desktop, 390 px, and 320 px layouts, keyboard controls, console errors, and the production build.

## Current custom routes

- `/vault/reactive-dither`
- `/vault/gradient-spin`
- `/vault/scribble-index`
- `/vault/interface-guidelines`
- `/vault/shadcn-attachment`
- `/vault/shadcn-calendar`
- `/vault/shadcn-card`
- `/vault/shadcn-carousel`
- `/vault/shadcn-chart`
- `/vault/shadcn-breadcrumb`
- `/vault/shadcn-bubble`
- `/vault/shadcn-button-group`
- `/vault/shadcn-command`
- `/vault/sonner`
- `/vault/skill-design-eng`
- `/vault/skill-animation-vocabulary`
- `/vault/skill-improve-animations`
- `/vault/skill-animation-opportunities`
- `/vault/skill-review-animations`
- `/vault/skill-apple-design`
- `/vault/animation-principles`
- `/vault/card-resize`
- `/vault/number-pop-in`
- `/vault/notification-badge`
- `/vault/text-states-swap`
- `/vault/menu-dropdown`
- `/vault/modal-open-close`
- `/vault/panel-reveal`
- `/vault/page-side-by-side`
- `/vault/icon-swap`
- `/vault/success-check`
- `/vault/avatar-group-hover`
- `/vault/error-state-shake`
- `/vault/input-clear`
- `/vault/skeleton-loader-reveal`
- `/vault/texts-reveal`
- `/vault/tabs-sliding`
- `/vault/shimmer-text`
- `/vault/tooltip-open-close`
- `/vault/3d-tilt`
- `/vault/dropdown-menu-morph`
- `/vault/accordion`
- `/vault/thinking-state`
- `/vault/thinking-reasoning`
- `/vault/ai-web-search`
- `/vault/ai-file-diff`
- `/vault/ai-image-generation`
- `/vault/ai-text-response`
- `/vault/ai-streaming-text`
- `/vault/ai-inline-citations`
- `/vault/ai-code-block`
- `/vault/ai-task-list`
- `/vault/ai-data-table`
- `/vault/ai-comparison-table`
- `/vault/playwright-cli`
- `/vault/cuelume`
- `/vault/border-beam`
- `/vault/chief-keef-index`
- `/vault/micro-buttons`
- `/vault/better-colors`
- `/vault/better-typography`
- `/vault/better-ui`
- `/vault/knockout-bracket`
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
