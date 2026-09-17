import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FieldFeedback } from './FieldFeedback.jsx';

describe('FieldFeedback', () => {
  it('shows quiet required guidance when the field has no error', () => {
    expect(renderToStaticMarkup(<FieldFeedback required errorId="field-error-example" />)).toBe(
      '<span class="field-requirement" aria-hidden="true">Required</span>',
    );
  });

  it('replaces required guidance with the field-owned error', () => {
    expect(renderToStaticMarkup(
      <FieldFeedback required error="Enter a value." errorId="field-error-example" />,
    )).toBe('<span id="field-error-example" class="field-error">Enter a value.</span>');
  });

  it('renders nothing for an optional valid field', () => {
    expect(renderToStaticMarkup(<FieldFeedback errorId="field-error-example" />)).toBe('');
  });
});
