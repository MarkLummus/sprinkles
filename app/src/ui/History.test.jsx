import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HistoryDisclosure, HistoryPanel, HistoryList, HistoryItem, HistoryMarkers } from './History.jsx';

describe('shared history semantics', () => {
  it('keeps a disclosure target when closed without exposing links or content', () => {
    const markup = renderToStaticMarkup(<>
      <HistoryDisclosure open={false} panelId="attempts" onToggle={() => {}}>Attempts (2)</HistoryDisclosure>
      <HistoryPanel open={false} id="attempts" title="Attempts"><a href="/record">Record</a></HistoryPanel>
    </>);
    expect(markup).toContain('aria-expanded="false" aria-controls="attempts"');
    expect(markup).toContain('id="attempts" hidden=""');
    expect(markup).not.toContain('<a');
  });

  it('names an open panel and preserves native nested list semantics', () => {
    const markup = renderToStaticMarkup(
      <HistoryPanel id="plans" title="Plans">
        <HistoryList ordered label="Plans">
          <li>
            <HistoryItem as="article" current>First<HistoryMarkers current latest /></HistoryItem>
            <HistoryList ordered nested="branches" label="Children">
              <HistoryItem>Child</HistoryItem>
            </HistoryList>
          </li>
        </HistoryList>
      </HistoryPanel>,
    );
    expect(markup).toContain('aria-label="Plans"');
    expect(markup).toContain('<ol role="list" aria-label="Children"');
    expect(markup.match(/aria-current="true"/g)).toHaveLength(1);
    expect(markup).toContain(' · In view · Latest');
    expect(markup).toContain('<li class="history-item">Child</li>');
  });

  it('keeps Latest independent of the record in view', () => {
    expect(renderToStaticMarkup(<HistoryMarkers latest />)).toContain(' · Latest');
    expect(renderToStaticMarkup(<HistoryMarkers current />)).not.toContain('Latest');
    expect(renderToStaticMarkup(<HistoryMarkers />)).toBe('');
  });
});
