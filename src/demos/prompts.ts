/* The original page ships each demo's long-form build prompt for its
   "Copy prompt" button. Those are the author's written content, so this
   rebuild copies short neutral descriptions instead — swap in your own. */
export const PROMPTS = {
  galaxy: 'Build a perspective field of small images drifting vertically with depth parallax, infinite wrap, and drag to pan.',
  asciiVault: 'Build a live ASCII particle field that spells a word, with particles that drift and react to the cursor.',
  pixelSelect: 'Build a canvas image-pixelization effect cycling through images, pixelizing in and out with a slide/scale/skew swap.',
  bababooey: 'Build a WebGL-style fragment effect over a word: a diagonal band assembles the word from tiny colored blocks, then rests as solid text with a cursor-lit wake.',
  fire: 'Build Minecraft fire on a 2D canvas: a 16x16, 32-frame flipbook drawn as crisp blocks with a cursor-editable pixel buffer that heals back over time.',
  tiles: 'Build a wordmark rendered as a dense grid of square tiles with a slow morphing color wave and a cursor light brush.',
} as const
