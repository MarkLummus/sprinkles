import { Placeholder } from './Placeholder.jsx';
import { useBelow724 } from './useBelowDesktop.js';

// The route wrapper for the two addresses that open the creation editor
// (PHONE-01; sketch 016 CONTRACT section 4; PRODUCT.md "On the phone"):
// creating and editing are done in a wider window (CONTRACT section 12). Below 724 the
// address shows the built placeholder place with one line in place of the
// editor, and from 724 up it shows its children untouched. It sits on the
// route element, outside CreationRoute and EditRoute, so below 724 neither
// mounts and none of their draft reads, writes or redirects runs: a kept
// draft is not touched. No control, no link, no effect of its own.
export function DeskOnly({ title, children }) {
  const below724 = useBelow724();
  if (below724) return <Placeholder name={title} note="Done in a wider window." />;
  return children;
}
