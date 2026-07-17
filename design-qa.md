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
