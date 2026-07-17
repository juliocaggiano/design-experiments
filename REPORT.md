# Vault reconstruction — fidelity report

One-to-one rebuild of https://www.arlan.me/vault as a working Vite + React +
TypeScript + Tailwind v4 app. Zero runtime dependencies beyond React — every
demo is plain canvas/DOM, matching the original's mechanisms.

## Run it

```bash
cd arlan-vault
node node_modules/vite/bin/vite.js --port 5173   # npx breaks on the ":" in the folder path
```

## Diff numbers (full-page pixel diff vs. live captures)

| Viewport | Rebuild vs. original | Original vs. itself (noise floor) |
|---|---|---|
| 390px | 11.3–13.3% | 6.8% |
| 768px | 9.4–11.7% | 12.5% |
| 1440px | 4.8–6.5% | 6.9% |

The page is almost entirely animated (4 autoplaying videos, 6 live particle /
drift demos, a typing animation). Two captures of the *original taken 30 min
apart* mismatch by 6.8–12.5% — that is the noise floor for this page. The
rebuild sits at or below the floor at 768/1440. Static geometry was verified
separately: all 15 feed rows match the live site's measured offsets and heights
to the pixel at 390px and 1440px.

The 390px number is inflated by one capture artifact: the first reference
screenshot caught the pixel-select card in its `sm:` (200px) variant, 62px
taller than what the live site serves at 390px today; the rebuild matches the
live site.

## Fidelity ledger

**EXACT (measured/captured)**
- Layout shell: 720px column, `px-8 sm:px-4`, `py-24`, `gap-8` section, `gap-y-4` grid, card padding/radii/borders.
- Design tokens: full `:root` palette, easings, selection color — lifted from computed CSS vars.
- Fonts: PP Neue Montreal (reg/semibold), Neue Montreal Mono, PP Writer, PP Pangram Sans Rounded — the captured font files.
- All captions, dates, card order, teaser row, "Copy prompt" button (incl. Copy→Copied blur swap and mobile square variant).
- 4 video cards (Ghosty, Dia, Amo, Midjourney) — original webm/av1 files + posters.
- Pixel-select graph-paper background — measured gradient stack.
- Galaxy card image set (grid-1…12) and depth/overlay treatment.

**INFERRED (reimplemented from observation; feel-matched, not extracted)**
- The 6 live demos (typer, galaxy drift, VAULT ASCII field, pixel-select cycle, bababooey scan, humandelta tiles, symbols "ab", fire, vector editor). Original runs three of them on three.js GPGPU; rebuilt as 2D canvas with the same visible mechanics (cursor repulsion, sweep assembly, pixel shove + heal). Timings/easings are matched by eye.
- Symbols card appears to morph between shapes (hearts cloud ↔ "ab"); rebuild renders the "ab" state with shimmer + halo only.
- Typer per-character state machine simplified: sliding accent window while typing → green "by me" pill at rest (matches both captured frames).

**SUBSTITUTED (deliberate, for IP hygiene)**
- "Copy prompt" copies a short neutral description, not the author's long-form prompt text.

**NEEDS MANUAL VERIFICATION**
- Hover states inside demos I couldn't trigger during capture (e.g. vector-editor drag/resize, fire sound on click — fire.ogg/fizz.ogg were captured but not wired).
- Mobile touch behaviors of the galaxy drag.

## Legal posture

Third-party site rebuilt for local study; content will be swapped. Do **not**
publish as-is: the Pangram Pangram fonts are licensed commercial faces, and the
videos/photos are the original author's. Once Julio's own content, fonts, and
media replace them, the layout/code is fine to ship.

## Capture bundle

`capture/` (+ `capture2/` re-capture, `diff/`, `diff2/`) hold ground-truth
screenshots, tokens, per-card HTML, and the diff outputs if you want to
re-verify: `node scripts/diff.mjs http://localhost:5173 ./capture2 ./diff2`.
