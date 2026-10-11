import PDFKit
let d = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!
print("pages", d.pageCount)
// usage: pdf-pages <pdf> [all|bounds]
// bounds (04-06): per page, the union of the text lines' boxes in PDF points, origin at the bottom left:
// "--- bounds page N : x0 y0 x1 y1" (a page with no text prints "none").
if CommandLine.arguments.count > 2 && CommandLine.arguments[2] == "bounds" {
  for i in 0..<d.pageCount {
    guard let page = d.page(at: i) else { continue }
    let box = page.bounds(for: .mediaBox)
    guard let sel = page.selection(for: box) else { print("--- bounds page", i+1, ": none"); continue }
    var u = CGRect.null
    for line in sel.selectionsByLine() { u = u.union(line.bounds(for: page)) }
    print("--- bounds page", i+1, ":", u.isNull ? "none" : "\(u.minX) \(u.minY) \(u.maxX) \(u.maxY)")
  }
} else {
  for i in 0..<d.pageCount { let t = (d.page(at: i)?.string ?? "").replacingOccurrences(of: "\n", with: " | "); print("--- page", i+1, ":", CommandLine.arguments.count > 2 && CommandLine.arguments[2] == "all" ? t : String(t.prefix(CommandLine.arguments.count > 2 ? 2000 : 700))) }
}
