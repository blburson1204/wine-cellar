import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import WineListSkeleton from '../../components/WineListSkeleton';

describe('WineListSkeleton', () => {
  describe('Mobile view (card skeletons)', () => {
    it('renders 3 skeleton cards on mobile', () => {
      const { container } = render(<WineListSkeleton isMobile={true} />);

      const cards = container.querySelectorAll('[data-testid="skeleton-card"]');
      expect(cards).toHaveLength(3);
    });

    it('each card has animate-pulse class', () => {
      const { container } = render(<WineListSkeleton isMobile={true} />);

      const cards = container.querySelectorAll('[data-testid="skeleton-card"]');
      cards.forEach((card) => {
        expect(card.className).toMatch(/animate-pulse/);
      });
    });

    it('each card has multiple placeholder lines', () => {
      const { container } = render(<WineListSkeleton isMobile={true} />);

      const cards = container.querySelectorAll('[data-testid="skeleton-card"]');
      cards.forEach((card) => {
        const lines = card.querySelectorAll('[data-testid="skeleton-line"]');
        expect(lines.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('does not render table rows on mobile', () => {
      const { container } = render(<WineListSkeleton isMobile={true} />);

      const rows = container.querySelectorAll('[data-testid="skeleton-row"]');
      expect(rows).toHaveLength(0);
    });
  });

  describe('Desktop view (table row skeletons)', () => {
    it('renders 5 skeleton rows on desktop', () => {
      const { container } = render(<WineListSkeleton isMobile={false} />);

      const rows = container.querySelectorAll('[data-testid="skeleton-row"]');
      expect(rows).toHaveLength(5);
    });

    it('each row has animate-pulse class', () => {
      const { container } = render(<WineListSkeleton isMobile={false} />);

      const rows = container.querySelectorAll('[data-testid="skeleton-row"]');
      rows.forEach((row) => {
        expect(row.className).toMatch(/animate-pulse/);
      });
    });

    it('each row has placeholder bars', () => {
      const { container } = render(<WineListSkeleton isMobile={false} />);

      const rows = container.querySelectorAll('[data-testid="skeleton-row"]');
      rows.forEach((row) => {
        const bars = row.querySelectorAll('[data-testid="skeleton-bar"]');
        expect(bars.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('does not render cards on desktop', () => {
      const { container } = render(<WineListSkeleton isMobile={false} />);

      const cards = container.querySelectorAll('[data-testid="skeleton-card"]');
      expect(cards).toHaveLength(0);
    });
  });

  describe('Styling', () => {
    it('renders without crashing', () => {
      const { container } = render(<WineListSkeleton isMobile={true} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('uses rounded corners on skeleton elements', () => {
      const { container } = render(<WineListSkeleton isMobile={true} />);

      const cards = container.querySelectorAll('[data-testid="skeleton-card"]');
      cards.forEach((card) => {
        expect(card.className).toMatch(/rounded/);
      });
    });
  });
});
