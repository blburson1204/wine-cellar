import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import FilterDrawer from '../../components/FilterDrawer';

describe('FilterDrawer Accessibility', () => {
  it('has no accessibility violations when open', async () => {
    const { container } = render(
      <FilterDrawer isOpen={true} onClose={vi.fn()}>
        <div>Filter content</div>
      </FilterDrawer>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with complex content', async () => {
    const { container } = render(
      <FilterDrawer isOpen={true} onClose={vi.fn()}>
        <div>
          <h2>Filters</h2>
          <button>Filter button</button>
          <input type="text" aria-label="Search" />
          <select aria-label="Sort">
            <option>Name</option>
            <option>Vintage</option>
          </select>
        </div>
      </FilterDrawer>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('returns null when closed (no violations)', async () => {
    const { container } = render(
      <FilterDrawer isOpen={false} onClose={vi.fn()}>
        <div>Filter content</div>
      </FilterDrawer>
    );

    // When closed, component returns null - no DOM to audit
    expect(container.firstChild).toBeNull();
  });
});
