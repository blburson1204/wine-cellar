import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import WineTable from '../../components/WineTable';

// Mock useMediaQuery hook
vi.mock('../../hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(),
}));

import { useMediaQuery } from '../../hooks/useMediaQuery';

const mockWines = [
  {
    id: '1',
    name: 'Chateau Test',
    vintage: 2020,
    producer: 'Test Producer',
    region: 'Bordeaux',
    country: 'France',
    grapeVariety: 'Cabernet Sauvignon',
    blendDetail: null,
    color: 'RED',
    quantity: 6,
    purchasePrice: 50,
    purchaseDate: '2022-01-15',
    drinkByDate: '2030-12-31',
    rating: 90,
    notes: 'Test notes',
    expertRatings: null,
    wherePurchased: 'Wine Shop',
    wineLink: null,
    favorite: false,
    imageUrl: null,
  },
  {
    id: '2',
    name: 'Vintage Blanc',
    vintage: 2021,
    producer: 'White Producer',
    region: 'Loire',
    country: 'France',
    grapeVariety: 'Sauvignon Blanc',
    blendDetail: null,
    color: 'WHITE',
    quantity: 12,
    purchasePrice: 30,
    purchaseDate: '2023-01-15',
    drinkByDate: '2025-12-31',
    rating: 85,
    notes: null,
    expertRatings: null,
    wherePurchased: 'Wine Shop',
    wineLink: null,
    favorite: true,
    imageUrl: null,
  },
];

const defaultProps = {
  wines: mockWines,
  onRowClick: vi.fn(),
  onToggleFavorite: vi.fn(),
  sortBy: 'name' as const,
  sortDirection: 'asc' as const,
  onSort: vi.fn(),
};

describe('WineTable Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response)
    );
  });

  it('has no accessibility violations in desktop table layout', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    const { container } = render(<WineTable {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in mobile card layout', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const { container } = render(<WineTable {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with empty wines list', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    const { container } = render(<WineTable {...defaultProps} wines={[]} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
