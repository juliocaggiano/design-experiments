import AppKit

let root = "/Users/juliocaggiano/Desktop/CLAUDE:CODEX/arlan-vault/artifacts/design-qa/border-beam"
let reference = NSImage(contentsOfFile: "\(root)/source/desktop-line-ocean-playground.jpg")!
let implementation = NSImage(contentsOfFile: "\(root)/implementation/desktop-ocean-line-demo.jpg")!
let width = 1700
let height = 560

let bitmap = NSBitmapImageRep(
  bitmapDataPlanes: nil,
  pixelsWide: width,
  pixelsHigh: height,
  bitsPerSample: 8,
  samplesPerPixel: 4,
  hasAlpha: true,
  isPlanar: false,
  colorSpaceName: .deviceRGB,
  bytesPerRow: 0,
  bitsPerPixel: 0
)!

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
NSColor(calibratedWhite: 0.92, alpha: 1).setFill()
NSRect(x: 0, y: 0, width: width, height: height).fill()

let labels = ["Reference — Ocean · Line · 70%", "Vault build — Ocean · Line · 70%"]
let images = [reference, implementation]
let slots = [
  NSRect(x: 24, y: 24, width: 814, height: 478),
  NSRect(x: 862, y: 24, width: 814, height: 478),
]

for index in 0..<2 {
  let slot = slots[index]
  let panel = NSBezierPath(roundedRect: slot, xRadius: 16, yRadius: 16)
  NSColor.white.setFill()
  panel.fill()

  labels[index].draw(
    at: NSPoint(x: slot.minX + 16, y: slot.maxY - 33),
    withAttributes: [
      .font: NSFont.systemFont(ofSize: 15, weight: .medium),
      .foregroundColor: NSColor(calibratedWhite: 0.18, alpha: 1),
    ]
  )

  let image = images[index]
  let imageSlot = NSRect(x: slot.minX + 14, y: slot.minY + 14, width: slot.width - 28, height: slot.height - 60)
  let scale = min(imageSlot.width / image.size.width, imageSlot.height / image.size.height)
  let drawSize = NSSize(width: image.size.width * scale, height: image.size.height * scale)
  let drawRect = NSRect(
    x: imageSlot.midX - drawSize.width / 2,
    y: imageSlot.midY - drawSize.height / 2,
    width: drawSize.width,
    height: drawSize.height
  )
  image.draw(in: drawRect)
}

NSGraphicsContext.restoreGraphicsState()
let output = bitmap.representation(using: .jpeg, properties: [.compressionFactor: 0.92])!
try output.write(to: URL(fileURLWithPath: "\(root)/comparison-ocean-line.jpg"))
