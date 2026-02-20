import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import MobileFilterToggle from '../../components/MobileFilterToggle';
import MobileSortSelector from '../../components/MobileSortSelector';
import LoadingSpinner from '../../components/LoadingSpinner';
import WineListSkeleton from '../../components/WineListSkeleton';

describe('Small Components Accessibility', () => {
  it('MobileFilterToggle has no accessibility violations', async () => {
    const { container } = render(<MobileFilterToggle onClick={vi.fn()} activeFilterCount={3} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('MobileSortSelector has no accessibility violations', async () => {
    const { container } = render(
      <MobileSortSelector sortBy="name" sortDirection="asc" onSort={vi.fn()} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('LoadingSpinner has no accessibility violations', async () => {
    const { container } = render(<LoadingSpinner size="sm" />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('WineListSkeleton has no accessibility violations', async () => {
    const { container } = render(<WineListSkeleton isMobile={false} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
