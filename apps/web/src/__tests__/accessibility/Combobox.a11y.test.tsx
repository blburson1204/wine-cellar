import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Combobox from '../../components/Combobox';

describe('Combobox Accessibility', () => {
  it('has no accessibility violations with empty options', async () => {
    const { container } = render(
      <Combobox id="test-field" label="Test Field" value="" onChange={vi.fn()} options={[]} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with populated options', async () => {
    const { container } = render(
      <Combobox
        id="producer"
        label="Producer"
        value="Test Producer"
        onChange={vi.fn()}
        options={['Test Producer', 'Another Producer', 'Third Producer']}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations when required', async () => {
    const { container } = render(
      <Combobox
        id="producer-required"
        label="Producer"
        value=""
        onChange={vi.fn()}
        options={['Producer 1', 'Producer 2']}
        required={true}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with error state', async () => {
    const { container } = render(
      <Combobox
        id="producer-error"
        label="Producer"
        value=""
        onChange={vi.fn()}
        options={['Producer 1']}
        error="Producer is required"
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with long option lists', async () => {
    const longOptions = Array.from({ length: 50 }, (_, i) => `Option ${i + 1}`);

    const { container } = render(
      <Combobox
        id="country"
        label="Country"
        value="Option 25"
        onChange={vi.fn()}
        options={longOptions}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
