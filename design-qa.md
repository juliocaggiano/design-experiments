# Batch 14: black-circle favicon + 2× mobile card thumbnails — 2026-07-21

## Scope and visual truth

- (1) FAVICON — new `public/favicon.svg`: a single solid black circle (64×64 viewBox, r=30), referenced from `index.html` via `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`. No other head changes; title stays "Vault".
- (2) MOBILE THUMBNAILS — one global rule in `src/index.css`: under 640 px, every `.aspect-[1344/520]` stage renders at `aspect-ratio: 1344 / 1040` (exactly 2× taller). The rule is unlayered author CSS, so it beats the Tailwind v4 layered utility without touching any of the ~20 call sites in `src/App.tsx` / `src/demos/*`. Desktop ratio is byte-identical to before; feed cards and detail heroes share the same stage class, so both get the taller mobile treatment from one line.

## Verification

- `tsc -b`: 0 errors. Production build: pass (pre-existing chunk-size advisory only).
- `scripts/verify-mobile-thumbs.mjs` (new): 9/9 — favicon link present, SVG served 200 and is a black circle, desktop stage h/w 0.387 (unchanged ≈520/1344), mobile stage h/w 0.774 (≈1040/1344 = 2×), zero horizontal overflow at 390/320 px, zero console errors on both viewports.
- Visual pass over `artifacts/design-qa/mobile-thumbs-2026-07-21/`: mobile-feed-390 shows the Liquid Dither thumbnail tall and legible with the new caption layout intact; desktop-feed unchanged.
- Dev server started per session with `--host 127.0.0.1 --strictPort` and killed afterward; port 5173 confirmed free.

final result: passed

# Batch 13: Fluid Cards revert (batches 11–12 undone per owner) + Scroll Gallery cover swap — 2026-07-20

## Scope and visual truth

- (1) FLUID CARDS — batches 11–12 for this card were REVERTED at the owner's request, verbatim: "I just want the fluid interface, not the toggle. both for the implementation card and the thumbnail, just keep the fluid card (the one with the little blue circle moving around the canvas)". Deleted `src/demos/FluidSpringToggle.tsx` + `.css` (the shared toggle engine introduced in batch 12) and `scripts/capture-batch12.mjs`; `src/pages/FluidSpringsDetail.tsx` restored to the single draggable-card stage + controls with the pre-batch-12 hero prose ("The card above is a real physical object…"); the feed thumbnail in `src/App.tsx` renders `<FluidSpringDemo />` again exactly as before batch 11. One engine, no feed/detail divergence anywhere on this card. Zero `FluidSpringToggle`/`FluidToggleThumb`/`.ft-*` references remain in src/ (historical `scripts/capture-batch11.mjs` keeps a now-inert `.ft-thumb` probe that warns and skips; its other targets remain valid). The batch-11 pinned feed order is unaffected — Fluid Cards stays in slot 8.
- (2) SCROLL GALLERY — the eight placeholder covers (fictional 2026 issues) were replaced with the owner's nine-issue list, in the exact given order. Source: each issue page on newyorker.com; the cover asset was taken from og:image (media.newyorker.com master transform), and every cover credit ("Title," by Artist) was extracted from the same page and verified to sit adjacent to the same photo id in the page JSON — so each image is provably the credited front cover, not a story illustration. Masters were center-cropped to the 800x1086 pipeline aspect (max crop: 73px of 2245 on the 2016 PNG) and re-encoded JPEG q85 — identical format/dimensions to the old files. The nine slots: 1. "No Photos, Please!" Anita Kunz (Aug 29, 2022); 2. "Uvalde, May 24, 2022" Eric Drooker (Jun 6, 2022); 3. "Summer Treat" Mark Ulriksen (Aug 9, 2021); 4. "Making Mischief" Ana Juan (May 23, 2022); 5. "Here's Looking at You" Anita Kunz (Jul 3, 2000); 6. "Rat Race" Peter de Sève (Dec 5, 2016); 7. "The Face of Justice" Anita Kunz (Jul 22, 2024); 8. "Making Mischief" again — the owner's list includes May 23, 2022 twice; kept, with a distinct record id `making-mischief-redux` sharing the same artwork file; 9. "Fighting Back" Barry Blitt (Oct 24, 2011). Story notes are new honest one-liners written from the verified artwork. DEFAULT_ID is now `heres-looking-at-you` (the middle of the nine). The old eight jpgs were removed from `public/vault/scrollgallery/`; no other file referenced them. The detail page's attribution ("Cover titles, artists, dates, and artwork: The New Yorker cover archive") remains accurate as-is.

## Verification

- `tsc -b`: 0 errors. Production build: pass (pre-existing chunk-size advisory only).
- `verify-feed-card-design.mjs`: 23/23. `verify-detail-order.mjs`: 167/167. `verify-direct-card-actions.mjs`: pass. `verify-reactive-dither.mjs`: 21/21. No dedicated fluid-springs or scroll-gallery suites exist; `scripts/capture-batch13.mjs` adds smoke checks: zero `.ft-stage` on the fluid detail page, all 8 cover assets serve 200, the detail coverflow renders exactly 9 covers whose img srcs match the requested order (duplicate at slots 4 and 8).
- Visual pass over `artifacts/design-qa/batch13-2026-07-20/`: fluid-detail-top-restored (single stage, controls, reverted prose), fluid-feed-card-restored (blue-dot card), scrollgallery-feed-card + scrollgallery-detail (new covers, active = Here's Looking at You with correct issue/artist/story rows), covers-grid-9-in-order (3x3 contact sheet in the owner's order).
- Dev server was started per session with `--host 127.0.0.1` and killed afterward; port 5173 confirmed free.

final result: passed

# Batch 12: spring toggle becomes a real detail specimen — one engine for feed + detail — 2026-07-20

## Scope and visual truth

- User feedback on batch 11: the Fluid Cards feed thumbnail (spring toggle) previewed content that did not exist on the detail page — "the thumbnail showing the wrong thing". Fix: the toggle is now the LEAD specimen on /vault/fluid-springs, and feed + detail share ONE engine.
- `src/demos/FluidSpringToggle.tsx` + `.css` replace batch-11's `FluidToggleThumb.*` (deleted). Same geometry (track 144x72, stadium thumb 72x48, travel 48px), same motion (350ms cubic-bezier(0.34,1.35,0.64,1), 55% overshoot / 80% recovery / 100% settle), same grayscale styling, same state machine (on/cycle/init, key-remount restarts keyframes, data-init gates first-mount animation). Two modes: `idle` (feed thumbnail — non-interactive, 35% IntersectionObserver gate, 2.6s auto-flip, instant settle offscreen, reduced-motion ON end state) and `button` (detail — real `<button aria-pressed>`, click/Enter/Space flips with the same double-bounce, focus-visible ring; reduced motion flips instantly because the CSS animation is stripped and the base translate applies). Track keeps the reference's instant 0ms color flip in both modes.
- Detail page layout: the toggle stage leads (same rounded-border stage chrome as the existing demo), the draggable-card stage + ControlsSection (Flick/Reset + Damping/Response/Decel sliders) stay intact below — no toggle controls forced into the panel (the toggle needs none). Hero prose touched up in place: "The toggle up top is the same spring in miniature: click it and the thumb rides one 350ms double-bounce to the other side — overshoot, breathe back, settle. The card below is a real physical object: …" ("The card above" was no longer accurate).
- Batch-11 "thumbnail-only divergence" notes removed where superseded: the FluidToggleThumb header comment went with the deleted file; the EmilSkillsDemo.css cross-reference ("same batch as the Fluid Cards toggle thumb") dropped — the Design Engineering fintech thumb remains the only documented feed/detail exception. Batch-11 log entries left as history; this entry supersedes.
- Feed card render is byte-identical behavior: `<FluidSpringToggle mode="idle" />` in `App.tsx`.

## Verification

- `tsc -b`: 0 errors. Production build: pass (pre-existing chunk-size advisory only). Zero `FluidToggleThumb` references remain.
- `verify-feed-card-design.mjs`: 23/23. `verify-detail-order.mjs`: 167/167. `verify-direct-card-actions.mjs`: pass. No dedicated fluid-springs suite exists; an ad-hoc Playwright check verified the detail toggle: starts off, click flips (aria-pressed true, thumb settles at exactly 48px), second click flips back, Enter flips from keyboard focus, reduced-motion flip is instant (animationName none at 60ms, already at 48px), zero console errors.
- Visual pass over `artifacts/design-qa/batch12-2026-07-20/`: detail-toggle-off (fresh state), detail-toggle-mid-flight (thumb at 8.7px into the double-bounce on the dark track), detail-toggle-on, detail-top (toggle stage leading, card stage + controls below, updated prose), feed-card-unchanged (idle thumbnail visually identical to batch 11).
- Dev server was started per session with `--host 127.0.0.1` and killed afterward; port 5173 confirmed free.

final result: passed

# Batch 11 five-item change batch: fluid toggle thumb, fintech DE thumb, filled bell, pinned feed order, Gradient Button — 2026-07-20

## Scope and visual truth

- (1) Fluid Cards (/vault/fluid-springs) feed thumbnail is now a spring toggle modeled on transitions.dev `?t=toggle` (characterized in `scripts/recon-batch11-toggle.mjs` + `artifacts/design-qa/batch11-2026-07-20/ref/`): stadium thumb, 350 ms `cubic-bezier(0.34, 1.35, 0.64, 1)`, keyframes 0/55/80/100 with ~11% overshoot at 55% and a small recovery at 80% (measured reference: ±1.63 px over 14.66 px travel). New `src/demos/FluidToggleThumb.tsx` + `.css`; geometry = reference at ~3.3x (track 44x22 -> 144x72, thumb 22x14.67 -> 72x48, inset 3.67 -> 12, travel 14.66 -> 48). Grayscale: their blue on-state `rgba(0,60,255,.8)` becomes `var(--text-primary)`; track flips instantly (reference track duration is 0 ms). Idle flip every 2600 ms, gated by a 35% IntersectionObserver (same idiom as the emil thumbnails); leaving the viewport strips `data-init` so the thumb settles instantly and never replays on re-entry (per-flip remount via `key={cycle}` restarts keyframes, mount never animates). Reduced motion: no loop, settled ON end state (vault convention, verified: data-on=true, animation none, translate 48px). Non-interactive (`aria-hidden`), the feed card stays the only link. DETAIL PAGE UNCHANGED — it imports `FluidSpringDemo` directly; thumbnail-only divergence, documented as the intended exception. Interpretation: ~3.3x scale (reference 44x22 is a control, the thumbnail is a hero) and the grayscale on-state.
- (2) Design Engineering feed thumbnail is now the Pinterest banking-UI composition (`ref/pinterest-banking-app.jpg`, 1179x1055): gray header card (avatar circle + black diamond glyph, "Matango Inc" / muted email, right-aligned bold $11,000.00) overlapped by a white rounded card (soft shadow) carrying segmented rows Bank|Card|Pay Later (Pay Later = black pill) and 30|60|90|Days (30 = black pill), then Fee 1.6% / $176.00 and Total / $11,176.00. New static `DesignEngineeringThumb` inside `EmilSkillsDemo.tsx` (compact branch only) + `.de-*` styles in `EmilSkillsDemo.css`; all grayscale (the reference's only color, a lavender avatar, became a #d9d9d9 circle). Static by design — the reference is a still UI frame, so no autoplay loop and reduced motion is trivially satisfied; it renders inside `.ek-stage` so the shared container-query scaling handles small stages. Detail page (interactive button-feedback specimen) UNCHANGED — second documented feed/detail exception this batch. QA updates in `verify-emil-skills.mjs`: static-composition assertion (exactly one `.de-thumb`, zero interactive controls) and reduced-motion now checks the composition renders.
- (3) Notification badge bell is now FILLED everywhere: `TransitionDemo.tsx` `<Bell size={21} weight="fill" />` — one component (`NotificationBadge`) serves both thumbnail and detail; motion untouched.
- (4) Feed order: the first nine cards are pinned — reactive-dither, number-pop-in, meeting-overlay, shimmer-text, tabs-sliding, ai-streaming-text, ai-web-search, fluid-springs, chief-keef-index — via picks out of the catalog-derived arrays in `App.tsx` (`FEED_CARDS` only; catalogs and `VAULT_ITEMS` nav order untouched; picked entries filtered out of their spreads, total still 36). Everything after keeps its previous relative order.
- (5) /vault/border-beam renamed "Gemini Button" -> "Gradient Button" (vault-config title — the detail h1 flows from it — plus the App.tsx caption + aria-label; zero `Gemini` refs remain in src/ and scripts/). Defaults now `strength: 8`, `color: 'stone'` (`BORDER_BEAM_DEFAULTS`); beam stays polychromatic-capable (no forced b/w), light-mode treatment untouched; hero prose updated to "quiet stone treatment at 8% strength".

## Verification

- `tsc -b`: 0 errors. Production build: pass (pre-existing chunk-size advisory only).
- `verify-feed-card-design.mjs`: 23/23 (+1 new assertion: first nine cards match the pinned order; 36/36 rich captions intact). `verify-liquid-connector.mjs`: 38/38. `verify-detail-order.mjs`: 167/167. `verify-reactive-dither.mjs`: 21/21. `verify-emil-skills.mjs`: pass (updated for the static thumbnail). `verify-direct-card-actions.mjs`: pass (36 captions). `verify-aicss.mjs`, `verify-design-engineering.mjs`, `verify-thinking-reasoning-thumbnail.mjs`: pass. Reduced-motion toggle check: settled ON, no animation.
- Visual pass over `artifacts/design-qa/batch11-2026-07-20/`: feed-top (pinned 1-2 = Liquid Dither, Number pop-in), fluid-toggle-thumb (off) + mid-flight (on-track, thumb at 16.6 px), de-thumb vs reference, notification-badge (filled bell), gradient-button-feed + detail (h1 Gradient Button, Strength 8%, Stone selected). Capture fix: interactive LinkCards expose only an sr-only 1x1 anchor — element shots must target `article:has(a[href])` first (patched into `scripts/capture-batch11.mjs`).
- Dev server was started per session with `--host 127.0.0.1` and killed afterward; port 5173 confirmed free.

final result: passed

# Batch 10 annotated-screenshot changes: LC feed size + white stage, tab-bar↔card alignment, Card demo unclipped — 2026-07-19

## Scope and visual truth

- Four annotated items from Julio, all measurement-driven (`scripts/probe-batch10.mjs`).
- (1) LC feed thumbnail reduced. Key measurement: the compact stage (668×257, ratio 2.585) is wider than the demo's 520/300 (1.733), so the svg always letterboxed height-bound at 0.857 scale — the brief's literal "extend the 520 px cap" would have been a visual no-op. The annotation's red box (≈34% of card width) is the operative target: `.lc-demo--compact` is now a flex-centering stage (still full-width) with `.lc-stage { width: min(520px, max(34%, 180px)); height: auto; max-height: 100% }` — 227.1 px (34.0%) centered at 1440, 180 px floor at 390/320, never above native. Interpretation documented in the CSS comment.
- (2) Tab bar ↔ first card alignment. Measured: first card outer left = 376 = headline; the batch-9 −4 px pill-inset nudge had moved the bar to 372. Fix at the source: wrapper `-ml-2` → `-ml-1`, so tablist.left = 376.0 = card 376.0 exactly. QA now asserts tablist vs FIRST CARD (not headline − 4).
- (3) LC stage background #f2f2f2 → `var(--bg-page)` (#fcfcfc, the standard feed-card stage white) in the single `.lc-demo` rule — both feed and detail instances, one visual default. On #fcfcfc the #fdfdfd surface is one luminance step away, so separation rides on the shadow; recalibrated `drop-shadow(0 1px 2px rgba(20,23,28,0.08))` + `drop-shadow(0 8px 20px rgba(20,23,28,0.11))` (from 0.05/0.06, grays only, still no hairline strokes). QA asserts feed/demo bg === stage container bg, detail bg === frame bg, and the new shadow alphas.
- (4) Card demo (shadcn login) thumbnail clipping. Root cause: `.sx-preview`'s auto-sized grid track top-anchors the 384×368 specimen (the calendar demo had the same drift bug), so even a fitting scale overflowed the bottom — 42.5 px at 1440 ("cut off mid-button"), 41 px at 390. Fix: absolute center anchor (`position: absolute; top/left 50%; translate: -50% -50%`) + a card-specific scale ladder (0.5 @ ≤260 cqh, 0.4 @ ≤205, 0.22 @ ≤150, 0.16 @ ≤110 — the card's natural height grows to ~387 px at 230 px width, needing the extra rung). Detail page unchanged (transform none, full 368 px surface). Bonus fix in passing: the primary "Login" button rendered black-on-black — `.sh-demo button { color: inherit }` (0,1,1) beat `.sx-button-default` (0,1,0); the variant rule is now `.sh-demo .sx-button-default` (pre-existing bug, confirmed by computed style rgb(23,23,23) on rgb(23,23,23) → now #fafafa on #171717).

## Verification

- `tsc -b`: 0 errors. Production build: pass (pre-existing chunk-size advisory only).
- `verify-liquid-connector.mjs`: 38/38 (+4: compact cap ≈34% centered, feed stage white, detail stage white, recalibrated shadow). `verify-feed-card-design.mjs`: 22/22 (tab-bar assertion switched to first-card edge; +3 login-surface-fits checks at 1440/390/320). `verify-detail-order.mjs`: 167/167. `verify-reactive-dither.mjs`: 21/21. `verify-direct-card-actions.mjs`: pass.
- Visual pass over `artifacts/design-qa/batch10-2026-07-19/`: bar↔card alignment, LC thumbnail reduced on white with clean shadow separation (1440 + 390), LC detail on white, full login surface at 1440/390 + detail top, readable Login button. Measurements: tablist 376.0 = card 376.0; LC compact 227.1 px = 34.0%, offsets 0.0/0.0; card fit margins 36.5/18.1/6.3 px at 1440/390/320.
- Dev server was started per session with `--host 127.0.0.1` and killed afterward; port 5173 confirmed free.

final result: passed

# Batch 9 annotated-screenshot changes: spacing, tab bar, LC panel cap, Codex swap, SliderChip ports — 2026-07-19

## Scope and visual truth

- Seven annotated items from Julio. (1) Detail title→frame gap 40→36 px (`detail-kit` article `gap-10`→`gap-9`, rule of four). (2) The hairline under the "Description" controls header is gone (`border-b` dropped, `pb-2` kept). (3) Feed tab bar nudged 4 px left (`-mx-1 px-1` → `-ml-2 -mr-1 pl-1 pr-1`): measurement showed the bar's border already aligned with the headline; the perceived inset was the active pill's 1 px border + 4 px padding, so the bar shifts left and the pill's content edge now lands exactly on the column (tablist 372 vs headline 376 at 1440).
- (4) Liquid Connector detail playground is capped at its native 520 px viewBox width and centered in the full-width gray panel (`.lc-demo--playground { aspect-ratio: auto }` + stage `width: min(520px,100%); height: auto; margin-inline: auto`). 520 is the true native viewBox/host width (not the 522 measured with borders). The feed compact thumbnail is untouched. QA asserts 520 px + 0.0 px center offset at 1440.
- (5) `LIQUID_GEOMETRY` corner radii tuned engine-wide: outputRadius 34→24, inputRadius 31→22. This voids the "vendored byte-identical" claim — the detail footer now reads "MIT, path solver vendored — corner radii tuned 24/22". Fused (−5) and contained (−28) states re-captured; the merged dissolve (opacity/scaleY per upstream frame math) matches batch-8 renders 1:1.
- (6) Sample content swapped Notion→Codex: provider name, and the tile mark is an ORIGINAL vector redraw (arc-constructed 8-lobed ring + terminal `>_`), verified against the official Codex icon in OpenAI's ChatGPT.app bundle (`codex-ref/official-icon.png`) — no OpenAI artwork copied. NOTICE trademark paragraph, detail credits row, and prose updated; zero `Notion` references remain in `src/`.
- (7) The three custom range/switch implementations (`lc-`, `rd-`, `bb-`) are replaced by the shared `SliderChip`/`SwitchChip` bars from `detail-kit` (MeetingOverlay reference style): 5+switch, 7+switch, and 1 slider respectively. Behavior preserved — gap scrub stays immediate (asserted), reset restores exact defaults (asserted via `aria-valuetext`), radio rows and roles untouched. Per-control rounding keeps readouts stable. Old `.lc-range*/.rd-range*/.bb-slider*` CSS deleted; `rd-controls`/`bb-panel` wrappers slimmed to avoid specificity fights with the Tailwind grid.

## Verification

- `tsc -b`: 0 errors. Production build: pass (pre-existing chunk-size advisory only).
- `verify-liquid-connector.mjs`: 34/34 (+3 checks: Codex name, glyph, 520 px cap/centering; slider drives moved to click + arrow-nudge on `role="slider"`). `verify-detail-order.mjs`: 167/167 (+16 article-gap 36 px, +12 divider-free Description headers). `verify-feed-card-design.mjs`: 19/19 (+1 tab-bar alignment). `verify-reactive-dither.mjs`: 21/21. `verify-direct-card-actions.mjs`: pass.
- Visual pass over `artifacts/design-qa/batch9-2026-07-19/`: tab alignment, 36 px title gap, divider-free header, centered 520 px stage, Codex tile at 31 px, fused/contained seam states, and SliderChip style parity with MeetingOverlay all confirmed. Live probe: connector-card opacity/scaleY at gap 10/−5/−28 = 1 / 0.299·0.858 / 0 — upstream dissolve math unchanged.
- Dev server was started per session with `--host 127.0.0.1` and killed afterward; port 5173 confirmed free.

final result: passed

# Liquid Connector reworked to upstream 1:1 — 2026-07-19

## Scope and visual truth

- Julio compared the port with the upstream demo video and listed seven deltas (broken feed thumbnail, merged-look default, hairlines → soft shadows, Connect pill + round send button, idle focus ring, interaction triggers, dual credits). Findings and fixes:
- Root-cause bug, present since the initial port: `lc-` namespacing raised specificity, so `.lc-demo button` (0,1,1) overrode `.lc-send`'s `position: absolute` and `.lc-connect`'s blue border. The send button rendered as a gray tab at the prompt's top-left — batch 7's QA note misidentified it as "upstream's peel notch". Fixed with `.lc-demo`-prefixed selectors (0,2,0); Connect regained its `#ccd9f2` border and the round send button sits bottom-right.
- Batch-7 "peel notch" correction: upstream has no rest-state notch. Ground-truthed by running the upstream demo (`/tmp/liquid-connector`) in Playwright: settled −28 and hidden states are prompt-only; the video's fused waist exists only mid-scrub. The port matches all three upstream states in layout.
- Ambient idle loop removed (upstream has none — verified in its `index.html`); the Rest gap slider scrubs with `{ immediate: true }` like upstream's range input; stage is `#f2f2f2` with borderless white surfaces lifted by a calibrated drop shadow (`0 1px 2px rgb(20 23 28/.05)`, `0 8px 20px rgb(20 23 28/.06)`) instead of hairline strokes; blue outline only under `:focus-within`; default stays upstream `open` + `gap=10`.
- `verify-liquid-connector.mjs` 28 → 31 checks: ambient assertions inverted (card visible by default, no self re-open over 9 s, freeze, untouched re-entry), added strokes-removed/drop-shadow and immediate-scrub assertions, deterministic settled captures (element screenshots after `scrollTo(0,0)` — the switch click scrolls the page).

## Verification

- `tsc -b`: 0 errors. Production build: pass (pre-existing chunk-size advisory only).
- `verify-liquid-connector.mjs`: 31/31. `verify-detail-order.mjs`: 139/139 (16 routes). `verify-feed-card-design.mjs`: 18/18. `verify-reactive-dither.mjs`: 21/21.
- Visual pass over `artifacts/design-qa/liquid-connector-2026-07-19/` (feed-card, detail-top, detail-fused, detail-closed, detail-controls) against upstream ground-truth captures (default / settled −28 / hidden): layout matches 1:1; surfaces intentionally swap hairlines for a soft shadow per the brief.
- Dev server was started per session with `--host 127.0.0.1` and killed afterward; port 5173 confirmed free.

final result: passed

# Controls pulled under the frame, section renamed Description — 2026-07-19

## Scope and visual truth

- Julio scribbled two changes on the "Don't Miss Meetings" detail page; applied to every page. (1) The controls block now sits directly under the implementation frame: each page's frame block + `ControlsSection` is wrapped in a nested `flex min-w-0 flex-col gap-6` (24 px, rules of four) inside the main `gap-14` column; all other sections keep the 56 px rhythm. (2) The controls heading reads "Description" instead of "Controls" (`ControlsSection` in `detail-kit.tsx`, header comment updated; Remix/Replay/etc. chips stay right-aligned in the header row).
- Applied at 12 render spots: MeetingOverlayDetail, ReactiveDitherDetail, BorderBeamDetail, LiquidConnectorDetail, FluidSpringsDetail, MaterialsDetail, SheetDetail, MicroButtonsDetail, OpticalTypeDetail, `EmilSkillImplementation` (shared by the standalone Emil page and the Design Engineering umbrella), and both SkillDetails components. DesignEngineeringDetail has no `ControlsSection` of its own and inherits the wrap. Wrappers inserted without re-indenting inner content, per the brief.
- `verify-detail-order.mjs`: heading assertions renamed to "Description", plus a new assertion that frame + controls are the only two children of a 24 px-gap wrapper (12 controls routes). Parent-container gap deliberately not asserted (umbrella nesting would make it fragile).

## Verification

- `tsc -b`: 0 errors. Production build: pass (pre-existing chunk-size advisory only).
- `verify-detail-order.mjs`: 139/139 (16 routes; +12 grouping checks). `verify-feed-card-design.mjs`: 18/18. `verify-reactive-dither.mjs`: 21/21. `verify-emil-skills.mjs`, `verify-design-engineering.mjs`: pass. `verify-liquid-connector.mjs`: 28/28.
- Visual pass over `artifacts/design-qa/batch7-2026-07-19/meeting-overlay-top.png`: frame → 24 px → "Description" header with Remix/Replay chips → controls panel → 56 px → prose, exactly as scribbled.
- Dev server was started per session with `--host 127.0.0.1` and killed afterward; port 5173 confirmed free.

final result: passed

# Nav rework and Liquid Connector card — 2026-07-18

## Scope and visual truth

- Every `DetailShell` page lost its breadcrumb trail and its `Implementation` h2 + hairline. The header nav is now three matching bordered chips: two separate prev/next links (`rounded-[10px] border`, 32 px square) inside a borderless `nav[aria-label="Browse experiments"]`, plus a bordered Close chip. Action chips moved into the `ControlsSection` header via a new `actions` prop (Reset / Remix / Replay / Flick / Open / Dismiss / Pulse / Play all / Breathe / Search / Shuffle depending on the page); control-free pages keep chips in a bare right-aligned row on the frame. Verified on all 16 ordered routes.
- New card #36, `/vault/liquid-connector` (Motion): a React port of zanwei's MIT-licensed `liquid-connector-web-component` — an output card (Notion MCP connector sample) peels off a prompt card with a liquid coupling seam rendered as ONE generated SVG path per frame (no filters, masks, or canvas). The upstream path solver is vendored byte-identical (`src/demos/liquidPath.js` + adjacent `.d.ts`); the component state machine (spring 1200/38, measured ~0.39 s open/close transitions, merge/detach hysteresis, tear age/strength, strain, blur, ±2 px smear clones) mirrors the upstream custom element as plain DOM + refs. Upstream colors kept 1:1. Vault lifecycle: 35 % visibility gate, idle peel/merge every 4 s yielding 5 s to interaction, instant settle under reduced motion. Feed card uses the `interactive` LinkCard pattern, so Skip/Connect work inside the thumbnail.
- Controls on the detail page: reference-row sliders for Rest gap (−60…10 px), Detach gap (6–9.8), Peel transition (1.5–8), Coupling radius (4–48), Peel pull (0–8), an open switch row, and a Reset chip in the Controls header. LICENSE + NOTICE bundled (`src/content/liquid-connector/`) and shown as Code tabs.
- Port deviations (deliberate): no shadow DOM / custom element / CustomEvents, no debug overlay, no frame-event stream; Connect closes the card and submit clears the prompt (upstream only fires events); Skip keeps upstream focus+close. Real bug fixed during QA: the send button's imperative `disabled` write was stomped by idle-loop re-renders — it is now React state.

## Verification

- `tsc -b`: 0 errors. Production build: pass (pre-existing chunk-size advisory only).
- `verify-liquid-connector.mjs` (new): 28/28 — thumbnail renders open and settled, Skip closes without navigating, idle re-opens after interaction quiets, offscreen freeze (no toggles, no repaints), re-entry resume, direct-load h1, generated path, 5 ranges + switch + header Reset, rest-gap and coupling-radius live re-solve (coupling asserted at a shallow −5 px bridge where the seam is sensitive), open-switch peel/re-merge, reset restores 10 px + open, send enables with text and clears on submit, reduced-motion instant settle with the idle loop disabled, zero console errors, no overflow at 1440/390/320 px (feed + detail).
- `verify-detail-order.mjs` (rewritten for the nav contract): 127/127 across 16 routes — order sequence without the Implementation marker, no breadcrumbs, prev/next as two bordered chips on a borderless nav, bordered close, action chips in the Controls header (materials correctly marked orphan: hidden page, no `VAULT_ITEMS` entry, no prev/next). `verify-reactive-dither.mjs`: 21/21 (pointer check scrolls the canvas into view — frame now sits above controls). `verify-feed-card-design.mjs`: 18/18 (coverage 36/36). `verify-direct-card-actions.mjs`: pass (36 captions, 10 transitions). `verify-emil-skills.mjs`, `verify-design-engineering.mjs`, `verify-aicss.mjs`: pass.
- Visual pass over `artifacts/design-qa/liquid-connector-2026-07-18/`: feed card (closed state with the peel nub), detail top (new nav chips + stage + caption), controls panel (rows, switch, Reset chip), closed state. The small tab at the prompt card's top-left corner is upstream's rest-state peel notch, not a defect.
- Dev server was started per session with `--host 127.0.0.1` and killed afterward; port 5173 confirmed free.

final result: passed

# Reference-style sliders and expanded-page reorder — 2026-07-18

## Scope and visual truth

- All `type="range"` controls restyled to the reference panel look (`artifacts/design-qa/slider-ref-2026-07-18/reference.jpg`): one 44 px rounded row on `#f7f7f7` per setting; the filled portion is a solid `#ebebeb` block anchored left with the label inside it, a thin 3×18 px `#a6a6a6` handle marks the fill edge, the formatted value sits right-aligned in the unfilled area, and five 3 px tick dots span each track. A real `<input type="range">` overlays each row (opacity 0) as the interaction/keyboard/a11y layer; fill and handle positions derive from `(v−min)/(max−min)` through a CSS custom property. Fully monochrome — the reference's orange swatch was excluded per the brief.
- `ReactiveDitherDemo` was split for the new layout: exported `ReactiveDitherSettings`/`REACTIVE_DITHER_DEFAULTS`, optional `settings`/`onSettingsChange` controlled props, `chrome: 'full' | 'stage'`, and an exported `ReactiveDitherControlPanel` (7 reference rows + invert as a `role="switch"` light-gray toggle row). `BorderBeamDemo` got the same treatment (`BorderBeamSettings`/`BORDER_BEAM_DEFAULTS`, `chrome`, `BorderBeamControlPanel`: Type and Color chip rows + Strength slider row in the same 44 px shape; `.bb-stage-only` drops the full-mode min-height). Compact/feed rendering unchanged in both.
- Every expanded page reordered to: title/nav → Implementation frame (reset/replay chips on the frame) → Controls → description (+guides) → Code/copy → Credits/reference. The duplicate top hero preview was removed on all 15 page files — each duplicated the implementation component, so no hero was kept. New shared `ControlsSection` in `detail-kit.tsx`. Tray pages (Meeting Overlay, Fluid Springs, Sheet, Materials, Micro Buttons, Optical Type, Better Colors, Better Typography) detached their `-mt-5` trays into standalone Controls sections; `EmilSkillImplementation` renders Implementation + Controls for both the standalone Emil page and the Design Engineering umbrella (umbrella intro moved below the playground, section summaries became captions); Transition/AiCss/Shadcn/Scrollgallery are hero-out reorders without Controls; Better Typography's guide moved below Implementation+Controls. OpticalTypeDetail stays unrouted, reordered for consistency.

## Verification

- `tsc -b`: 0 errors. Production build: pass (pre-existing chunk-size advisory only).
- `verify-feed-card-design.mjs`: 18/18. `verify-reactive-dither.mjs`: 21/21 (selectors updated for the new controls DOM; new fill-block width assertion — fill 559 px of 654 px after setting spacing 9). `verify-aicss.mjs`: pass (5 cards × 3 viewports, single shared implementation). `verify-direct-card-actions.mjs`: pass (35 captions, 10 transitions). `verify-emil-skills.mjs`, `verify-design-engineering.mjs`: pass. New `verify-detail-order.mjs`: 49/49 — 15 routes assert Implementation → Controls (when present) → description → Code (when present) → Credits document order, no Controls on control-free pages, and no hero frame outside the Implementation section (SkillsLab demos legitimately use the aspect frame as their stage).
- Visual pass over `artifacts/design-qa/batch5-2026-07-18/` (new `scripts/capture-batch5.mjs`): dither and border-beam control panels at 1440/390/320 px match the reference — labels on the fill block, handles at the fill edge, values right, switch row quiet; reordered page tops (dither, border-beam, card-resize) open on the Implementation frame with Controls below.
- Dev server was started per session with `--host 127.0.0.1` and killed afterward; port 5173 confirmed free.

final result: passed

# Two cards deleted (35 total), tooltip ~1.8× scale-up, accordion + calendar vault-token restyle, streaming-text thumbnail autoplay — 2026-07-18

## Scope and visual truth

- `success-check` and `scribble-index` fully removed: catalog/vault-config entries, feed card, route branch, `SuccessCheck` specimen + `.td-success*` CSS, `ScribbleIndexDetail.tsx`, `ScribbleIndexDemo.tsx`/`.css`, and the direct-card-actions block. Feed now renders 35 cards: 12 transitions, 5 AI-CSS, 1 standalone Emil skill, 7 shadcn, 10 standalone.
- Tooltip open/close specimen scaled ≈1.8×: trigger 38→68 px tall, font 11→18 px, padding 14→28 px, radius 11→20 px; tooltip copy 9→16 px, padding 6/9→12/16 px, radius 8→14 px, offset 9→16 px, arrow 7→12 px. Open/close behavior and timing untouched; no overflow at 1440/390/320.
- Accordion restyled on the vault design system: inherited neueMontreal, `--text-primary/secondary/tertiary`, `--border-line`, `--bg-hover`, rules-of-four rhythm (52 px trigger, 40 px rows, 16/12 px padding), phosphor `Users`/`UserCircle` icons, bold `CaretDown`, checked-row emphasis via `:has(input:checked)`. Grid-row mechanics, radio group, and keyboard support identical — visual only.
- shadcn Calendar restyled on vault tokens (neueMontreal replacing Geist for this specimen, text tokens, `--border-line`, quiet monochrome selected = `--text-primary` fill, today = `--bg-hover` + inset hairline, 32 px cells, 12 px padding/gaps, 13/11 px type). Compact thumbnails re-anchored: `.sx-native` is now absolutely centered with `translate: -50% -50%` plus a 0.3 scale step under 150 px container height — fixes the pre-existing drift that left the calendar clipped at 390 px and fully blank at 320 px. Detail hero uses the same component, so thumbnail and detail stay synchronized.
- Streaming Text compact thumbnail now animates per vault convention: IntersectionObserver ≥35% visibility gate, timers cancelled and text reset offscreen, replay on re-entry, reduced-motion shows the fully streamed end state (mirrors thinking-reasoning).

## Verification

- `tsc -b`: 0 errors. Production build: pass (pre-existing chunk-size advisory only).
- `verify-feed-card-design.mjs`: 18/18 (coverage 35/35). `verify-reactive-dither.mjs`: 20/20. `verify-aicss.mjs`: pass, including the new compact-streaming-thumbnail advance assertion. `verify-direct-card-actions.mjs`: pass (35 captions, 10 direct-manipulation transitions, new tooltip min-size assertions ≥56 px trigger / ≥14 px copy). `verify-emil-skills.mjs`, `verify-design-engineering.mjs`, `verify-thinking-reasoning-thumbnail.mjs`: pass.
- Visual pass over captures in `artifacts/design-qa/batch4-2026-07-18/`: forced-open tooltip, open accordion, calendar hero, and calendar/accordion/tooltip feed cards at 1440/390/320 px — all centered, readable, no clipping.
- Dev server was started per session with `--host 127.0.0.1` and killed afterward; port 5173 confirmed free.

final result: passed

# Ten feed cards deleted, four merged into Design Engineering umbrella, Gemini Button goes light — 2026-07-18

## Scope and visual truth

- Julio's deletion request, executed as briefed: ten feed cards removed with their routes, catalog entries, specimens, demo CSS, detail pages, and QA references — the Emil Motion Audit and Animation Opportunities skills (eight variants and both bundled content snapshots included), standalone Toast Notifications (`/vault/sonner`; "those notifications" was confirmed to mean the sonner card — the `notification-badge` transition stays), shadcn Bubble and Button Group, four transitions (Page side-by-side, Input clear, Blurred Text Animation, Dropdown menu morph), and standalone World Cup Knockout (including its `.kb-*` rules in `src/index.css`).
- Four cards merged into one umbrella "Design Engineering" at `/vault/skill-design-eng` (category Skills, in the design-eng card's feed position): Emil design-eng Taste, Animation Vocabulary, 12 Principles, and Better UI behind an in-place chip switch. Taste/Vocabulary reuse the exported `EmilSkillImplementation` block; the umbrella credits emilkowalski/skills (MIT, pinned 6bf2443) plus raphaelsalaja/skill and jakubkrehel/skills. Emil content snapshots for the two absorbed skills stay; `better-ui` and `12-principles-of-animation` content dirs also stay on disk (unreferenced — judgment call, brief scheduled only the two deleted Emil snapshots).
- Gemini Button (`/vault/border-beam`) restyled light per the brief: white field with dark text on vault tokens, beam and conic mask fully grayscale, four new palettes (Ink, Graphite default, Stone, Mist) replacing Colorful/Mono/Ocean/Sunset, grayscale focus/send states, brightness-pulse keyframes instead of hue-rotate. Layout, geometry, type/strength controls, and interactions are unchanged — colors only.
- The feed now renders 37 cards: 13 transitions, 5 AI-CSS, 1 standalone Emil skill (Fluid Interfaces), 7 shadcn, 11 standalone.

## Verification

- Reusable QA: `scripts/verify-feed-card-design.mjs` — 18/18 pass (coverage 37/37). `scripts/verify-reactive-dither.mjs` — 20/20 pass. `scripts/verify-aicss.mjs` — pass (5 cards × 3 viewports). `scripts/verify-emil-skills.mjs` — pass after a rewrite around the single standalone Emil page plus the umbrella thumbnail (the offscreen-autoplay test now parks at the footer first, since the short skills feed can mount the card in view). `scripts/verify-design-engineering.mjs` (new) — pass: h1 "Design Engineering", four section chips, in-place switching with correct demo per section, variant selectors, Better UI save interaction, no overflow at 1440/390/320 px. `scripts/verify-direct-card-actions.mjs` — pass (37 captions, 10 direct-manipulation transitions).
- The Gemini Button restyle was eyeballed with timed Playwright screenshots (line and large types captured at beam-peak frames; graphite default plus Ink check) — the grayscale beam reads clearly in motion on the white field.
- Deleted `scripts/verify-sonner.mjs`, `scripts/verify-knockout.mjs`, `scripts/capture-emil-skills-audit.mjs` (three of four capture targets gone), and `scripts/verify-skills.mjs` (stale since the 07-17 RichCaption rollout — asserted an 8-card skills feed and in-caption dates; unfixable trim, removed instead).
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking). Dev server was started with `--host 127.0.0.1` for the Playwright runs and stopped afterward (port 5173 confirmed free).

final result: passed

# Six more feed cards deleted, three cards renamed — 2026-07-18

## Scope and visual truth

- Julio's deletion request, executed as briefed: six feed cards removed with their routes, catalog entries, specimens, demo CSS, detail pages, and QA references — the Panel reveal transition, three AI-CSS cards (Code Block, Data Table, Comparison Table), Playwright CLI (including its demo/detail files and the bundled `src/content/skills/playwright-cli/` snapshot, the same call as the batch-1 review-animations content deletion), and Interaction Sounds (demo/detail files; the `cuelume` npm dependency stays installed).
- Renames (ids, paths, and component/file names unchanged): "Stop missing your meetings" → "Don't Miss Meetings" (feed caption and detail h1), "Texts reveal" → "Blurred Text Animation" (catalog title and specimen label), "Road Cup Knockout" → "World Cup Knockout" (catalog title and feed caption; the detail h1 "Knockout bracket" and the World Cup aria labels already matched).
- The feed now renders 50 cards: 17 transitions, 5 AI-CSS, 5 Emil skills, 9 shadcn, 14 standalone. No surviving card, token, or layout changed, so existing captures of surviving cards remain representative.

## Verification

- Reusable QA: `scripts/verify-feed-card-design.mjs` — 18/18 pass (headline assertion now "Don't Miss Meetings", coverage 50/50). `scripts/verify-reactive-dither.mjs` — 20/20 pass. Updated family suites pass: `scripts/verify-aicss.mjs` (5 cards × 3 viewports) and `scripts/verify-direct-card-actions.mjs` (50 captions, 12 direct-manipulation transitions). `scripts/verify-knockout.mjs` — 93/93 pass after fixing one stale pre-existing assertion: it still expected the pre-RichCaption "Jul 12, 2026" caption date (untouched since the initial commit) and now asserts the "World Cup Knockout" title instead.
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking). Dev server was started with `--host 127.0.0.1` for the Playwright runs and stopped afterward (port 5173 confirmed free).

final result: passed

# Ten feed cards deleted, two transition cards renamed — 2026-07-18

## Scope and visual truth

- Julio's deletion request, executed as briefed: ten feed cards removed with their routes, catalog entries, specimens, demo CSS, detail pages, and QA references — Gradient Spin, Interface Craft Guidelines, Modal open/close, Avatar group hover, 3D tilt, Thinking State, File Diff, Image Generation, Text Response, and the Emil Craft Bar skill (including its four review-* variants and the bundled upstream content snapshot). The brief's "input generation" had no matching card; Image Generation was removed as the only "generation" card in the AI-CSS family.
- Renames (ids, paths, and component/file names unchanged): "Skeleton loader and reveal" → "Loading frame and reveal"; "Shimmer text" → "Thinking text" (the Emil animation-vocabulary `shimmer` variant is unrelated and stays).
- The feed now renders 56 cards: 18 transitions, 8 AI-CSS, 5 Emil skills, 9 shadcn, 16 standalone. No surviving card, token, or layout changed, so existing captures of surviving cards remain representative.

## Verification

- Reusable QA: `scripts/verify-feed-card-design.mjs` — 18/18 pass, coverage assertion updated to 56/56. `scripts/verify-reactive-dither.mjs` — 20/20 pass. Updated family suites also pass: `scripts/verify-aicss.mjs` (8 cards × 3 viewports), `scripts/verify-emil-skills.mjs` (five skills), `scripts/verify-direct-card-actions.mjs` (56 captions, 13 direct-manipulation transitions). Two pre-existing verify-emil-skills assertion bugs were fixed along the way: Reset/Replay role queries now use `exact: true` (Motion Audit specimen buttons are labelled "Replay before/after example…"), and the reduced-motion duration assertion accepts Chrome's `1e-05s` serialization, matching the verify-sonner convention.
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking). Dev server was started with `--host 127.0.0.1` for the Playwright runs and stopped afterward (port 5173 confirmed free).

final result: passed

# Liquid Dither Effect rename, pill bounce −60%, dither spring defaults — 2026-07-18

## Scope and visual truth

- Julio's requests, three parts. (1) Category pill bounce was too strong: damping retention lowered 0.76 → 0.69 per 60 fps frame, stiffness unchanged at 0.11 — step-response simulation puts overshoot at 8.8% of travel vs the previous 21.5% (−59%); travel speed and the droplet squash/stretch are preserved, just calmer. (2) Engine defaults are now return stiffness 0.080 and damping 0.770 (from 0.110 / 0.850), so the mark returns home more slowly and softly; applied to `DEFAULT_SETTINGS` in the engine and synced into the detail page's reusable example snippet. (3) The card is renamed "Liquid Dither Effect" in the catalog, feed caption, LinkCard label, detail h1, and preview/controls aria labels; the route `/vault/reactive-dither`, file names, and component names are unchanged.
- No layout changed beyond motion tuning and titles, so the existing captures in `artifacts/design-qa/reactive-dither-2026-07-18/` and `artifacts/design-qa/card-design-2026-07-17/` remain representative.

## Verification

- Reusable QA: `scripts/verify-reactive-dither.mjs` — 20/20 checks pass with the h1 assertion updated to "Liquid Dither Effect" (reset-restores-defaults still verifies spacing 2.4 px / invert=false). `scripts/verify-feed-card-design.mjs` — 18/18 pass, including liquid-pill pixel-exact settle, mid-flight click travel, ghost show/hide, and reduced-motion snap on the calmer spring.
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking). Dev server was started with `--host 127.0.0.1` for the Playwright runs (Vite 8 defaults to IPv6 localhost, which the scripts cannot reach) and stopped afterward.

final result: passed

# Liquid-on-click fix + RichCaption feed-wide rollout — 2026-07-17

## Scope and visual truth

- Julio's report: the pill was liquid on hover but jumped instantly on click. Root cause: the `ResizeObserver` in `CategoryFilter` fires an initial delivery when observation starts — immediately after `retarget()` + `wake()` on every selection change — and its callback snapped the pill, killing the spring before its first frame. Fix: the observer callback now snaps only when the measured geometry truly changed (±0.5 px tolerance), so genuine resizes still snap while the spring survives selection changes. Probe-verified travel (`x 209 → 277 peak → 230 settle`, clear overshoot oscillation) and the spring was retuned slightly softer (stiffness 0.15 → 0.11, damping 0.72 → 0.76) for a more material feel.
- RichCaption rollout: all 66 feed cards now use the approved design (headline, ≤2-line summary, "View demo" chip, category). The four catalog-driven card families (22 transitions, 12 AI-CSS, 6 Emil skills, 9 shadcn) reuse the `summary` field their catalogs already carried; the 17 standalone cards got hand-written one-line summaries at their call sites. The legacy `Caption` component is no longer used anywhere (kept exported in Card.tsx).
- Evidence: `artifacts/design-qa/card-design-2026-07-17/` (feed top, transitions section, better-colors section).

## Verification

- Reusable QA: `scripts/verify-feed-card-design.mjs` — 18/18 checks pass, including the new rollout coverage assertion (66/66 direct-child feed cards render a non-empty summary) and a liquid-on-click travel assertion (≥2 strictly mid-flight x samples between start and target; measured 9/10). Pill settle stays pixel-exact, ghost show/hide works, reduced motion snaps, scroll-position regressions hold, zero console errors, zero overflow at 1440/390/320 px.
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Liquid category pill + spacing revert pass — 2026-07-17

## Scope and visual truth

- Liquid category tabs (Julio's request, feasibility confirmed last cycle): the selection pill now travels on an underdamped spring (stiffness 0.15, damping 0.72 per 60 fps frame, delta-time normalized) with a soft overshoot settle, and stretches/squashes with its velocity (`scaleX(1 + min(0.16, |vx|·0.012))`, `scaleY(1 − stretch·0.35)`) so it reads like a moving droplet. A lighter ghost pill (bg-hover fill, no border/shadow) eases behind the hovered tab and fades out on leave. All motion is written directly to the DOM from one rAF loop — no React state per frame — and the loop sleeps once both pill and ghost settle. `prefers-reduced-motion` snaps the pill instantly and disables the ghost. Implementation lives in `CategoryFilter` (App.tsx); the previous 180 ms CSS transition pill is gone.
- Spacing after Julio's review: the rule-of-four caption normalization from the previous cycle is REVERTED (he preferred round-4 values: caption side/bottom padding 6 px, footer margin 10 px). New top-of-page tuning: title → tagline gap 4 → 2 px; the tabs bar moves up 2 px (header → tabs 28 → 26 px) while tabs → results stays 32 px (results wrapper margin 4 → 6 px).
- Evidence: `artifacts/design-qa/card-design-2026-07-17/` (refreshed feed capture).

## Verification

- Reusable QA: `scripts/verify-feed-card-design.mjs` — 16/16 checks pass, including new liquid-pill assertions: pill settles exactly on the clicked tab (x/width within 1.5 px), hover ghost appears over the hovered tab and fades on leave, reduced motion snaps instantly, plus the scroll-position regression checks, card structure checks, zero console errors, zero overflow at 1440/390/320 px.
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Category-click scroll fix + spacing pass — 2026-07-17

## Scope and visual truth

- Bug: clicking Interactions (and sometimes All) scrolled the page deep into the feed (deterministically scrollY 851 / 5883). Root cause, traced via instrumented scroll probes: cmdk (the shadcn command demo inside an Interactions feed card) calls `scrollIntoView` on its selected item when a filtered grid mounts, and `scrollIntoView` scrolls every scrollable ancestor including the window. Not scroll anchoring (ruled out with `overflow-anchor: none`), not focus (the tab button keeps focus throughout).
- Fix: while the Feed is mounted, `Element.prototype.scrollIntoView` calls originating inside `.vault-filter-results` are swallowed — feed thumbnails are ambient visuals and nothing inside them may scroll the page. The original method is restored on unmount, so detail pages keep native behavior. No cmdk/node_modules patching.
- Julio's spacing requests: header → tabs distance 32 → 28 px (section `gap-8` → `gap-7`, results wrapper `mt-1` keeps tabs → results at 32 px); RichCaption normalized to his rule-of-four grid (caption padding 6 → 8 px sides/bottom, footer margin 10 → 12 px; the rest of the stack was already 4/12 px).
- Evidence: `artifacts/design-qa/card-design-2026-07-17/` (refreshed pilot card + feed captures).

## Verification

- Reusable QA: `scripts/verify-feed-card-design.mjs` — 12/12 checks pass, including the new regression assertions "clicking Interactions keeps the page at the top — scrollY=0" and "clicking All keeps the page at the top — scrollY=0", plus headline/summary/chip/category, zero console errors, zero overflow at 1440/390/320 px.
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Feed card pilot polish round 4 (regular-weight headline, gap 4 px) — 2026-07-17

## Scope and visual truth

- Julio's fourth-pass corrections on the RichCaption pilot: headline → summary gap 2 → 4 px (footer margin re-compensated 12 → 10 px so the summary → footer rhythm stays at 14 px); headline drops `font-semibold` to regular weight — same weight as the summary — while keeping the primary text color. Prior rounds stand: 14 px headline, 14 px summary, 16 px outer border, 15 px site title, no divider, meeting-card-only pilot.
- Evidence: `artifacts/design-qa/card-design-2026-07-17/` (refreshed pilot card + feed captures).

## Verification

- Reusable QA: `scripts/verify-feed-card-design.mjs` — 10/10 checks pass (headline, summary ≤2 lines, chip, category, zero console errors, zero overflow at 1440/390/320 px).
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Feed card pilot polish round 3 (16 px border, tighter pairing) — 2026-07-17

## Scope and visual truth

- Julio's third-pass corrections on the RichCaption pilot: outer card border radius 14 → 16 px; headline → summary spacing reduced exactly 4 px (caption stack gap 6 → 2 px, footer margin compensated 8 → 12 px so summary → footer rhythm is unchanged). Round 1–2 stand: 14 px headline, 14 px summary, 15 px site title, no divider, meeting-card-only pilot.
- Evidence: `artifacts/design-qa/card-design-2026-07-17/` (refreshed pilot card + feed captures).

## Verification

- Reusable QA: `scripts/verify-feed-card-design.mjs` — 10/10 checks pass (headline, summary ≤2 lines, chip, category, zero console errors, zero overflow at 1440/390/320 px).
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Feed card pilot polish round 2 (headline 14 px, rounder border) — 2026-07-17

## Scope and visual truth

- Julio's second-pass corrections on the RichCaption pilot: card headline 15 → 14 px; outer card border radius 12 → 14 px (`LinkCard` `rounded-xl` → `rounded-[14px]`; the inner stage stays 12 px, and detail-page `DemoCard` is untouched). Everything else from round 1 stands: no footer divider, 14 px summary, 15 px site title, pilot still meeting-card-only.
- Evidence: `artifacts/design-qa/card-design-2026-07-17/` (refreshed pilot card + feed captures).

## Verification

- Reusable QA: `scripts/verify-feed-card-design.mjs` — 10/10 checks pass (headline, summary ≤2 lines, chip, category, zero console errors, zero overflow at 1440/390/320 px).
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Feed card pilot polish (sizes + no divider) — 2026-07-17

## Scope and visual truth

- Julio's review corrections on the RichCaption pilot: removed the hairline divider above the footer row; card headline 17 → 15 px; card summary 13 → 14 px; site title "Design Experiments" set to 15 px (was inheriting 16 px). Structure, pill, category, and clamp behavior unchanged; still pilot-only on the meeting card.
- Evidence: `artifacts/design-qa/card-design-2026-07-17/` (refreshed pilot card + feed captures).

## Verification

- Reusable QA: `scripts/verify-feed-card-design.mjs` — 10/10 checks pass (headline, summary ≤2 lines, chip, category, zero console errors, zero overflow at 1440/390/320 px).
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Feed card design pilot (RichCaption) + header cleanup — 2026-07-17

## Scope and visual truth

- Feed-wide, no route or engine changes. Two pieces from Julio's markups:
  1. Card redesign pilot: new `RichCaption` in `src/components/Card.tsx` — 17 px semibold headline, a `line-clamp-2` 13 px tertiary summary, and a footer row divided by a subtle hairline with a "View demo" pill (visual affordance only; the whole card remains the link, pill deepens on group hover) and the category at right. Applied to ONE pilot card (`MeetingOverlayCard`, the card in Julio's mock) pending his review before the feed-wide rollout. `Caption` is untouched for all other cards; `data-card-caption` / `data-card-category` attributes are preserved so existing QA scripts keep working.
  2. Header deletions from his red markup: title "Design Engineering Experiments" → "Design Experiments", subtitle replaced with "Here are some small projects I've been exploring lately. Feel free to remix them, btw.", the decorative X close button removed (it was a no-op anchor), and the "Browse by category" / "N experiments" row above the filter tabs removed (with the now-unused `visibleCount`).
- Evidence: `artifacts/design-qa/card-design-2026-07-17/` (pilot card at 1440/390/320 px, feed at 1440 px).

## Verification

- Reusable QA: `scripts/verify-feed-card-design.mjs` — 10/10 checks pass (headline, summary renders and clamps to ≤2 lines, chip pill, category in footer, zero console errors, zero horizontal overflow at 1440/390/320 px).
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Reactive Dither calibration-bench fix + restored merge scale — 2026-07-17

## Scope and visual truth

- Route: `/vault/reactive-dither` (feed position, category, engine, and Julio's default settings unchanged).
- Julio's report: with his settings as defaults the render went light and separated — different from what he had approved live. Root cause chain: (1) his ×0.65 / 2.4 px settings were tuned while sprite `drawImage` omitted destination size, so on a DPR-2 screen every dot rendered at twice its nominal radius and dark regions merged like the reference; the DPR fix halved them. (2) Restoring the effective scale via `MAX_RADIUS_RATIO` 0.75 → 1.5 overshot into crushed black because the calibration bench stamped a 4×4 dot grid on a 6-pitch canvas and measured the WHOLE canvas — the empty one-pitch border ring diluted every measured coverage to 44% of truth, so sampling picked oversized levels for every target.
- Fix: the bench now stamps a 6×6 grid and measures only the inner 3×3 cells (edge dots clip ink that a real grid spills into neighboring cells; the inner zone is exactly the infinite-grid coverage). With truthful calibration at `MAX_RADIUS_RATIO` 1.5, the render Julio approved is reproduced with DPR-correct stamping and his exact panel settings (2.4 px, ×0.65, 100 px, 16 px, 0.110, 0.850, 2.00, Normal).
- Audit (`scripts/audit-reactive-dither-tones.mjs`): every patch now lands within ±4 luminance of the reference — field corner 12.3 → 10.5, white triangle 133.5 → 129.8, left fold 48.4 → 46.1, right fold 48.8 → 52.1, center band 154.1 → 155.7. Interior 8×8 delta cells sit within ±15; the lighter outer ring is tile-edge normalization, not a tone error.
- Implementation captures: `artifacts/design-qa/reactive-dither-2026-07-18/` (desktop feed card, expanded hero, settled mark, implementation controls, pointer-displaced, inverted, 390/320 px feed and detail).

## Verification

- Reusable QA: `scripts/verify-reactive-dither.mjs` — 20/20 checks pass (idle drift, pointer displacement, offscreen pause, re-entry resume, direct-load route, seven live range controls, invert, reset at the 2.4 px default, reduced motion, zero console errors, zero overflow at 1440/390/320 px).
- Settled capture visually matches the reference structure: near-solid black dithered field, white origami-cube negative shape, mid-gray dotted folds.
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Reactive Dither tone audit + artwork tone-field + Julio's defaults — 2026-07-17

## Scope and visual truth

- Route: `/vault/reactive-dither` (feed position, category, and interaction engine unchanged).
- Audit (`scripts/audit-reactive-dither-tones.mjs`, now a tile-normalized MAE comparison): the previous four-tone mask failed because (1) the eyeballed face tones were wrong — the reference's LEFT fold is darkest, RIGHT lightest, and the faces are gradients, not flats; (2) the theoretical radius law `r = p·√((1−W)/π)` systematically undershoots — antialiasing and sprite overlap bleed coverage, so every tone rendered too light; (3) the `#26262a` ink biased the calibration bench (a fully covered cell read as 0.85 coverage, not 1.0) and capped the darkest field at luminance 38 instead of the reference's 13.
- Fix: the engine now uses Julio's dithered artwork directly as the tone field (`public/vault/reactive-dither/cube-tone.png` → 512 px mask, ±7 px box-average descreens the artwork's own dot grid into local white fraction). Dot sizes come from an empirically calibrated coverage table — each of 16 sprite levels is stamped on a test grid and measured, and sampling picks the level whose REAL coverage is closest to the target. Sprites stamp pure black (reference dot color; inverted stays `#f5f5f3`), and `drawImage` now passes explicit CSS-px destination size so dots render true size at devicePixelRatio 2. Vector fallback retained for artwork load failure.
- New shared defaults chosen by Julio on the live controls and applied to thumbnail + hero + playground via `DEFAULT_SETTINGS`: spacing 2.4 px, dot size ×0.65, interaction radius 100 px, displacement 16 px, stiffness 0.110, damping 0.850, falloff 2.00, Normal color. At these values the capped dot size prevents merging, so mid-tones sit exactly on the reference (white triangle −4.2, center band −15.0, folds within ±30) while the darkest field intentionally stays a textured charcoal rather than near-solid black.
- Implementation captures: `artifacts/design-qa/reactive-dither-2026-07-18/` (desktop feed card, expanded hero, settled mark, implementation controls, pointer-displaced, inverted, 390/320 px feed and detail).

## Verification

- Reusable QA: `scripts/verify-reactive-dither.mjs` — 20/20 checks pass (idle drift, pointer displacement, offscreen pause, re-entry resume, direct-load route, seven live range controls, invert, reset at the 2.4 px default, reduced motion, zero console errors, zero overflow at 1440/390/320 px).
- Tone audit after the fix: white triangle 133.5 → 129.3 (−4.2), center band 154.1 → 139.1 (−15.0), left fold 48.4 → 75.3, right fold 48.8 → 78.6, field corner 12.3 → 78.6 (lighter by design under Julio's ×0.65 dot size).
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Reactive Dither shaded cube tile (four-tone mask) — 2026-07-17

## Scope and visual truth

- Route: `/vault/reactive-dither` (feed position, category, and interaction engine unchanged).
- Julio's correction: the previous binary carve flattened the reference's shades of gray. The engine is now a multi-tone mask sampler: the tile field, right face, left face, and top face are painted at distinct mask levels (`TONE_MASK_RED` 255/178/110/45), and every sampled dot is bucketed into one of four tones that stamp from their own sprites (`TONE_RADIUS_SCALE` 3.7/2.6/1.9/1 off the base radius).
- Shades of gray now come from dot size, exactly like the reference (`symbol-reference-3.png`): the tile's oversized dots nearly merge so their tiny gaps read as light specks on black, the top face keeps sparse pin dots on white, the side faces sit at two distinct grays, and the wireframe edges stay carved as clean channels. Inverted mode produces the true halftone negative.
- Dot sizing matched to the reference measurement (~19–20 px pitch over the ~1098 px tile): spacing 3.2 px default (≈56 dots across the tile in the implementation); the Dot radius control is now the base (top-face) radius, 0.3–1.2 px in 0.05 steps, default 0.5 px.
- Implementation captures: `artifacts/design-qa/reactive-dither-2026-07-18/` (desktop feed card, expanded hero, settled mark, implementation controls, pointer-displaced, inverted, 390/320 px feed and detail).

## Verification

- Reusable QA: `scripts/verify-reactive-dither.mjs` — 20/20 checks pass against the four-tone mark (idle drift, pointer displacement, offscreen pause, re-entry resume, direct-load route, seven live range controls, invert, reset at the 3.2 px default, reduced motion, zero console errors, zero overflow at 1440/390/320 px).
- Settled capture matches the reference region for region: black speckled tile, white top face with pin dots, light-gray left face, mid-gray right face, white wireframe. Feed thumbnail and inverted mode verified visually as the same field living and negated.
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Reactive Dither cube-tile mark + reference dot density — 2026-07-17

## Scope and visual truth

- Route: `/vault/reactive-dither` (feed position, category, and engine unchanged).
- Visual truth for the new mark: Julio's own dithered render of the cube app-tile logo (`artifacts/design-qa/reactive-dither-2026-07-18/symbol-reference-3.png`), which also sets the target dot density. The mask draws a rounded-square tile (12–88 of the 100-box, radius 13) and carves the cube as negative space — solid top face plus nine uniform 2.6-unit edge channels — with cube vertices measured tile-relative from the reference (apex 50/14%, sides 19.5/31% and 80.5/31%, center 50/48%, base corners 19.5/68% and 80.5/68%, bottom apex 50/86%).
- Dot density matched to the reference: measured pitch ≈ 19–20 px across a ≈ 1098 px tile (~55 dots per tile width) and radius:pitch ≈ 0.11–0.15. New shared defaults: spacing 5.8 → 3.2 px, dot radius 1.36 → 0.5 px (ratio 0.156); ~56 dots across the tile in the expanded implementation. Slider ranges extended so the defaults sit inside them (spacing min 2.4, dot radius min 0.4).
- Implementation captures: `artifacts/design-qa/reactive-dither-2026-07-18/` (desktop feed card, expanded hero, settled mark, implementation controls, pointer-displaced, inverted, 390/320 px feed and detail).

## Verification

- Reusable QA: `scripts/verify-reactive-dither.mjs` — 20/20 checks pass against the cube-tile mark; the reset assertion now expects the 3.2 px default (idle drift, pointer displacement, offscreen pause, re-entry resume, direct-load route, seven live range controls, invert, reset, reduced motion, zero console errors, zero overflow at 1440/390/320 px).
- Settled capture matches the reference structure: dotted rounded tile, solid white top face, full wireframe of edge channels, matching cube proportions. Inverted mode (light dots on dark stage) mirrors the reference's white-on-black tile texture.
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Reactive Dither pixel-invader mark — 2026-07-17

## Scope and visual truth

- Route: `/vault/reactive-dither` (feed position, category, engine, and 1.36 px dot radius unchanged).
- Visual truth for the new mark: Julio's supplied classic arcade invader sprite (`artifacts/design-qa/reactive-dither-2026-07-18/symbol-reference-2.jpg`). Recreated 1:1 as the canonical 11 × 8 bitmap (`MARK_BITMAP` in `drawSourceMark`), drawn cell by cell as one merged fill on a 68-unit-wide centered grid and sampled by the unchanged offscreen-mask dot-grid engine. The now-unused `roundedRectPath` helper was removed.
- Implementation captures: `artifacts/design-qa/reactive-dither-2026-07-18/` (desktop feed card, expanded hero, settled mark, implementation controls, pointer-displaced, inverted, 390/320 px feed and detail).

## Verification

- Reusable QA: `scripts/verify-reactive-dither.mjs` — 20/20 checks pass against the invader mark (idle drift, pointer displacement, offscreen pause, re-entry resume, direct-load route, seven live range controls, invert, reset, reduced motion, zero console errors, zero overflow at 1440/390/320 px).
- Settled-state capture (reduced-motion path) matches the reference sprite silhouette row for row: antenna dots, diagonal pair, head bar, eye holes, full-width middle row, notched arms, leg stubs.
- At 390/320 px the feed thumbnail samples the sprite sparsely (cells fall below one dot each) yet stays legible in motion — inherent to the dither treatment at small sizes, no overflow or layout defect.
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Reactive Dither waveform mark + smaller dots — 2026-07-17

## Scope and visual truth

- Route: `/vault/reactive-dither` (feed position, category, and engine unchanged).
- Visual truth for the new mark: Julio's supplied waveform symbol — nine vertical bars with rounded caps forming twin tall peaks, a dipped center bar that runs lowest, and small capsules set off at the edges. Recreated as vector shapes in `drawSourceMark` (`MARK_BARS` in a 100 × 100 box, bars 2–8 overlapping into one mass) and sampled by the same offscreen-mask dot-grid engine. Reference copy: `artifacts/design-qa/reactive-dither-2026-07-18/symbol-reference.png`.
- Default dot radius reduced 20% (1.7 → 1.36 px) in the shared defaults, so the feed thumbnail, expanded hero, and implementation all render the smaller dots; the detail control displays the new default.
- Implementation captures: `artifacts/design-qa/reactive-dither-2026-07-18/` (desktop feed card, expanded hero, settled mark, implementation controls, pointer-displaced, inverted, 390/320 px feed and detail).

## Verification

- Reusable QA: `scripts/verify-reactive-dither.mjs` — 20/20 checks pass against the new mark (idle drift, pointer displacement, offscreen pause, re-entry resume, direct-load route, seven live range controls, invert, reset, reduced motion, zero console errors, zero overflow at 1440/390/320 px).
- Settled-state capture (reduced-motion path) confirms the waveform silhouette: twin peaks, center dip, lowest center tail, detached edge capsules. Displaced and inverted states verified visually.
- Dot radius control reads 1.4 px (1.36 formatted); Reset restores it with the other defaults.
- TypeScript passes; the production build passes (pre-existing bundle-size advisory remains non-blocking).

final result: passed

# Reactive Dither — 2026-07-18

## Scope and visual truth

- Route: `/vault/reactive-dither` (feed position: directly after the promoted meeting card, Motion category).
- Behavioral visual truth: Emil Kowalski's reference post (https://x.com/emilkowalski/status/2036778116748542220) — a canvas dot-mark with a pointer-following circular influence field, radial displacement with cubic falloff, and a soft spring return. Clean-room implementation; no upstream source copied.
- Implementation captures: `artifacts/design-qa/reactive-dither-2026-07-18/` (feed card, expanded hero, controls, inverted colors, pointer-displaced and settled canvas states, 390/320 px feed and detail).

## Verification

- Reusable QA: `scripts/verify-reactive-dither.mjs` — 20/20 checks pass.
- Thumbnail: idle drift animates while visible, pointer movement visibly displaces dots, rendering pauses offscreen, animation resumes on re-entry.
- Detail: route works on direct browser load; hero and implementation share one engine; seven range controls plus Normal/Inverted segmented control render and update the live canvas immediately; Reset restores defaults; previous/next navigation works.
- Reduced motion (emulated): settled static mark, no loop, no pointer response.
- Zero console errors on the feed and detail route; zero horizontal overflow at 1440 px, 390 px, and 320 px.
- TypeScript passes and the production build passes; the pre-existing bundle-size advisory remains non-blocking.
- One defect found and fixed during QA: reading `event.currentTarget` inside a deferred state updater threw after range-input changes and unmounted the app; the value is now captured during event dispatch.

final result: passed

# Vault-wide Easing Blueprint remediation — 2026-07-16

## Scope

- Re-audited all 65 registered cards against animations.dev's Easing Blueprint and the current official `emil-design-eng` skill.
- Implemented all 18 items from the previous audit, measured the dependency-owned Embla Carousel, and added Gradient Spin to the final matrix.
- Full evidence: `artifacts/audits/easing-blueprint-fixes-2026-07-16/AUDIT.md`.

## Verification

- Final disposition: 55 aligned, 10 static/N/A, 0 remaining tuning items.
- Live computed-style checks passed for Panel Reveal, Input Clear, 3D Tilt, and Scroll Gallery. Carousel runtime samples confirm a fast, interruptible physical settle.
- Source/implementation captures were opened together to check visual regression: card layouts, type, crop, borders, radii, and hierarchy remain consistent with the existing light vault.
- TypeScript passes, `git diff --check` passes, and the production Vite build passes. The existing bundle-size advisory remains non-blocking.
- Reduced-motion media emulation was unavailable in the current in-app browser surface; Meeting Overlay's new settled branch was source-verified and its standard render was regression-checked.

## Findings

- No actionable P0, P1, or P2 motion issue remains from the audit.

final result: passed

# Gradient Spin — 2026-07-16

## Scope and visual truth

- Route: `/vault/gradient-spin`
- Source visual truth: `https://gradient-spin.vercel.app/` plus the MIT-licensed `BIAsia/gradient-spin` source for its palettes, pattern functions, OKLab sampling, shared opacity keyframe, and negative phase-delay behavior.
- Source captures: `artifacts/design-qa/gradient-spin-2026-07-16/source/desktop-light.png`, the complete source scroll sequence in the same directory, and the configured Ripple/Snake captures at the evidence root.
- Implementation captures: `artifacts/design-qa/gradient-spin-2026-07-16/implementation/desktop-top.png`, `desktop-controls.png`, `desktop-feed-gradient-spin.png`, and the source/implementation board at `artifacts/design-qa/gradient-spin-2026-07-16/comparison-controls.png`.
- Implementation viewport: 1280 × 720. The in-app browser currently retains that fixed CSS viewport when tabs are requested at 390 or 320 px; compact behavior was therefore checked through the dedicated responsive rules and intrinsic flex/grid sizing rather than represented by a misleading desktop screenshot labelled mobile.

## Fidelity comparison

- The implementation preserves the source's defining mechanism rather than approximating it with a video or rotating gradient: every cell shares one linear opacity animation and receives a negative delay derived from the selected pattern and gradient axis.
- All eight source palettes are present and sampled in OKLab. Arrow, Diagonal, Snake, and Ripple use the source phase formulas; Along path and Top down remap the phase/color axis exactly as the reference does.
- The source/implementation comparison board was opened as one visual input. The local component preserves the reference's compact color swatches, segmented pattern/axis controls, six ranges, light neutral surfaces, and centered spinner while translating them into the vault's 720 px editorial shell.
- The thumbnail intentionally reduces the reference to one spring/snake specimen and one status line. The expanded hero and Implementation use the same component and visual state, while only the expanded version exposes exploration controls.

## Interaction, motion, and implementation verification

- Palette Bubble, pattern Ripple, and axis Top down each update their pressed state; the complete option counts are 8 palettes, 4 patterns, and 2 axes.
- In the expanded specimen, sampled cell opacity changed from `0.1` to `0.877512` over 260 ms. In the visible feed thumbnail, 37 of 49 sampled cells changed over 220 ms.
- The feed thumbnail reports `data-active=true` when visible and the offscreen expanded hero reports `data-active=false`, confirming IntersectionObserver gating rather than 65 always-running feed animations.
- Reduced motion freezes the grid to a legible phase. Linear timing is an intentional exception because this is a perpetual loading cycle, not a spatial transition between interface states.
- Native range inputs preserve keyboard and pointer semantics. At widths up to 540 px, control groups collapse to one column and palette buttons wrap without fixed-width overflow.
- Browser console: zero errors and zero warnings beyond Vite/React development informational messages.
- TypeScript passes.
- Production build passes; the existing bundle-size warning remains non-blocking.

## Findings

- No actionable P0, P1, or P2 issues remain for this card.

final result: passed

# Scribble Index — 2026-07-16

## Scope and visual truth

- Route: `/vault/scribble-index`
- Source visual truth: Julio's supplied Benji Taylor writing-list screenshot at `/var/folders/v3/0q42bz6971780hq07q9qvfth0000gn/T/codex-clipboard-f3d2df43-5d7f-41ba-8a8e-c0872f48ffc2.png` plus the current `https://benji.org/` Writing DOM and production CSS.
- Implementation captures: `artifacts/design-qa/scribble-index-2026-07-16/detail-full.png`, `artifacts/design-qa/scribble-index-2026-07-16/feed-desktop.png`, `artifacts/design-qa/scribble-index-2026-07-16/detail-drawn.png`, and the pencil refinement under `artifacts/design-qa/scribble-index-pencil-2026-07-16/`.
- Desktop viewport: 1280 × 720. Responsive layout checks: 390 × 844 and 320 × 844.
- States exercised: initial rough “New” annotation, six-row automatic focus cycle, pointer hover, freehand drawing, keyboard row selection, undo, reset, feed containment, compact mobile fit, and reduced-motion code path.

## Fidelity comparison

- Reproduced the reference hierarchy exactly: muted Writing heading, title-column-only inner separators, full-width year boundaries, year/title/date columns, right-aligned tabular dates, magenta New label, and one fully active row against faded siblings.
- Matched the live production interaction rule: hovering the list fades sibling labels and dates, the active row returns to full opacity, and the opacity transition lasts 140 ms. The local muted color is `#c9c9c9`, producing the same optical fade on the vault's white surface.
- Recreated the rough double-loop magenta circle from the screenshot without a raster asset. The refined canvas keeps the original outer thickness while building each line from a deterministically broken core, fine offset fibers, and restrained graphite-like flecks. Both the initial circle and freehand marks now read as a dry pencil/thin brush rather than a clean digital stroke.
- The compact feed card advances one active row every 1450 ms only when at least 35% visible. Hover takes control immediately, leaving the viewport pauses the timer, and reduced motion keeps a settled first row.
- The desktop feed capture was opened beside the supplied screenshot in the same comparison input. Column alignment, line weight, hierarchy, copy, and rough annotation are materially aligned; only proportional scale changes to fit the vault's canonical 1344 / 520 card ratio.

## Interaction and responsive verification

- Canvas drag adds one normalized stroke while preserving the current hover row; dragging inside the feed preview leaves the `?category=interactions` URL unchanged.
- Expanded Undo removes the latest user stroke without removing the initial annotation. Reset clears all user strokes and restores the original magenta circle.
- Keyboard activation selected Honkish as the only pressed row. All six row buttons remain semantic while pointer hit-testing runs through the drawing canvas.
- At 390 px, the compact specimen ends 6.125 px above its frame edge; at 320 px it ends 4.875 px above the edge. Both widths report zero document overflow. The expanded mobile specimen retains 56 px below its final row.
- Browser console: zero errors and zero warnings on feed and detail routes.
- TypeScript passes.
- Production build passes; the existing bundle-size warning remains non-blocking.

## Findings

- No actionable P0, P1, or P2 issues remain for this card.

final result: passed

# Attachment card correction — 2026-07-16

## Scope and visual truth

- Route: `/vault/shadcn-attachment`
- Source visual truth: Julio's two diagnostic screenshots at `/var/folders/v3/0q42bz6971780hq07q9qvfth0000gn/T/codex-clipboard-5fa3793e-3afe-4b42-90c3-8ba0adbd3e88.png` and `/var/folders/v3/0q42bz6971780hq07q9qvfth0000gn/T/codex-clipboard-489fabd6-6748-4d0c-b08a-0889c51c8376.png`.
- Implementation screenshots: `artifacts/design-qa/attachment-2026-07-16/attachment-detail-after.png`, `artifacts/design-qa/attachment-2026-07-16/attachment-feed-after.png`, and `artifacts/design-qa/attachment-2026-07-16/attachment-image-preview.png`.
- Desktop viewport: 987 × 993. Responsive checks: 390 × 844 and 320 × 844.
- States compared and exercised: feed default, expanded default, upload canceled, image preview open/closed, completed-file removal, and compact thumbnail containment.

## Comparison history

### Initial findings

- [P1] The expanded hero scaled an unresponsive 403 px-tall specimen into a 264 px frame. The transformed layout remained vertically offset, so both status rows crossed the lower crop boundary.
- [P1] The feed thumbnail used the same transformed stack, leaving a very large empty upper field while the upload row was cut at the bottom.
- [P1] The visible X controls were inert and image cards had no preview behavior.
- [P2] At the 320 px feed width, the first compact correction still overflowed by 8 px and the image removal target competed with the image-preview target.

### Fixes and post-fix evidence

- Replaced transform scaling for Attachment with a real container-responsive grid. The three image cards share one row, status files share a second row, and the complete composition is centered by its actual layout box.
- Reduced only Attachment's Implementation stage from 480 px to 360 px, which removes the unnecessary empty vertical field without changing the other shadcn cards.
- Added working image preview, Escape/backdrop/close dismissal, upload cancellation, image removal, and completed-file removal. Interactive thumbnail events explicitly stay inside the card instead of triggering navigation.
- Added a dedicated short-container treatment. At 320 px the 68.28 px demo sits within the 90.08 px preview with approximately 10.9 px above and below, and document overflow is exactly zero. At these smallest sizes, image-removal overlays yield to the larger image-preview target while upload cancellation remains available.
- Reopened the diagnostic feed and expanded screenshots beside the post-fix captures in the same comparison inputs. The revised images show balanced whitespace, complete status rows, uncropped edges, preserved Inter typography, and the same component hierarchy in feed and detail.

## Required fidelity surfaces

- Fonts and typography: Inter/base-rhea remains in place; 14 px labels, 12 px metadata, medium filenames, truncation, and compact 10 px metadata are optically consistent and legible.
- Spacing and layout rhythm: the composition now uses measured 12/8/6/4 px gaps, centered real boxes rather than transformed overflow, 12/16 px radii, balanced outer whitespace, and a shorter Attachment-only implementation stage.
- Colors and visual tokens: white surfaces, neutral `#e5e5e5` hairlines, `#171717` text, `#737373` metadata, and the existing subtle focus ring remain consistent with the light vault and shadcn source.
- Image quality and asset fidelity: all three existing local 900 px images remain sharp. Thumbnails use intentional 4:3 cover crops, while the full-screen preview uses `object-fit: contain` to reveal the complete image without distortion.
- Copy and content: filenames, file types, sizes, upload percentage, labels, and category caption are preserved. Accessible labels now describe preview, cancel, remove, and close actions precisely.

## Interaction and responsive verification

- Desktop upload cancellation removes the correct row; the image preview opens at full size and closes from its X control.
- The 320 px feed thumbnail cancels without navigating, then opens its image preview without navigating. The compact preview exposes no overlapping image-removal target.
- Feed, expanded hero, and Implementation all use the same stateful component.
- Desktop, 390 px, and 320 px layouts have no document overflow or attachment crop.
- Browser console: zero errors.
- TypeScript passes.
- Production build passes; the existing bundle-size warning remains non-blocking.

## Findings

- No actionable P0, P1, or P2 issues remain for the requested attachment-card correction.

final result: passed

# Interface Craft Guidelines — 2026-07-16

## Scope and visual truth

- Route: `/vault/interface-guidelines`
- Source reference: `https://interfaces.rauno.me/`
- Visual target inspected: the official `https://interfaces.rauno.me/og.png` image at 1200 × 630 plus the live production stylesheet and DOM.
- Source snapshot: `raunofreiberg/interfaces@81f523a5b469ba1ea877fef262588f3b4b65d31f`.
- Intended viewports: desktop feed/detail, 390 × 844, and 320 × 720.
- Implementation screenshot: blocked pending approval to use the project’s local Playwright runner; the in-app Browser control surface is not callable in this session.

## Findings

- [P0] The new card cannot receive final visual approval without a browser-rendered implementation screenshot compared beside the official source preview.
  - Location: feed thumbnail, expanded hero, implementation, category tabs, and compact mobile compositions.
  - Evidence: the official preview was opened, production geometry and responsive rules were inspected, TypeScript and production build pass, and the local route responds, but no approved implementation capture exists.
  - Impact: title overlap, sheet crop, cyan-line optical weight, mobile compact scaling, list scrolling, focus appearance, and interactive-card containment cannot be honestly signed off from source code alone.
  - Fix: capture desktop, 390 px, and 320 px states; compare the source preview and implementation together; exercise copy feedback, all seven categories, row review, Reset, keyboard focus, reduced motion, and feed containment; fix any P1/P2 drift.

## Implemented direction awaiting visual comparison

- One original ship-readiness checklist translates the reference from a passive article into a directly useful vault experiment.
- The compact specimen begins at 2 / 3 reviewed. Copy token changes to an inline Copied confirmation and completes the local-feedback principle without showing a toast.
- The expanded implementation exposes seven semantic category tabs and 52 reviewable principles with local progress.
- Cyan construction lines, a stacked display title, white paper surface, neutral hairlines, and a restrained raised shadow preserve the reference’s recognizable composition inside the vault’s light design system.
- No upstream source, font, icon, or prose is bundled. The repository has no declared license, so all code and wording are clean-room and the source is credited.

## Functional checks completed without browser automation

- Central feed metadata, Skills filtering, breadcrumb title, previous/next order, and route selection include the new card.
- Compact copy feedback, category selection, rule pressed states, category progress, and Reset are implemented with native controls.
- Pointer-only hover styling, box-shadow focus rings, tap feedback, reduced-motion handling, semantic tabs, tabular progress figures, and offscreen-safe non-looping behavior are present.
- TypeScript passes.
- Production build passes; the existing bundle-size warning remains non-blocking.
- Local route responds over the existing Vite server.

final result: blocked

# shadcn/ui component collection — 2026-07-16

## Scope and visual truth

- Routes: `/vault/shadcn-attachment`, `/vault/shadcn-calendar`, `/vault/shadcn-card`, `/vault/shadcn-carousel`, `/vault/shadcn-chart`, `/vault/shadcn-breadcrumb`, `/vault/shadcn-bubble`, `/vault/shadcn-button-group`, and `/vault/shadcn-command`.
- Source visual truth: the nine official demo files and their base-nova/base-rhea component styles in `shadcn-ui/ui`.
- Reference commit: `shadcn-ui/ui@c49c3061b5b86b130736d36bf20008349f89b416`, MIT.
- Intended viewports: desktop feed/detail, 390 × 844, and 320 × 720.
- Implementation screenshot: blocked pending approval to use the project’s local Playwright runner; the in-app Browser control surface is not callable in this session.

## Findings

- [P0] The nine-card collection cannot pass visual QA without browser-rendered screenshots and interaction evidence.
  - Location: all nine feed thumbnails, expanded heroes, and implementation stages.
  - Evidence: the canonical upstream source was pinned and inspected, TypeScript and production build pass, but no approved browser capture exists for the implementation.
  - Impact: pixel-level scale, responsive fit, dropdown containment, carousel drag behavior, command keyboard selection, chart tooltip placement, and visible focus states cannot be honestly approved from source code alone.
  - Fix: capture the feed and every route at desktop, 390 px, and 320 px; exercise every canonical interaction; compare each implementation directly with the upstream demo; fix all P1/P2 drift.

## Exact-source correction

- The previous interpretation layer was removed after Julio’s review.
- Nine centralized definitions drive route, title, date, category, explanation, reference, credits, feed order, breadcrumbs, and cyclic navigation.
- One namespaced `ShadcnDemo` component powers thumbnail, hero, and implementation for every route.
- No Example selector, Reset/Replay wrapper controls, invented alternate states, or vault-specific copy remains inside the canonical primary demos. Command’s expanded Complete guide now includes the five official secondary examples supplied in its documentation.
- Attachment uses the official three images, upload row, complete file row, filenames, metadata, spinner, and shimmer.
- Calendar uses React DayPicker with the official current-date single selection and dropdown caption.
- Card reproduces the full login card; Carousel uses Embla and all five numbered slides; Chart preserves the official data and desktop/mobile switching.
- Breadcrumb, Bubble, Button Group, and Command reproduce the original labels, grouping, menus, reactions, and shortcuts.
- Command additionally includes local About, Installation, Usage, Composition, Basic, Shortcuts, Groups, Scrollable, RTL, and API sections. The four dialog examples use real cmdk filtering and Escape/backdrop dismissal; RTL preserves the official Arabic copy and direction.
- Geist and Inter are self-hosted for base-nova and base-rhea respectively. The exact Attachment images are bundled under `public/vault/shadcn/`.
- The outer vault frame only centers and proportionally scales the unchanged specimen to fit thumbnails.

## Required fidelity surfaces

- Fonts and typography: base-nova uses Geist and base-rhea uses Inter, with the source’s 12/14/16/30/36 px hierarchy; pending browser comparison for optical wrapping.
- Spacing and layout rhythm: official 24/16/12/8/6/4 px spacing, 8/12/16/24 px radii, neutral hairlines, menu padding, and component dimensions are encoded; pending desktop and mobile capture for clipping.
- Colors and visual tokens: white, `#f5f5f5`, `#e5e5e5`, `#737373`, `#171717`, and the source blue chart colors are present; pending rendered sampling.
- Image quality and asset fidelity: the three 900 px Attachment reference images load locally. Interface symbols use the source’s Lucide icon set.
- Copy and content: all primary demo labels and data come directly from the pinned official files.

## Functional checks completed without browser automation

- Nine route definitions, one feed spread, one metadata spread, and one generic detail route are present.
- Feed and previous/next ordering use the same centralized definitions.
- The canonical dependencies compile: React DayPicker, Embla, Recharts, cmdk, Lucide, Geist, and Inter.
- All visible controls are native buttons, links, inputs, selects, or labelled focusable regions.
- TypeScript passes.
- Production build passes; the existing bundle-size warning remains non-blocking.

## Implementation checklist

- [x] Replace all nine interpreted specimens with their canonical primary demos.
- [x] Synchronize thumbnails, heroes, and implementations.
- [x] Remove invented alternate examples and custom wrapper controls from thumbnails, heroes, and primary implementations.
- [x] Add the official Command documentation examples to its expanded Complete guide.
- [x] Add exact local assets, source fonts, source dependencies, code payloads, references, credits, and MIT attribution.
- [x] Integrate feed order, categories, routes, breadcrumbs, and neighbors.
- [x] Pass TypeScript and production build.
- [ ] Capture desktop, 390 px, and 320 px states.
- [ ] Test direct interaction, keyboard behavior, touch/drag behavior, route containment, and console output.
- [ ] Compare all nine upstream demos and implementations together.
- [ ] Fix remaining P1/P2 differences.

final result: blocked

# Motion Audit wrong/correct comparison pilot — 2026-07-16

## Scope and visual truth

- Route: `http://127.0.0.1:5173/vault/skill-improve-animations`
- Source visual truth: `/var/folders/v3/0q42bz6971780hq07q9qvfth0000gn/T/codex-clipboard-d8cbfd49-7872-4ae7-8f41-05c11094e0b3.png`
- Intended implementation state: the default Easing and duration example, replaying the wrong and correct modal entrances side by side.
- Intended comparison viewports: desktop feed/detail at 1440 × 900, mobile at 390 × 844, and narrow mobile at 320 × 720.
- Implementation screenshot: blocked pending approval to use the project’s local browser runner; the in-app Browser control surface is not callable in this session.

## Findings

- [P0] The implementation cannot pass visual QA without a browser-rendered screenshot placed beside the supplied reference.
  - Location: Motion Audit feed thumbnail, expanded hero, and implementation.
  - Evidence: the source image was opened and inspected, but no approved browser capture of the revised component is available.
  - Impact: typography, split-frame proportions, mobile scaling, clipping, and visible motion differences cannot be honestly approved from code or build output alone.
  - Fix: capture the revised default state in the local browser, create a source/implementation comparison board, inspect all four variants, and resolve any P1/P2 differences.

## Implemented structure awaiting visual comparison

- One open split canvas with equal Before and After interaction areas.
- A single divider on the exact center grid line running across the complete preview, with two compact label pills at the upper inset and the modal specimens underneath.
- No outer comparison frame, repeated column headers, verdict rows, X, or check.
- No partial-side hover fill; pointer hover leaves the open canvas visually unchanged.
- The default comparison contrasts `linear · 420ms` with `ease-out · 180ms`.
- Purpose, Performance, and Accessibility variants retain the same comparison frame while changing the demonstrated failure and correction.
- The thumbnail, expanded hero, and implementation use the same shared component.
- TypeScript and the production build pass.

## Comparison history

- Pass 1 implemented the earlier formal reference with an outer frame, repeated Wrong/Correct headers, and separate verdict rows.
- Julio’s follow-up review identified that structure as redundant and supplied a sketch with only Before/After pills, specimens, and one divider.
- Pass 2 removes the redundant framing and matches the simplified information hierarchy. Browser-rendered comparison remains blocked because the implementation capture is unavailable.
- Pass 3 moves the labels to the top of the full preview, extends the center divider edge-to-edge, and removes the gray partial-card hover treatment.

## Required fidelity surfaces

- Fonts and typography: pending browser comparison; implementation inherits the vault type system.
- Spacing and layout rhythm: pending browser comparison; the code uses two mathematically equal grid tracks around a 1 px divider, full-height stage, upper-edge label pills, and centered specimens.
- Colors and visual tokens: pending browser comparison; implementation uses only the vault’s white, gray, hairline, and text tokens.
- Image quality and asset fidelity: the source contains no raster imagery, brand asset, or required icon.
- Copy and content: Before and After are the only persistent comparison labels; each expanded variant retains its exact technical difference below the specimen.

## Implementation checklist

- [x] Build the Motion Audit pilot only.
- [x] Synchronize thumbnail, hero, and implementation.
- [x] Preserve all four expanded audit variants.
- [x] Pass TypeScript and production build.
- [ ] Capture desktop, 390 px, and 320 px implementation states.
- [ ] Compare the source and implementation together.
- [ ] Fix remaining visual or interaction differences.

final result: blocked

# Vault Categorization and Expanded Navigation Design QA — 2026-07-15

## Scope and visual truth

- Routes: `/` and all twelve feed-visible `/vault/*` detail routes.
- Source visual truth: `artifacts/design-qa/vault-navigation/source-breadcrumb-arrows.png`.
- Browser-rendered implementation: `artifacts/design-qa/vault-navigation/implementation-detail-1440x900.png` and `artifacts/design-qa/vault-navigation/implementation-home-1440x900.png`.
- Focused implementation crop: `artifacts/design-qa/vault-navigation/implementation-detail-focus.png`.
- Viewport: 1440 × 900 for the implementation; the supplied source is a 1674 × 271 annotated header crop, so the focused comparison normalizes both to their shared breadcrumb/title/navigation region rather than pretending they are full-page equivalents.
- State: default light-mode detail header plus the homepage's All category state.

The supplied source, the full rendered detail route, the focused detail crop, and the rendered homepage were opened together. The red source marks were treated as annotations, not interface assets. The focused comparison confirms the same information architecture: Home / category / experiment breadcrumb, bold experiment title, and one joined previous/next control aligned to the right. The vault deliberately retains its existing 720 px editorial shell, compact type scale, hairline tokens, and separate close action.

## Findings

- No actionable P0, P1, or P2 differences remain.
- [P3] The paired arrows are 32 px vault controls rather than the source's roughly 66 px buttons. This is an intentional density adaptation: they match the vault's existing chip and close-control scale, keep long experiment titles usable at 320 px, and retain full focus and hit affordances.
- [P3] At 320 px, the five homepage filters use horizontal scrolling with the next category partially visible. This keeps every label on one line, avoids document overflow, and supplies a clear scroll affordance.

## Comparison history

- Pass 1 found no P0/P1/P2 mismatch after implementation, so no blocking visual-fix iteration was required.
- The source's hierarchy and control grouping were preserved while the homepage filter and card category labels were extended from the same light tokens.

## Required fidelity surfaces

- Fonts and typography: breadcrumbs, filter labels, captions, titles, counts, and controls inherit the vault's Neue Montreal stack with the established 11–15 px hierarchy and no new display family.
- Spacing and layout rhythm: the 720 px shell, 32 px joined arrows, 28 px filter buttons, 8–11 px radii, hairline divisions, and 32 px section rhythm match the existing vault. Desktop, 390 px, and 320 px checks introduce no document overflow.
- Colors and visual tokens: all new UI uses `--bg-page`, `--bg-surface`, `--bg-hover`, the existing text hierarchy, and existing border tokens; no dark-mode surface or foreign accent was introduced.
- Image quality and asset fidelity: the source contains no required raster or brand asset beyond standard UI. Previous/next/close symbols use the installed Phosphor icon set; no handcrafted SVG, emoji, or placeholder art was added.
- Copy and content: all twelve feed-visible experiments have one category from Skills, Interactions, Motion, or Interfaces; counts, breadcrumbs, card labels, and filtered results use the same centralized metadata.

## Functional, responsive, and accessibility checks

- Filtered Skills to four cards and Motion to two cards; selected state, count, URL query, and card visibility all updated together.
- Category breadcrumbs return to the homepage with that category already selected.
- Previous and next controls navigate in feed order and wrap between the first and last experiment.
- Real links preserve native browser behavior and expose descriptive accessible names; filter buttons expose pressed state and visible focus.
- Checked desktop 1440 × 900, mobile 390 × 844, and narrow 320 × 720. Body and document widths equal the viewport at both mobile sizes.
- Browser console warnings/errors: none.
- TypeScript and production build passed.

final result: passed

# Frosted Materials Design QA

## Scope

- Route: `http://127.0.0.1:5173/vault/materials`
- Concepts: Music library glass player/navigation and expandable live island/notification
- Source references:
  - `/var/folders/v3/0q42bz6971780hq07q9qvfth0000gn/T/codex-clipboard-bd7d2115-60c3-47f3-9a7f-ef48a89e515c.png`
  - `/Users/juliocaggiano/Downloads/iScreen Shoter - Google Chrome - 260712153355.jpg`

## Evidence

- Desktop Music: `artifacts/design-qa/materials/music-desktop.png`
- Desktop Island: `artifacts/design-qa/materials/island-desktop.png`
- Mobile Music, 390 x 844: `artifacts/design-qa/materials/music-mobile-390.png`
- Mobile Island, 390 x 844: `artifacts/design-qa/materials/island-mobile-390.png`
- Music source/implementation composite: `artifacts/design-qa/materials/compare-music.png`
- Island source/implementation composite: `artifacts/design-qa/materials/compare-island.png`

The source and implementation were judged together in the two composite images above. The source screenshots contain phone hardware and different crops, so the implementation deliberately adapts the material treatment into the vault's existing borderless detail stage instead of reproducing the device shell.

## Comparison history

### Pass 1

- Music: generated album art was present, but the frosted player sat below the visual content and did not demonstrate enough refraction.
- Island: the first expanded state was too compact; the notification and lock-screen clock did not create the layered depth visible in the reference.

### Fixes

- Extended the album artwork underneath the mini-player and tab bar so both glass surfaces visibly refract real imagery.
- Enlarged the expanded island, allowed the assistant copy to wrap, overlapped the notification, and repositioned the lock-screen clock behind the materials.
- Replaced the textual dismiss glyph with a Phosphor icon and removed decorative CSS gradients that were substituting for source imagery.
- Added generated, project-local artwork: five music covers and one warm sculptural wallpaper.

### Pass 2

- Music now matches the reference hierarchy: dense artwork, two bottom-anchored milky glass layers, compact playback controls, and a selected pink destination.
- Island now matches the reference hierarchy: warm sculptural background, large opaque live activity, smoky overlapping notification, and readable clock content behind it.
- The 390 px and 320 px checks keep the content legible, preserve the intended overlap, and introduce no horizontal document overflow.

## Required fidelity surfaces

- Typography: uses the vault's existing sans-serif system and weight hierarchy; no reference-only phone chrome typography was imported.
- Spacing/layout: desktop uses the existing 16:9 detail stage; mobile shifts to 4:5 and a two-column music grid.
- Color/material: Music uses warm white/pink translucent surfaces; Island uses a black live surface plus a smoked notification over warm champagne artwork.
- Image quality: all six generated WebP assets load at non-zero natural width with no stretched or missing images.
- Copy: both concepts use realistic UI copy and remain clearly described in the detail page.

## Functional and accessibility checks

- Music: selector, play/pause, next track, and tab selection work.
- Island: selector, expand/collapse, materialize, and dismiss work.
- Shared Blur, Surface, and Saturate controls remain available for both concepts.
- Selector uses pressed state; controls have accessible names; notification visibility updates its live state.
- Music destinations expose their pressed state, and the shared sliders support Arrow, Page, Home, and End keys with formatted value text.
- Reduced transparency, increased contrast, and reduced motion fallbacks are present.
- Responsive checks: default desktop, 390 x 844, and 320 x 720.
- Layout diagnostics: no horizontal document overflow at checked widths.
- Asset diagnostics: all visible images completed with positive natural width.
- Production verification: `node node_modules/typescript/bin/tsc -b` and `node node_modules/vite/bin/vite.js build` passed.

final result: passed

# Scroll Gallery Vertical Spacing Design QA — 2026-07-15

## Scope

- Route: `http://127.0.0.1:5173/vault/chief-keef-index`
- Target states: fixed-ratio expanded hero and headerless feed thumbnail.
- Source visual truth: `artifacts/design-qa/scrollgallery/spacing-2026-07-15/source-expanded.png` and `artifacts/design-qa/scrollgallery/spacing-2026-07-15/source-thumbnail.png`.
- Requested change: increase the top inset above the cover rail and consume the oversized white band below the title/artist block.

## Rendered evidence

- Expanded implementation, 900 x 700 viewport: `artifacts/design-qa/scrollgallery/spacing-2026-07-15/implementation-expanded-900x700.jpg`.
- Feed implementation, 900 x 700 viewport: `artifacts/design-qa/scrollgallery/spacing-2026-07-15/implementation-thumbnail-900x700.jpg`.
- Mobile implementation, 390 x 844 and 320 x 720: `artifacts/design-qa/scrollgallery/spacing-2026-07-15/implementation-mobile-390x844.jpg` and `artifacts/design-qa/scrollgallery/spacing-2026-07-15/implementation-mobile-320x720.jpg`.
- Focused combined comparisons: `artifacts/design-qa/scrollgallery/spacing-2026-07-15/comparison-expanded.jpg` and `artifacts/design-qa/scrollgallery/spacing-2026-07-15/comparison-thumbnail.jpg`.
- Follow-up 4 px thumbnail source: `artifacts/design-qa/scrollgallery/spacing-2026-07-15/source-thumbnail-lift-4px.png`.
- Follow-up implementation captures: `artifacts/design-qa/scrollgallery/spacing-2026-07-15/implementation-thumbnail-lift-4px-900x700.png`, `artifacts/design-qa/scrollgallery/spacing-2026-07-15/implementation-thumbnail-lift-4px-390x844.png`, and `artifacts/design-qa/scrollgallery/spacing-2026-07-15/implementation-thumbnail-lift-4px-320x720.png`.

Both combined comparison boards were opened at full resolution. They isolate the bordered gallery surface so the top inset and bottom band can be judged without the surrounding detail-page prose or adjacent feed cards.

## Findings

- No actionable P0, P1, or P2 differences remain.
- [P3] The exact active cover differs between source and implementation because the gallery can be changed by its idle/feed state and direct interaction. This does not affect the spacing comparison; cover geometry, title height, and artist line height are equivalent across records.

## Comparison history

### Pass 1 findings

- [P2] Expanded hero: the transformed active cover visually began almost flush with the 38 px header, while the title/artist block ended approximately 36 px above the frame bottom.
- [P2] Feed thumbnail: the headerless rail began too close to the top, while the title/artist block left a visibly larger bottom band than the annotated target requested.

### Fixes and post-fix evidence

- Shifted the wide expanded hero's cover and stage endpoint down by 20 px. At the 686 px shell the title/artist block now ends roughly 16 px above the frame bottom instead of 36 px, while a clear top inset separates the header from the artwork.
- Shifted the wide thumbnail down by 16 px and used 8 px and 6 px adjustments at the 480 px and 300 px container tiers. The title/artist block now finishes near the lower edge without touching or crossing it.
- The 390 px and 320 px captures show the compact hero fully inside its fixed-ratio border with title and artist visible. No artwork, control, or type is clipped.

### Follow-up: 4 px thumbnail lift

- The annotated feed screenshot requested that the complete thumbnail composition move upward by exactly 4 px without changing the card or caption.
- Reduced the thumbnail stage height and cover `top` offset together by 4 px at each container tier: `194/34` to `190/30`, `96/12` to `92/8`, and `75/8` to `71/4`.
- Because both endpoints moved by the same amount, the cover rail, active title, and artist move as one unit while their internal spacing remains unchanged. The expanded hero and full implementation selectors are untouched.
- Rechecked the live feed at 900 x 700, 390 x 844, and 320 x 720. The title and artist remain visible, the thumbnail remains inside its fixed card, and the browser console remains free of warnings and errors.

## Required fidelity surfaces

- Fonts and typography: unchanged; the gallery continues to inherit the vault's Neue Montreal stack, weights, tracking, and responsive title/artist sizes.
- Spacing and layout rhythm: top and bottom distribution now matches the annotations. Cover-to-title spacing, outer ratio, header height, cover sizes, radii, perspective steps, and side fading remain unchanged.
- Colors and visual tokens: unchanged light canvas, charcoal type, muted artist text, hairline border, and soft cover shadows.
- Image quality and asset fidelity: all New Yorker artwork remains locally bundled, top-aligned, asymmetrically cropped, sharp, and undistorted. No assets were replaced.
- Copy and content: New Yorker/covers header, titles, artists, toolbar labels, and detail-page copy are unchanged.

## Functional and responsive checks

- Direct cover navigation and ArrowRight keyboard navigation remain active; the hero moved from West Fourth to Meet-Cute during verification.
- The feed thumbnail and expanded hero use the same coverflow component with surface-specific responsive spacing only.
- Checked 900 x 700, 390 x 844, and 320 x 720 states. No visible clipping or horizontal overflow was introduced.
- Browser console warnings/errors checked: none.
- TypeScript and production build passed.

## Open questions

- None.

## Implementation checklist

- [x] Increase expanded top inset.
- [x] Reduce expanded bottom band.
- [x] Reduce thumbnail bottom band.
- [x] Lift the complete thumbnail composition by the requested 4 px.
- [x] Preserve mobile fit, cover crop, interactions, and design-system typography.

final result: passed

# Interaction Sounds Semantic Controls Design QA — 2026-07-15

This revision supersedes the visual and implementation conclusions in the earlier Interaction Sounds report below while preserving it as comparison history.

## Scope

- Route: `http://127.0.0.1:5173/vault/cuelume`
- Source visual truth: `artifacts/design-qa/cuelume/source-desktop.png`
- Source operation truth: the installed MIT-licensed `cuelume@0.1.2` package and the reference's fourteen cue names, 1–0/Q–R shortcuts, press/release behavior, toggle behavior, hover guard, and shared AudioContext.
- Intended visual state: a vault-native light presentation with a pale-gray semantic control, not a copy of the source page.

## Rendered evidence

- Closed vault control, 1440 x 900: `artifacts/design-qa/cuelume/revision/semantic-toggle-1440x900.jpg`
- Open fourteen-choice selector, 1440 x 900: `artifacts/design-qa/cuelume/revision/semantic-menu-1440x900.jpg`
- Full-view source/implementation board: `artifacts/design-qa/cuelume/revision/comparison-source-toggle.jpg`
- Focused source interaction/vault toggle board: `artifacts/design-qa/cuelume/revision/comparison-focused-toggle.jpg`

The two comparison boards were opened and judged as combined images. They confirm the intentional separation: the source supplies the sound taxonomy and operation model, while the vault supplies the visible system. The implementation retains the same fourteen cue names, marker colors, shortcuts, switch concept, and exact library engine but replaces the source's documentation page and generic sound buttons with one focused semantic control plus dropdown.

## Findings

- No actionable P0, P1, or P2 differences remain.
- [P3] The compact 1344:520 hero necessarily hides long action descriptions and shortcut helper copy at its smallest container height. Cue names, semantic icon, the active switch/checkbox, and the selector remain visible; this is an accepted responsive prioritization.

## Comparison history

### Pass 1 findings

- [P1] One generic speaker/play button did not communicate why Toggle, Press, Release, Loading, or Success sound the way they do.
- [P2] The `#1b1b1b` surface read as black and sat outside the requested lighter vault mold.
- [P2] The compact hero's original two-column main-control grid had no reserved track for a visible switch or checkbox.

### Fixes and post-fix evidence

- Added fourteen cue-specific controls. Toggle and Whisper use switch semantics and checked state; Tick uses checkbox semantics; Press and Release fire on pointer down/up; Success and Ready retain confirmation state; Page advances its counter; Loading exposes `aria-busy`; the remaining cues use matching named actions and Phosphor icons.
- Changed the split surface to Apple-like system fill `#f2f2f3`, roughly 5% darker than the white canvas, with charcoal copy, restrained gray hairlines, vault radius tokens, and inherited typography. Cue icons now share a 19 px regular stroke, rounded terminals, consistent optical frame, and cue-colored Settings-style tile treatment inspired by SF Symbols.
- Added a third compact grid track for the switch/checkbox. At 320 px the 254 x 97 hero and its 188 x 42 main control have `scrollWidth === clientWidth`; the open menu shows all fourteen options with no option overflow. At 390 px, document width equals viewport width and the 294 x 371 implementation menu remains inside its 324 x 558 shell.
- The focused comparison confirms the source's Toggle affordance is translated into a clearly active notification switch rather than a generic sound icon.

## Required fidelity surfaces

- Fonts and typography: every visible label inherits the vault's Neue Montreal system. Action labels use the existing compact 600 weight, helper text uses the muted vault hierarchy, and the smallest hero truncates rather than wraps or clips.
- Spacing and layout rhythm: the 720 px editorial shell, 1344:520 hero, 10 px card inset, squircle radius, hairlines, and compact dropdown grid match neighboring vault cards. Desktop, 390 px, and 320 px states have no horizontal overflow.
- Colors and visual tokens: the page remains white/light gray; the control uses system fill `#f2f2f3` instead of black. The fourteen source cue colors remain as semantic icon tiles with sufficient charcoal-on-light control contrast and white-on-accent symbol contrast.
- Image quality and asset fidelity: the reference contains no required raster product imagery. Standard interface symbols come from the existing Phosphor package; no placeholder graphics, emoji, handcrafted SVG, recorded audio, or hotlinked assets are used.
- Copy and content: all fourteen cue names, matched action labels, exact package version, keyboard range, source credit, installation command, and implementation code remain inside the expanded page.

## Functional, accessibility, responsive, and build checks

- Tested Toggle false→true, Tick false→true, Press down, Release up, Success saved state, Page 1→2, and Loading `aria-busy=false→true`; each produced the matching live `played` status.
- Tested selector pointer selection, Arrow/Home/End navigation, Escape dismissal, trigger focus return, and the R shortcut.
- Tested the feed thumbnail: interacting with the switch keeps the URL at `/`; clicking the card navigation surface opens `/vault/cuelume`.
- Tested 1440 x 900, 390 x 844, and 320 x 720. All fourteen compact menu choices fit and document width equals viewport width.
- Browser console warnings/errors checked: none.
- TypeScript and production build passed.

## Open questions

- None.

## Implementation checklist

- [x] Fourteen semantic control types selected from one dropdown.
- [x] Official Cuelume 0.1.2 playback behavior.
- [x] Shared thumbnail, hero, and implementation component.
- [x] Keyboard, focus, live state, reduced motion, and responsive behavior.
- [x] Embedded source, install command, reference, credits, and shared project log.

final result: passed

# Interaction Sounds Design QA — 2026-07-15

## Scope

- Route: `http://127.0.0.1:5173/vault/cuelume`
- Source reference: `https://cuelume-site.pages.dev/`
- Goal: translate Cuelume's recognizable sound palette and interaction patterns into the vault's light fixed-ratio card system while keeping the thumbnail, expanded hero, and implementation on one responsive component.

## Visual truth and rendered evidence

- Source visual truth, desktop full page at 1440 px: `artifacts/design-qa/cuelume/source-desktop.png`
- Source visual truth, mobile at 390 x 844: `artifacts/design-qa/cuelume/source-mobile.png`
- Source active chime state: `artifacts/design-qa/cuelume/source-active.png`
- Browser-rendered implementation viewport: `artifacts/design-qa/cuelume/implementation-viewport.png`
- Browser-rendered active chime state: `artifacts/design-qa/cuelume/implementation-active.png`
- Browser-rendered 390 px implementation capture: `artifacts/design-qa/cuelume/implementation-mobile-390.png`
- Full source/detail-page comparison: `artifacts/design-qa/cuelume/comparison-desktop.png`
- Focused default core comparison: `artifacts/design-qa/cuelume/comparison-core.png`
- Focused active-state comparison: `artifacts/design-qa/cuelume/comparison-active.png`

The source and vault are intentionally not the same outer page: the source is a 480 px vertical library page, while the vault requires a 1344:520 card inside its 720 px editorial shell. The comparison boards place both visible artifacts together and judge the shared core at readable scale. The vault preserves the warm paper canvas, compact wordmark/version row, waveform/readout, five-column cue palette, colored markers, hover row, press/release button, toggle, hairlines, and muted blue links. It adapts those elements into a two-column hero so the fixed-ratio card does not crop the interaction.

## Findings

- No actionable P0, P1, or P2 differences remain.
- [P3] The vault keeps the active canvas waveform visible longer than the captured source state. This is accepted follow-up polish because it strengthens the relationship between the audible cue and its readout without changing the source hierarchy or controls.
- [P3] The source's four “Why Cuelume” cards are summarized in the vault prose instead of being repeated inside the fixed-ratio hero. This is an intentional outer-page adaptation; installation and the complete reusable implementation remain available in the vault's Code/copy surface.

## Comparison history

### Pass 1 findings

- [P1] The Save control's pointer-up handler read React's pre-render `pressed` value, so a fast click could miss the release cue and saved state.
- [P2] The visible final cue shortcuts were labeled Q, R, S, T while the actual source and keyboard handler use Q, W, E, R.
- [P2] At the 320 x 720 check, the 97 px-tall hero exposed only seven of fourteen cue buttons and several labels exceeded their grid cells.

### Fixes

- Added a synchronous press ref so pointer and keyboard press/release pairs cannot lose their release edge between renders.
- Derived every visible shortcut directly from the same `KEY_CUES` map used by the keyboard handler.
- Added a micro-height container mode: the 320 px hero hides only the waveform canvas, changes to a five-column/three-row palette, and tightens typography and gaps. The 390 px hero keeps the waveform and uses seven columns/two rows. Narrow full implementations use the source-like three-column mobile grid.

### Pass 2 post-fix evidence

- The focused default and active comparisons show the source and implementation together with the same cue names, colors, active outline, readout, interaction rows, Save control, and toggle.
- Browser interaction checks changed the hero readout to `chime 1047 Hz · 0.36 s`, changed the switch from `aria-checked=false` to `true`, reached `ready cue played` through the R shortcut, and reported `release 260→440 Hz · 0.10 s` after Save pointer-up.
- Feed QA confirmed cue clicks keep the URL at `/`, while clicking the card caption navigates to `/vault/cuelume`.
- At 390 x 844, both hero and implementation showed all 14 cues with zero cue overflow, component scroll width equal to client width, and document width equal to viewport width.
- At 320 x 720, both hero and implementation showed all 14 cues; every cue had `scrollWidth <= clientWidth`, the component had no internal overflow, and the document width equaled the viewport width.

## Required fidelity surfaces

- Fonts and typography: the source's compact sans-serif/monospace hierarchy is retained, but the component deliberately inherits the vault's Neue Montreal system. Weights, muted helper text, mono frequency readouts, line heights, and truncation remain legible at desktop, 390 px, and 320 px.
- Spacing and layout rhythm: source padding, hairline rows, 10 px chip radii, compact gaps, and a narrow central frame are preserved. The only structural change is the required two-column 1344:520 hero; the full implementation returns to a roomier responsive layout.
- Colors and visual tokens: the implementation closely matches the source's `#fbfaf9` paper, white controls, charcoal text, warm gray dividers, fourteen marker colors, yellow speaker/star, pink heart, blue links, and black Save button while remaining inside the vault's light surface tokens.
- Image quality and asset fidelity: the source exposes no raster images, recorded audio, or downloadable media assets. The implementation uses the existing Phosphor icon dependency for the speaker, star, and heart, and a real canvas waveform driven by the selected cue. No hotlinked assets, placeholder imagery, emoji, handcrafted SVGs, or audio files are present.
- Copy and content: all fourteen cue names, version count, keyboard range, data-attribute examples, link labels, frequency/duration readouts, and Daniel Belyi/Cuelume reference are retained. The descriptive sentence is intentionally paraphrased for the vault, and the full implementation is embedded in Code/copy.

## Functional, accessibility, and build checks

- Fourteen cue buttons synthesize distinct local Web Audio envelopes; the page loads no audio runtime or remote sound files.
- The focused palette supports 1–0 and Q–R, announces the last cue in a polite live region, exposes `aria-keyshortcuts`, and gives buttons and links visible focus styles.
- Save demonstrates press and release edges; the demo toggle uses switch semantics and checked state; Reset restores idle, off, and unsaved state.
- Reduced motion draws the waveform in its completed state immediately and disables decorative CSS transitions.
- Primary interactions tested: cue click, active waveform/readout, toggle, keyboard shortcut, press/release, feed interaction containment, feed navigation, and Reset wiring.
- Browser console errors and warnings checked: none.
- TypeScript and the production build passed. Vite emitted only its existing large-chunk advisory.

## Open questions

- None.

## Implementation checklist

- [x] Shared thumbnail, hero, and implementation component.
- [x] Fourteen locally synthesized cues and live canvas waveform.
- [x] Hover, press/release, toggle, keyboard, reset, and feed navigation behavior.
- [x] Desktop, 390 px, and 320 px responsive fit.
- [x] Embedded source code, copy prompt, reference, credits, and shared project log update.

## Follow-up polish

- The P3 waveform persistence can be shortened later if a more literal transient trace is preferred.

final result: passed

# Border Beam Design QA

## Scope

- Route: `http://127.0.0.1:5173/vault/border-beam`
- Reference: `https://beam.jakubantalik.com/`
- Requested default: Ocean color, Line type, 60% strength, with the source's complete Type and Color controls available in the interactive implementation.

## Evidence

- Desktop source default: `artifacts/design-qa/border-beam/source/desktop-default.jpg`
- Desktop source Ocean + Line: `artifacts/design-qa/border-beam/source/desktop-line-ocean.jpg`
- Mobile source Ocean + Line: `artifacts/design-qa/border-beam/source/mobile-line-ocean.jpg`
- Mobile source paused state: `artifacts/design-qa/border-beam/source/mobile-paused.jpg`
- Desktop implementation: `artifacts/design-qa/border-beam/implementation/desktop-ocean-line.jpg`
- Feed thumbnail, desktop: `artifacts/design-qa/border-beam/implementation/feed-desktop.jpg`
- Feed thumbnail, 390 px: `artifacts/design-qa/border-beam/implementation/feed-mobile-390.jpg`
- Detail page, 390 px and 320 px: `artifacts/design-qa/border-beam/implementation/mobile-390-top.jpg` and `mobile-320-top.jpg`
- Normalized reference/implementation comparison: `artifacts/design-qa/border-beam/comparison-ocean-line.jpg`
- Revised desktop and mobile source states: `artifacts/design-qa/border-beam/revision/source/`
- Revised implementation states for every type and palette: `artifacts/design-qa/border-beam/revision/implementation/`
- Revised normalized full-playground comparison: `artifacts/design-qa/border-beam/revision/comparison-line-ocean.jpg`

The revised normalized composite places the full selected source playground beside the full selected vault playground in one comparison image with legible controls, beam, pause action, and live code output, so a secondary focused crop was not necessary. Component geometry is preserved: 348 x 66 px surface, one-pixel edge, and the Ocean spectrum. The latest vault refinement uses a 22 px continuous/squircle corner and 60% strength. The dark source playground is intentionally translated to the vault's light page/stage tokens; per user direction the field is graphite `#29292b` and says “Ask anything...”.

## Comparison history

### Pass 1

- The selected Line and Ocean state, surface dimensions, radius, motion duration, and fading beam hierarchy matched the captured source facts.
- The implementation initially removed its element-level animation when paused, causing the beam to return to its initial custom-property state instead of freezing at its current position.
- The visually hidden native range worked by browser default, but explicit pointer and keyboard handlers were missing from the local interaction contract.

### Fixes

- Kept the travel/fade/breathe animations mounted and applied `animation-play-state: paused` so pause now holds the current beam position.
- Added direct pointer mapping plus Arrow, Home, and End keyboard handling to the strength control while retaining the source-like filled-track appearance.
- Kept all demo classes under the `bb-` namespace and kept the feed preview, detail hero, and implementation on the same component.

### Pass 2

- Paused custom-property position remained identical across a 450 ms check; resumed position advanced.
- Pointer input changed strength from 70% to 90%, and Arrow Right changed it to 91%; Reset returned the component to 70% and running.
- The 390 px and 320 px layouts had `documentElement.scrollWidth === innerWidth`; the compact preview, settings, and full implementation remained readable.
- The feed card routes to `/vault/border-beam`, and the expanded page retains the matching Ocean/“Ask anything...” presentation.

## Interactive parity revision — 2026-07-14

### Earlier findings

- P1: Type and Color were static labels, so the implementation did not reproduce the source playground's primary interaction.
- P2: The field said “Ask Gemini” with a sparkle rather than the requested input-like copy, and its `#1d1d1d` surface read too close to black.
- P2: The implementation did not show the source's live configuration output after a setting changed.

### Fixes and post-fix evidence

- Added working Large, Small, Line, Colorful, Mono, Ocean, and Sunset radio controls. Browser checks confirmed each selection updates `data-type`, `data-color`, the beam treatment, checked state, and live config.
- Large and Small now use the captured 1.96-second rotating conic engine; Line uses the captured 3.1-second traveling line engine. Large measures 348 x 66 px and Small measures 80 x 36 px, matching source geometry.
- Replaced the sparkle/“Ask Gemini” treatment with “Ask anything...” and changed the surface to `rgb(41, 41, 43)` in the thumbnail, hero, and implementation.
- Added a responsive three-line live config block that updates size, palette, and strength. Pointer changed 70% to 90%, Arrow Right changed it to 91%, and Reset restored Line/Ocean/70%/running.
- The revised source/implementation composite at `artifacts/design-qa/border-beam/revision/comparison-line-ocean.jpg` contains the same Line/Ocean/70% state. Remaining canvas/copy differences are the explicit user-requested vault adaptation.
- The 390 px and 320 px captures have `documentElement.scrollWidth === innerWidth`; source-like mobile stacking keeps every Type, Color, and Strength control reachable.

## Functional and accessibility checks

- Pause/play and external toggle/reset controls work and expose accessible names and pressed state.
- All Type and Color choices are buttons with radio semantics and checked state; the selected configuration is reflected in a polite live code region.
- Strength is a labeled native range with explicit pointer, Arrow, Home, and End behavior plus visible focus treatment.
- Reduced motion replaces travel with a static, centered, fully visible beam.
- The source component needs no runtime dependency or remote media; the source and CSS are available in the detail page's code/copy surface.
- Fresh browser logs contained no errors or warnings beyond normal Vite/React development messages.
- `node node_modules/typescript/bin/tsc -b` and `node node_modules/vite/bin/vite.js build` passed. Vite emitted only its existing large-chunk advisory.

final result: passed

## Editable field and corner refinement — 2026-07-14

### Changes

- The default and Reset state are now Line + Ocean + 60%; the feed thumbnail, detail hero, implementation, and live code share that presentation.
- The 348 x 66 field uses a 22 px radius plus `corner-shape: squircle`, with proportional 20 px and 16 px narrow variants. Option buttons, the strength track, and the send control use the same continuous-corner language.
- Desktop stage padding changed from `36px 24px` to `32px 24px`; the mobile tier changed from `32px 18px` to `28px 16px`. All content and control padding values now land on the 4 px grid; the one-pixel mask padding remains the beam's technical border thickness.
- The full implementation renders a controlled text input and a Phosphor paper-plane submit button. Compact card/hero instances keep a visually matched static field so no nested controls are introduced inside the feed link.

### Verification

- Browser typing produced the exact draft value, a non-empty submit applied `is-sent`, the accessible label changed to “Message sent”, and both returned to idle after the 560 ms feedback animation.
- The responsive implementation measured without document overflow at 390 px and 320 px. At 390 px the field was 58 px tall with a 20 px radius and 32 px send control; at 320 px the editable area remained 107.8 px wide with the same 32 px control.
- The browser reported computed `corner-shape: squircle`, an initial 60% slider and `strength={0.6}` live output, and no warnings or errors.
- `node node_modules/typescript/bin/tsc -b` and `node node_modules/vite/bin/vite.js build` passed. Vite emitted only its existing large-chunk advisory.

final result: passed

## Interactive thumbnail and continuous loop — 2026-07-14

### Changes

- The feed thumbnail, expanded hero, and implementation now render the same controlled input and send interaction instead of a compact static substitute.
- The feed card uses a non-nested interaction boundary: input/button events stay local, while clicks on the rest of the card open the Border Beam detail route.
- Removed both pause/play surfaces. No internal motion button or external Toggle motion control remains; all beam travel, edge fade, and breathing animations loop continuously unless the operating system requests reduced motion.

### Verification

- Browser QA typed “Type inside the thumbnail,” submitted it, observed `bb-send-button is-sent`, and confirmed the URL stayed on the feed during both actions.
- After the interaction-boundary fix, browser QA typed again and then clicked the card caption; the route changed from `/` to `/vault/border-beam`.
- The detail page exposes exactly two “Ask anything” textboxes, one Reset button, and zero Toggle motion, Pause animation, Play animation, or `.bb-motion-toggle` controls.
- The two detail views share the beam component. Computed animation state on the first beam was `running` with `infinite` travel, edge-fade, and breathing iterations.
- `node node_modules/typescript/bin/tsc -b` and `node node_modules/vite/bin/vite.js build` passed. Vite emitted only its existing large-chunk advisory.

final result: passed

# Chief Keef Index Design QA

## Scope

- Route: `http://127.0.0.1:5173/vault/chief-keef-index`
- Reference: `https://www.chiefkeefindex.com/`
- Goal: recreate the visible coverflow experience in the vault's light, narrow editorial system while keeping the feed preview and expanded page synchronized.

## Evidence

- Default reference, 686 x 620 at 2x: `artifacts/design-qa/chief-keef-index/source-default-686.png`
- Default implementation, 686 x 620: `artifacts/design-qa/chief-keef-index/implementation-default-686.jpg`
- Search reference, 686 x 620 at 2x: `artifacts/design-qa/chief-keef-index/source-search-686.png`
- Search implementation, 686 x 620: `artifacts/design-qa/chief-keef-index/implementation-search-686.jpg`
- Mobile reference, 390 x 844 at 2x: `artifacts/design-qa/chief-keef-index/source-mobile-390.png`
- Mobile implementation, 390 x 844: `artifacts/design-qa/chief-keef-index/implementation-mobile-390.jpg`

The default and search reference/implementation pairs were inspected together at the same CSS viewport. The final implementation keeps the source's compact header, centered active cover, faded perspective neighbors, sparse metadata, and full-stage search treatment. The vault adds its existing outer border and editorial detail-page structure.

## Comparison history

### Pass 1

- The default coverflow matched the source hierarchy closely.
- At the 686 px implementation stage, search initially remained a floating desktop dialog while the reference promoted search to a full-stage surface.
- The implementation toolbar could overflow at 320 px before its controls were allowed to wrap.

### Fixes

- Added a container-responsive full-stage search layout at 720 px and below while retaining the centered desktop command palette at wider stages.
- Allowed the detail-page implementation controls to wrap on narrow screens.
- Stabilized the compact preview's auto-advance effect and retained the reduced-motion opt-out.

### Pass 2

- Default cover scale, spacing, fading, typography, and metadata hierarchy remain visually aligned with the reference.
- Search now occupies the full 686 x 620 stage and keeps live-filtered results readable without document overflow.
- The 390 px and 320 px layouts preserve the active artwork, cropped neighbor covers, controls, and metadata with zero horizontal document overflow.

## Functional and accessibility checks

- Cover selection, shuffle, sort options, theme choice, and list/coverflow view changes work.
- Arrow Right changed the active track from Citgo to Save Me; live search narrowed `boost` to one result; Escape dismissed the search dialog.
- Buttons have accessible labels, the coverflow has keyboard instructions, selection metadata is announced in the interactive implementation, and focus states remain visible.
- Reduced motion disables compact auto-cycling and collapses transition durations.
- All 18 visible demo images across the hero and implementation completed with positive natural width.
- Responsive checks passed at desktop, 390 x 844, and 320 x 720 with no horizontal document overflow.
- A fresh browser load reported zero console errors.
- `node node_modules/typescript/bin/tsc -b` and `node node_modules/vite/bin/vite.js build` passed. Vite emitted only its existing large-chunk advisory.

final result: passed

## Interaction parity audit — 2026-07-14

### Fresh reference evidence

- Live default: `artifacts/design-qa/chief-keef-index/audit-2026-07-14/reference-default.png`
- Live direct click on Save Me: `artifacts/design-qa/chief-keef-index/audit-2026-07-14/reference-save-me.png`
- Live direct click on the third right cover, Boost: `artifacts/design-qa/chief-keef-index/audit-2026-07-14/reference-boost.png`
- Live filter and search states: `artifacts/design-qa/chief-keef-index/audit-2026-07-14/reference-filter.png` and `reference-search.png`
- Normalized 686 x 620 reference/implementation comparison: `artifacts/design-qa/chief-keef-index/audit-2026-07-14/comparison-default.jpg`
- Revised 390 px implementation: `artifacts/design-qa/chief-keef-index/audit-2026-07-14/implementation-mobile-390.jpg`

### Audit findings and fixes

- Blocking: `.cki-stage` captured the pointer on `pointerdown`, retargeting the eventual click away from its cover button. Capture now starts only after an 8 px drag threshold; a normal press remains a button click.
- Blocking: the third visible distance tier had `pointer-events: none`. All three visible neighbor tiers now accept direct selection, matching the reference's cover buttons.
- High fidelity: the local rail used shallow 7–12 degree turns and negative depth. It now uses the captured reference geometry: per-cover 1100 px perspective, 120/84/48/12 px depth, 52 degree side rotation, 0.86 scale, and 180.56/328.56/476.56 px spacing at the vault's 686 px stage.
- High fidelity: whole cards were faded and offset vertically. Covers now stay on one axis while artwork fades to 0.78/0.56/0.34 by distance, matching the visible reference hierarchy.
- Content: Save Me now reports Lex Luger and 3:10; Boost now reports Bugz Ronin and 3:42, as observed in the direct-click reference states.
- Semantics: cover buttons expose source-like track/index attributes and current state; the wordmark toggles list/coverflow instead of resetting the demo.

### Verification

- Direct click changed Citgo to Save Me and, after reset, directly to I Wonder; both visible right-hand neighbors work without dragging.
- Arrow Right changed Citgo to Save Me. Search opens as a dialog, and the wordmark switches between the nine-track list and coverflow.
- The 390 x 844 implementation had zero broken images and no horizontal document overflow; the 320 x 720 check also had zero broken images and `scrollWidth === innerWidth`.
- Fresh browser logs contained no warnings or errors.
- `node node_modules/typescript/bin/tsc -b` and `node node_modules/vite/bin/vite.js build` passed. Vite emitted only its existing large-chunk advisory.

final result: passed

## Feed thumbnail simplification — 2026-07-14

- Desktop evidence: `artifacts/design-qa/chief-keef-index/thumbnail-2026-07-14/thumbnail-desktop.jpg`
- 390 px evidence: `artifacts/design-qa/chief-keef-index/thumbnail-2026-07-14/thumbnail-390.jpg`
- 320 px evidence: `artifacts/design-qa/chief-keef-index/thumbnail-2026-07-14/thumbnail-320.jpg`
- The feed thumbnail now contains only the animated coverflow, active track title, and album. The header controls and Year/Producer/Length table are absent from the card DOM.
- The expanded compact hero and full implementation retain their complete header, controls, metadata, and interactions.
- At 390 px and 320 px, the title and album stay within the 16:9 preview, `scrollWidth === innerWidth`, and all cover images load at positive natural width.
- Fresh browser logs contained no warnings or errors. TypeScript and the production build passed; Vite emitted only its existing large-chunk advisory.

final result: passed
