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
});
