# Shared by ladder.py: the media-resolving and scoping helpers copied from pen.py (see ingredientopts.py for why pen.py is not imported).
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
APP_ROOT = os.path.join(HERE, '..', '..', 'app', 'src', 'styles')
_read = lambda f: open(os.path.join(APP_ROOT, f)).read() + '\n'
TOK, APPC, NBC, SHELLC = _read('tokens.css'), _read('app.css'), _read('notebook.css'), _read('shell.css')

def _strip_comments(css):
    return re.sub(r'/\*.*?\*/', '', css, flags=re.S)

def _block_end(css, k):
    depth = 1; m = k + 1
    while depth:
        depth += (css[m] == '{') - (css[m] == '}'); m += 1
    return m

def _media_true(cond, width, coarse):
    for alt in cond.split(','):
        terms = re.findall(r'\(([^)]*)\)', alt); ok = bool(terms)
        for term in terms:
            t = term.replace(' ', '')
            mm = re.fullmatch(r'(max|min)-width:([\d.]+)px', t)
            if mm: ok = ok and ((width <= float(mm.group(2))) if mm.group(1) == 'max' else (width >= float(mm.group(2))))
            elif t == 'pointer:coarse': ok = ok and coarse
            else: ok = False
        if ok: return True
    return False

def resolve_media(css, width, coarse):
    """Unwrap the top-level @media blocks that hold at this window width and pointer; drop the rest (forced colours, print)."""
    css = _strip_comments(css); out = []; i = 0
    while True:
        j = css.find('@media', i)
        if j < 0: out.append(css[i:]); break
        out.append(css[i:j]); k = css.index('{', j); m = _block_end(css, k)
        if _media_true(css[j + 6:k].strip(), width, coarse): out.append(css[k + 1:m - 1])
        i = m
    return ''.join(out)

def _top_commas(sel):
    parts = []; depth = 0; cur = ''
    for ch in sel:
        depth += (ch in '([') - (ch in ')]')
        if ch == ',' and depth == 0: parts.append(cur); cur = ''
        else: cur += ch
    parts.append(cur); return parts

def scope_css(css, scope):
    """Prefix every rule with the panel's class; body becomes the panel itself."""
    out = []; i = 0
    while True:
        k = css.find('{', i)
        if k < 0: break
        sel = css[i:k].strip(); m = _block_end(css, k)
        assert not sel.startswith('@'), sel
        new = []
        for p in _top_commas(sel):
            p = p.strip()
            assert not p.startswith(':root') and not p.startswith('html'), p
            new.append(scope if p == 'body' else scope + ' ' + p)
        out.append(', '.join(new) + '{' + css[k + 1:m - 1] + '}\n'); i = m
    return ''.join(out)

# One document holds four copies of the pen, and radio buttons of one name form one group across the document, so a pick in one
# panel would clear the same pick in another. Each panel's names, ids and the aria references to them take the panel's suffix.
def unique_ids(html, vid):
    html = re.sub(r' (name|id)="([^"]*)"', lambda m: ' %s="%s-%s"' % (m.group(1), m.group(2), vid), html)
    return re.sub(r' (aria-(?:labelledby|describedby|controls))="([^"]*)"',
                  lambda m: ' %s="%s"' % (m.group(1), ' '.join(i + '-' + vid for i in m.group(2).split())), html)

