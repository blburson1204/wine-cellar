import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WineTable from '../../components/WineTable';

// Mock the useMediaQuery hook
vi.mock('../../hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(),
}));

import { useMediaQuery } from '../../hooks/useMediaQuery';

const mockWines = [
  {
    id: '1',
    name: 'Chateau Margaux',
    vintage: 2019,
    producer: 'Chateau Margaux',
    region: 'Bordeaux',
    country: 'France',
    grapeVariety: 'Cabernet Sauvignon',
    blendDetail: null,
    color: 'RED',
    quantity: 6,
    purchasePrice: 350,
    purchaseDate: '2021-06-15',
    drinkByDate: '2035-12-31',
    rating: 95,
    notes: 'Exceptional vintage',
    expertRatings: null,
    wherePurchased: null,
    wineLink: null,
    favorite: false,
    imageUrl: null,
  },
  {
    id: '2',
    name: 'Opus One',
    vintage: 2018,
    producer: 'Opus One Winery',
    region: 'Napa Valley',
    country: 'USA',
    grapeVariety: 'Cabernet Blend',
    blendDetail: null,
    color: 'RED',
    quantity: 3,
    purchasePrice: 400,
    purchaseDate: '2021-08-20',
    drinkByDate: '2040-12-31',
    rating: 97,
    notes: null,
    expertRatings: null,
    wherePurchased: null,
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

describe('WineTable Responsive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mobile Layout (< 768px)', () => {
    beforeEach(() => {
      vi.mocked(useMediaQuery).mockReturnValue(true); // Is mobile
    });

    it('renders as card list on mobile', () => {
      render(<WineTable {...defaultProps} />);
      const cards = screen.getAllByRole('article');
      expect(cards.length).toBe(mockWines.length);
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains sort state in mobile layout', () => {
      const onSort = vi.fn();
      vi.mocked(useMediaQuery).mockReturnValue(true); // Mobile

      render(<WineTable {...defaultProps} onSort={onSort} sortBy="vintage" />);

      // Sort by vintage should be reflected in the MobileSortSelector
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('vintage');
    });

    it('calls same onRowClick handler in both layouts', async () => {
      const onRowClick = vi.fn();

      // Mobile - card click
      vi.mocked(useMediaQuery).mockReturnValue(true);
      const { unmount } = render(<WineTable {...defaultProps} onRowClick={onRowClick} />);

      const card = screen.getAllByRole('article')[0];
      card.click();
      expect(onRowClick).toHaveBeenCalledWith(mockWines[0]);

      unmount();
      onRowClick.mockClear();

      // Desktop - row click (separate render)
      vi.mocked(useMediaQuery).mockReturnValue(false);
      render(<WineTable {...defaultProps} onRowClick={onRowClick} />);

      const row = screen.getAllByRole('row')[1]; // First data row
      row.click();
      expect(onRowClick).toHaveBeenCalledWith(mockWines[0]);
    });

    it('calls same onToggleFavorite handler in both layouts', async () => {
      const onToggleFavorite = vi.fn();

      // Mobile - favorite button on card
      vi.mocked(useMediaQuery).mockReturnValue(true);
      render(<WineTable {...defaultProps} onToggleFavorite={onToggleFavorite} />);

      const favoriteButtons = screen.getAllByRole('button', { name: /favorite/i });
      favoriteButtons[0].click();
      expect(onToggleFavorite).toHaveBeenCalledWith(mockWines[0]);
    });
  });

  describe('Empty State', () => {
    it('handles empty wine list on mobile', () => {
      vi.mocked(useMediaQuery).mockReturnValue(true);
      render(<WineTable {...defaultProps} wines={[]} />);
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });

    it('handles empty wine list on desktop', () => {
      vi.mocked(useMediaQuery).mockReturnValue(false);
      render(<WineTable {...defaultProps} wines={[]} />);
      expect(screen.getByText('No wines found')).toBeInTheDocument();
    });
  });
});
