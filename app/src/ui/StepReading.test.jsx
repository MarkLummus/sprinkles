// The read-only step in the printed treatment (plan 11-04; decision 014 2).
// Renders through renderToStaticMarkup in the node environment: no links and no
// router context are needed.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StepAside, StepPurpose, StepReading, StepTargets } from './StepReading.jsx';

const html = (element) => renderToStaticMarkup(element);

describe('StepTargets', () => {
  it('renders one chip per target, label then value, in the tag row', () => {
    const markup = html(<StepTargets targets={[{ label: 'temp', value: '85 °C' }, { label: 'hold', value: '2 min' }]} />);
    expect(markup).toBe(
      '<p class="method-step__targets method-step__targets--tags">' +
        '<span class="target-chip"><span class="target-chip__label">temp</span><span class="target-chip__value">85 °C</span></span>' +
        '<span class="target-chip"><span class="target-chip__label">hold</span><span class="target-chip__value">2 min</span></span>' +
        '</p>',
    );
  });

  it('renders nothing for an empty or missing list', () => {
    expect(html(<StepTargets targets={[]} />)).toBe('');
    expect(html(<StepTargets targets={undefined} />)).toBe('');
  });
});

describe('StepPurpose and StepAside', () => {
  it('the purpose reads the caps word why, an em dash and the sentence', () => {
    expect(html(<StepPurpose text="The powder dissolves." />)).toBe(
      '<p class="method-step__purpose"><span class="method-step__purpose-label">why</span> — The powder dissolves.</p>',
    );
  });

  it('the aside is a paragraph of the text', () => {
    expect(html(<StepAside text="Watch the pan." />)).toBe('<p class="method-step__aside">Watch the pan.</p>');
  });

  it('render nothing for an empty or missing text', () => {
    expect(html(<StepPurpose text="" />)).toBe('');
    expect(html(<StepPurpose />)).toBe('');
    expect(html(<StepAside text="" />)).toBe('');
    expect(html(<StepAside />)).toBe('');
  });
});

describe('stored words render as text, never markup (T-11-13)', () => {
  const hostile = '<b>&amp;';

  it('a target, a purpose and an aside holding markup read escaped, with no element', () => {
    const markup = html(
      <>
        <StepTargets targets={[{ label: hostile, value: hostile }]} />
        <StepPurpose text={hostile} />
        <StepAside text={hostile} />
      </>,
    );
    expect(markup).toContain('&lt;b&gt;&amp;amp;');
    expect(markup).not.toContain('<b>');
  });
});

describe('StepReading', () => {
  const step = {
    n: 1,
    leadIn: 'Warm the milk',
    instruction: 'Whisk the milk powder into the milk.',
    targets: [{ label: 'temp', value: '85 °C' }],
    purpose: 'The powder dissolves without lumps.',
    aside: 'Do not boil.',
  };

  it('reads the margin number, the lead, then targets, purpose and aside in that order', () => {
    const markup = html(<StepReading step={step} number="1" />);
    expect(markup).toContain('<li class="method-step"><span class="method-step__n" aria-hidden="true">1</span>');
    expect(markup).toContain('<p class="method-step__lead"><span><b>Warm the milk.</b> Whisk the milk powder into the milk.</span></p>');
    const order = ['method-step__lead', 'method-step__targets', 'method-step__purpose"', 'method-step__aside'].map((name) =>
      markup.indexOf(name),
    );
    expect(order.every((index) => index > -1)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('leaves out the targets, purpose and aside a step does not carry', () => {
    const markup = html(<StepReading step={{ n: 2, leadIn: 'Churn', instruction: 'Churn it.' }} number="2" />);
    expect(markup).not.toContain('method-step__targets');
    expect(markup).not.toContain('method-step__purpose');
    expect(markup).not.toContain('method-step__aside');
  });
});
