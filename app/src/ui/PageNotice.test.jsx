// @vitest-environment jsdom
//
// The page notice for the routes other than the recipe route (Phase 10, D-10a):
// the message clears after 5 s unless it persists, only if it is still the same
// message, and the announcer registers with the context's registrar and is
// released on unmount.
import { act } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { PageNotice, PageNoticeContext, usePageNotice } from './PageNotice.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let mounted = null;
let announceRef = null;

function Page() {
  const [message, announce] = usePageNotice();
  announceRef = announce;
  return <PageNotice message={message} />;
}

async function mount(registrar) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted = { container, root };
  await act(async () => {
    root.render(
      registrar ? (
        <PageNoticeContext.Provider value={registrar}>
          <Page />
        </PageNoticeContext.Provider>
      ) : (
        <Page />
      ),
    );
  });
  return container;
}

const text = () => mounted.container.querySelector('.page-status').textContent;

afterEach(async () => {
  vi.useRealTimers();
  if (mounted) {
    await act(async () => mounted.root.unmount());
    mounted.container.remove();
    mounted = null;
  }
});

describe('PageNotice', () => {
  it('renders the anchor and the status region with the existing classes', async () => {
    const container = await mount();
    const status = container.querySelector('div.page-status-anchor > p.page-status');
    expect(status.getAttribute('role')).toBe('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toBe('');
  });

  it('clears a message after 5 s, but keeps a persisted one', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await mount();
    await act(async () => announceRef('Draft discarded.'));
    expect(text()).toBe('Draft discarded.');
    await act(async () => vi.advanceTimersByTime(4999));
    expect(text()).toBe('Draft discarded.');
    await act(async () => vi.advanceTimersByTime(1));
    expect(text()).toBe('');

    await act(async () => announceRef('Stays.', { persist: true }));
    await act(async () => vi.advanceTimersByTime(60000));
    expect(text()).toBe('Stays.');
  });

  it('a newer message is not cleared by an older message’s timer', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await mount();
    await act(async () => announceRef('First.'));
    await act(async () => vi.advanceTimersByTime(3000));
    await act(async () => announceRef('Second.'));
    await act(async () => vi.advanceTimersByTime(3000));
    expect(text()).toBe('Second.');
    await act(async () => vi.advanceTimersByTime(2000));
    expect(text()).toBe('');
  });

  it('registers its announcer with the context’s registrar and releases it on unmount', async () => {
    const release = vi.fn();
    const registrar = vi.fn(() => release);
    await mount(registrar);
    expect(registrar).toHaveBeenCalledTimes(1);
    expect(registrar.mock.calls[0][0]).toBe(announceRef);
    expect(release).not.toHaveBeenCalled();
    await act(async () => mounted.root.unmount());
    mounted.container.remove();
    mounted = null;
    expect(release).toHaveBeenCalledTimes(1);
  });
});
