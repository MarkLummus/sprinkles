import PDFKit
import CoreGraphics
let d = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!
print("pages", d.pageCount)
// usage: pdf-pages <pdf> [all|bounds|ink]
// bounds (04-06): per page, the union of the text lines' boxes in PDF points, origin at the bottom left:
//   "--- bounds page N : x0 y0 x1 y1" (a page with no text prints "none"). It counts text a clip hides.
// ink (04-06): per page, the box of every non-white pixel of the page drawn at 2 pixels per point, in the same
//   points and origin: "--- ink page N : x0 y0 x1 y1" ("none" for a blank page). Rules and borders count.
let mode = CommandLine.arguments.count > 2 ? CommandLine.arguments[2] : ""
if mode == "bounds" {
  for i in 0..<d.pageCount {
    guard let page = d.page(at: i) else { continue }
    let box = page.bounds(for: .mediaBox)
    guard let sel = page.selection(for: box) else { print("--- bounds page", i+1, ": none"); continue }
    var u = CGRect.null
    for line in sel.selectionsByLine() { u = u.union(line.bounds(for: page)) }
    print("--- bounds page", i+1, ":", u.isNull ? "none" : "\(u.minX) \(u.minY) \(u.maxX) \(u.maxY)")
  }
} else if mode == "ink" {
  let s: CGFloat = 2
  for i in 0..<d.pageCount {
    guard let page = d.page(at: i) else { continue }
    let box = page.bounds(for: .mediaBox)
    let w = Int(box.width * s), h = Int(box.height * s)
    guard let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { continue }
    ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
    ctx.scaleBy(x: s, y: s)
    page.draw(with: .mediaBox, to: ctx)
    let px = ctx.data!.bindMemory(to: UInt8.self, capacity: w * h * 4)
    var minX = w, maxX = -1, minRow = h, maxRow = -1
    for r in 0..<h { for c in 0..<w {
      let o = (r * w + c) * 4
      if px[o] < 240 || px[o+1] < 240 || px[o+2] < 240 { if c < minX { minX = c }; if c > maxX { maxX = c }; if r < minRow { minRow = r }; if r > maxRow { maxRow = r } }
    } }
    if maxX < 0 { print("--- ink page", i+1, ": none"); continue }
    // memory row 0 is the top of the page: PDF y = (h - row) / s
    print("--- ink page", i+1, ":", "\(CGFloat(minX)/s) \(CGFloat(h - maxRow - 1)/s) \(CGFloat(maxX + 1)/s) \(CGFloat(h - minRow)/s)")
  }
} else {
  for i in 0..<d.pageCount { let t = (d.page(at: i)?.string ?? "").replacingOccurrences(of: "\n", with: " | "); print("--- page", i+1, ":", mode == "all" ? t : String(t.prefix(CommandLine.arguments.count > 2 ? 2000 : 700))) }
}
