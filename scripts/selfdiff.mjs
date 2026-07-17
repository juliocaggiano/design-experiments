import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
for (const w of [390, 768, 1440]) {
  const a = PNG.sync.read(fs.readFileSync(`capture/screenshots/${w}.png`));
  const b = PNG.sync.read(fs.readFileSync(`capture2/screenshots/${w}.png`));
  const W = Math.min(a.width, b.width);
  const H = Math.min(a.height, b.height);
  const crop = (img) => {
    const out = new PNG({ width: W, height: H });
    PNG.bitblt(img, out, 0, 0, W, H, 0, 0);
    return out;
  };
  const ca = crop(a), cb = crop(b);
  const diff = new PNG({ width: W, height: H });
  const n = pixelmatch(ca.data, cb.data, diff.data, W, H, { threshold: 0.1 });
  console.log(`${w}px: original-vs-original mismatch ${(100 * n / (W * H)).toFixed(1)}% (heights ${a.height} vs ${b.height})`);
}
