import { STANDING_WORDS, standingFor } from '../domain/lastEvent.js';

// The recipe band's Go to batch row (sketch 011 decisions 30, 33 and 43; boards
// 393-phone-log.html, 723-phone-log.html and 724-1365-go-to-batch.html; quick
// 261002-wmy). Below 1366 the batch log sits under the Sheet, two to four
// screens under the band, so the band carries one row, built in History's row
// grammar: the control word underlined on the left, then a dot and the batch's
// standing in 12px, the whole row one link at least 44px tall.
//
// The status reads the log's own batches (the version in view's), through
// the one standing map Home uses, so the band and the log it jumps to cannot
// disagree. The words come only from that map: no stored text reaches the
// row. The comma-joined aria-label follows FoldRow's rule (G-03.5-7) so
// VoiceOver pauses between the control word and the status.
//
// Activating it calls onGo, which moves focus to the log's Batch heading
// through the page's existing focus landing. The browser's own fragment
// navigation is not used: it neither reliably focuses a tabindex -1 heading
// in WebKit and Chrome nor leaves react-router's history alone. The CSS, not
// a media hook, hides the row from 1366 up (notebook.css, .notebook-jump).
export function GoToBatch({ batches, onGo }) {
  const words = STANDING_WORDS[standingFor(batches)];
  return (
    <a
      className="notebook-jump"
      href="#batch"
      tabIndex={0}
      aria-label={`Go to batch, ${words}`}
      onClick={(event) => {
        event.preventDefault();
        onGo();
      }}
    >
      <span className="notebook-jump__control">Go to batch</span>
      <span className="notebook-jump__status">{words}</span>
    </a>
  );
}
