import PDFKit
let d = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!
print("pages", d.pageCount)
for i in 0..<d.pageCount { let t = (d.page(at: i)?.string ?? "").replacingOccurrences(of: "\n", with: " | "); print("--- page", i+1, ":", CommandLine.arguments.count > 2 && CommandLine.arguments[2] == "all" ? t : String(t.prefix(CommandLine.arguments.count > 2 ? 2000 : 700))) }
