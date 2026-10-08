// Sid, 2026-10-07 (D20): for each page of a PDF, the extent of its text in points from the page's left edge, right edge and top edge, and its first and last line.
//   pdf-extents <file.pdf>
import PDFKit
let d = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!
print("pages", d.pageCount)
for i in 0..<d.pageCount {
  let pg = d.page(at: i)!; let b = pg.bounds(for: .mediaBox)
  var minX = CGFloat.infinity, maxX = -CGFloat.infinity, minY = CGFloat.infinity, maxY = -CGFloat.infinity; var first = "", last = ""
  if let sel = pg.selection(for: b) {
    for (k, line) in sel.selectionsByLine().enumerated() {
      let r = line.bounds(for: pg); let t = (line.string ?? "").trimmingCharacters(in: .whitespacesAndNewlines); if t.isEmpty || r.isEmpty { continue }
      minX = min(minX, r.minX); maxX = max(maxX, r.maxX); minY = min(minY, r.minY); maxY = max(maxY, r.maxY); if first.isEmpty { first = t }; last = t; _ = k
    }
  }
  print(String(format: "page %d  %.0f x %.0f pt  text left %.1f  right margin %.1f  top margin %.1f  bottom margin %.1f", i + 1, b.width, b.height, minX - b.minX, b.maxX - maxX, b.maxY - maxY, minY - b.minY), "| first:", String(first.prefix(40)), "| last:", String(last.prefix(60)))
}
