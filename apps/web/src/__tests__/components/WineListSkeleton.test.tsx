import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import WineListSkeleton from '../../components/WineListSkeleton';

describe('WineListSkeleton', () => {
  it('renders skeleton cards on mobile', () => {
    const { container } = render(<WineListSkeleton isMobile={true} />);

    const cards = container.querySelectorAll('[data-testid="skeleton-card"]');
    expect(cards).toHaveLength(3);

    const rows = container.querySelectorAll('[data-testid="skeleton-row"]');
    expect(rows).toHaveLength(0);
  });

  it('renders skeleton rows on desktop', () => {
    const { container } = render(<WineListSkeleton isMobile={false} />);

    const rows = container.querySelectorAll('[data-testid="skeleton-row"]');
    expect(rows).toHaveLength(5);

    const cards = container.querySelectorAll('[data-testid="skeleton-card"]');
    expect(cards).toHaveLength(0);
  });
});
