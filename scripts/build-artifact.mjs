import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/* Assemble the self-contained artifact: template + base64 assets + content.
   The prompt and code excerpts are read from the detail page source so the
   artifact never drifts from the app. */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tpl = fs.readFileSync(path.join(root, 'scripts/artifact-template.html'), 'utf8')

const b64 = (p) => fs.readFileSync(path.join(root, 'public/vault/overlay', p)).toString('base64')

// the extracted text is raw .tsx source — resolve template-literal escapes
const unescape = (s) => s.replace(/\\`/g, '`').replace(/\\\$\{/g, '${').replace(/\\\\/g, '\\')

function extract(file) {
  const src = fs.readFileSync(path.join(root, 'src/pages', file), 'utf8')
  const promptMatch = src.match(/const BUILD_PROMPT = `([\s\S]*?)`\n/)
  if (!promptMatch) throw new Error(`BUILD_PROMPT not found in ${file}`)
  const tabs = []
  const tabRe = /file: '([^']+)',\s*\n\s*code: `([\s\S]*?)`,\n\s*\}/g
  let m
  while ((m = tabRe.exec(src))) tabs.push({ file: m[1], code: unescape(m[2]) })
  if (tabs.length !== 3) throw new Error(`expected 3 code tabs in ${file}, got ${tabs.length}`)
  return { prompt: unescape(promptMatch[1]), tabs }
}

const overlay = extract('MeetingOverlayDetail.tsx')
const springs = extract('FluidSpringsDetail.tsx')
const sheet = extract('SheetDetail.tsx')
const materials = extract('MaterialsDetail.tsx')
const buttons = extract('MicroButtonsDetail.tsx')

/* Copy buttons ship prompt + the complete implementation (mirrors
   assembleCopy in detail-kit.tsx) so people can paste working code. */
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const assemble = (prompt, files) => {
  const blocks = files
    .map(([name, p]) => `### ${name}\n\n\`\`\`\n${read(p).trim()}\n\`\`\``)
    .join('\n\n')
  return `${prompt}\n\nThe complete implementation follows, one file per block — paste it as-is, or hand the whole thing to your AI tool to adapt.\n\n${blocks}`
}

const overlayCopy = assemble(overlay.prompt, [
  ['run.py', 'src/content/overlay/run.py'],
  ['config.py', 'src/content/overlay/config.py'],
  ['src/app.py', 'src/content/overlay/app.py'],
  ['src/overlay_window.py', 'src/content/overlay/overlay_window.py'],
  ['src/sprites.py', 'src/content/overlay/sprites.py'],
  ['src/animation_controller.py', 'src/content/overlay/animation_controller.py'],
  ['src/notification_panel.py', 'src/content/overlay/notification_panel.py'],
  ['src/calendar_source.py', 'src/content/overlay/calendar_source.py'],
  ['src/scheduler.py', 'src/content/overlay/scheduler.py'],
  ['web/OverlayDemo.tsx (browser replay)', 'src/demos/OverlayDemo.tsx'],
])
const springsCopy = assemble(springs.prompt, [['FluidSpring.tsx', 'src/demos/FluidSpring.tsx']])
const sheetCopy = assemble(sheet.prompt, [['SheetDemo.tsx', 'src/demos/SheetDemo.tsx']])
const materialsCopy = assemble(materials.prompt, [['MaterialsDemo.tsx', 'src/demos/MaterialsDemo.tsx']])
const buttonsCopy = assemble(buttons.prompt, [['MicroButtonsDemo.tsx', 'src/demos/MicroButtonsDemo.tsx']])

const out = tpl
  .replace('__FONT_B64__', b64('PressStart2P.ttf'))
  .replace('__WALK_B64__', b64('clawd_walk.png'))
  .replace('__IDLE_B64__', b64('clawd_idle.png'))
  .replace('__CODE_TABS__', JSON.stringify(overlay.tabs))
  .replace('__PROMPT__', JSON.stringify(overlayCopy))
  .replace('__CODE_TABS2__', JSON.stringify(springs.tabs))
  .replace('__PROMPT2__', JSON.stringify(springsCopy))
  .replace('__CODE_TABS3__', JSON.stringify(sheet.tabs))
  .replace('__PROMPT3__', JSON.stringify(sheetCopy))
  .replace('__CODE_TABS4__', JSON.stringify(materials.tabs))
  .replace('__PROMPT4__', JSON.stringify(materialsCopy))
  .replace('__CODE_TABS5__', JSON.stringify(buttons.tabs))
  .replace('__PROMPT5__', JSON.stringify(buttonsCopy))

const dest = process.argv[2] || path.join(root, 'dist-artifact/vault-caggiano.html')
fs.mkdirSync(path.dirname(dest), { recursive: true })
fs.writeFileSync(dest, out)
console.log('wrote', dest, `${(out.length / 1024).toFixed(0)}KB`)
