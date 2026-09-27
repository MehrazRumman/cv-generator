// Renders page 1 of every sample PDF to a JPEG thumbnail for the home page and template picker.
// macOS only (PDFKit). Usage: swift scripts/pdf-thumbnails.swift sample-output public/templates 420
import AppKit
import Foundation
import PDFKit

let args = CommandLine.arguments
let inDir = URL(fileURLWithPath: args[1])
let outDir = URL(fileURLWithPath: args[2])
let width = CGFloat(Double(args.count > 3 ? args[3] : "420") ?? 420)
try FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

let files = try FileManager.default.contentsOfDirectory(atPath: inDir.path)
  .filter { $0.hasSuffix(".pdf") && !$0.contains("-sample") }
  .sorted()
for file in files {
  guard let doc = PDFDocument(url: inDir.appendingPathComponent(file)), let page = doc.page(at: 0) else { continue }
  let box = page.bounds(for: .mediaBox)
  let scale = width / box.width
  let w = Int(box.width * scale), h = Int(box.height * scale)
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h, bitsPerSample: 8, samplesPerPixel: 4,
                             hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  let ctx = NSGraphicsContext(bitmapImageRep: rep)!
  NSGraphicsContext.current = ctx
  ctx.cgContext.setFillColor(NSColor.white.cgColor)
  ctx.cgContext.fill(CGRect(x: 0, y: 0, width: w, height: h))
  ctx.cgContext.scaleBy(x: scale, y: scale)
  page.draw(with: .mediaBox, to: ctx.cgContext)
  NSGraphicsContext.restoreGraphicsState()
  let name = file.replacingOccurrences(of: ".pdf", with: ".jpg")
  try rep.representation(using: .jpeg, properties: [.compressionFactor: 0.78])!.write(to: outDir.appendingPathComponent(name))
  print("✓ \(name)")
}
