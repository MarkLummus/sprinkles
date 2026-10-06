// WebKit print reproduction: load a URL in a WKWebView (fresh, non-persistent store),
// wait for the Sheet's table, optionally inject CSS, then print through NSPrintOperation
// to a PDF on a Letter page with iPad-like margins (36pt sides/top, 50pt foot).
// usage: wkprint <url> <out.pdf> [css-file] [js-to-eval-before-print]
import AppKit
import WebKit

let args = CommandLine.arguments
let url = URL(string: args[1])!
let outPath = args[2]
let cssPath: String? = args.count > 3 && !args[3].isEmpty ? args[3] : nil
let preJS: String? = args.count > 4 && !args[4].isEmpty ? args[4] : nil

final class Runner: NSObject, WKNavigationDelegate {
  let window: NSWindow
  let web: WKWebView
  var tries = 0

  override init() {
    let conf = WKWebViewConfiguration()
    conf.websiteDataStore = .nonPersistent()
    if let p = cssPath, let css = try? String(contentsOfFile: p, encoding: .utf8) {
      let js = "(()=>{const s=document.createElement('style');s.id='dbg-css';s.textContent=\(String(reflecting: css));document.documentElement.appendChild(s);})();"
      conf.userContentController.addUserScript(WKUserScript(source: js, injectionTime: .atDocumentEnd, forMainFrameOnly: true))
    }
    web = WKWebView(frame: NSRect(x: 0, y: 0, width: 1024, height: 1366), configuration: conf)
    window = NSWindow(contentRect: NSRect(x: -3000, y: 0, width: 1024, height: 1366), styleMask: [.titled], backing: .buffered, defer: false)
    super.init()
    window.contentView = web
    window.orderFront(nil)
    web.navigationDelegate = self
    web.load(URLRequest(url: url))
  }

  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { poll() }

  func poll() {
    tries += 1
    let check = "!!document.querySelector('.ingredient-table') && document.fonts.status === 'loaded'"
    web.evaluateJavaScript(check) { result, _ in
      if (result as? Bool) == true || self.tries > 60 {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { self.prePrint() }
      } else {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { self.poll() }
      }
    }
  }

  func prePrint() {
    guard let js = preJS else { print_(); return }
    web.evaluateJavaScript(js) { r, e in
      if let e = e { FileHandle.standardError.write("preJS error: \(e)\n".data(using: .utf8)!) }
      if let r = r { print("preJS:", r) }
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { self.print_() }
    }
  }

  func print_() {
    let info = NSPrintInfo(dictionary: [
      NSPrintInfo.AttributeKey.jobDisposition: NSPrintInfo.JobDisposition.save,
      NSPrintInfo.AttributeKey.jobSavingURL: URL(fileURLWithPath: outPath),
    ])
    info.paperSize = NSSize(width: 612, height: 792)
    info.topMargin = 36
    info.bottomMargin = 50
    info.leftMargin = 36
    info.rightMargin = 36
    info.horizontalPagination = .automatic
    info.verticalPagination = .automatic
    info.isHorizontallyCentered = false
    info.isVerticallyCentered = false
    let op = web.printOperation(with: info)
    op.showsPrintPanel = false
    op.showsProgressPanel = false
    op.view?.frame = web.bounds
    op.runModal(for: window, delegate: self, didRun: #selector(done(_:success:contextInfo:)), contextInfo: nil)
  }

  @objc func done(_ op: NSPrintOperation, success: Bool, contextInfo: UnsafeMutableRawPointer?) {
    print("printed:", success, outPath)
    NSApp.terminate(nil)
  }
}

let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let runner = Runner()
DispatchQueue.main.asyncAfter(deadline: .now() + 90) { print("timeout"); exit(2) }
app.run()
