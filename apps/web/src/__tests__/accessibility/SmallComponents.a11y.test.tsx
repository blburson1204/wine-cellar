import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import MobileFilterToggle from '../../components/MobileFilterToggle';
import MobileSortSelector from '../../components/MobileSortSelector';
import LoadingSpinner from '../../components/LoadingSpinner';
import WineListSkeleton from '../../components/WineListSkeleton';

describe('Small Components Accessibility', () => {
  describe('MobileFilterToggle', () => {
    it('has no accessibility violations without active filters', async () => {
      const { container } = render(<MobileFilterToggle onClick={vi.fn()} activeFilterCount={0} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with active filters', async () => {
      const { container } = render(<MobileFilterToggle onClick={vi.fn()} activeFilterCount={5} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('MobileSortSelector', () => {
    it('has no accessibility violations with default sort', async () => {
      const { container } = render(
        <MobileSortSelector sortBy="name" sortDirection="asc" onSort={vi.fn()} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with descending sort', async () => {
      const { container } = render(
        <MobileSortSelector sortBy="vintage" sortDirection="desc" onSort={vi.fn()} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('LoadingSpinner', () => {
    it('has no accessibility violations with small size', async () => {
      const { container } = render(<LoadingSpinner size="sm" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations with medium size', async () => {
      const { container } = render(<LoadingSpinner size="md" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WineListSkeleton', () => {
    it('has no accessibility violations in desktop mode', async () => {
      const { container } = render(<WineListSkeleton isMobile={false} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations in mobile mode', async () => {
      const { container } = render(<WineListSkeleton isMobile={true} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
