import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WineTable from '../../components/WineTable';
import WineDetailModal from '../../components/WineDetailModal';
import WineCard from '../../components/WineCard';

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
];

const mockWine = mockWines[0];

describe('Responsive Layout Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response)
    );
  });

  describe('WineTable Responsive Behavior', () => {
    const tableProps = {
      wines: mockWines,
      onRowClick: vi.fn(),
      onToggleFavorite: vi.fn(),
      sortBy: 'name' as const,
      sortDirection: 'asc' as const,
      onSort: vi.fn(),
    };

    it('shows card layout on mobile (< 768px)', () => {
      vi.mocked(useMediaQuery).mockReturnValue(true); // Is mobile

      render(<WineTable {...tableProps} />);

      // Cards should be present (article role)
      expect(screen.getAllByRole('article').length).toBe(mockWines.length);
      // Table should NOT be present
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('shows table layout on desktop (>= 768px)', () => {
      vi.mocked(useMediaQuery).mockReturnValue(false); // Not mobile

      render(<WineTable {...tableProps} />);

      // Table should be present
      expect(screen.getByRole('table')).toBeInTheDocument();
      // Cards should NOT be present
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });

    it('shows MobileSortSelector only on mobile', () => {
      vi.mocked(useMediaQuery).mockReturnValue(true); // Mobile

      render(<WineTable {...tableProps} />);

      // MobileSortSelector has a combobox
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('hides MobileSortSelector on desktop', () => {
      vi.mocked(useMediaQuery).mockReturnValue(false); // Desktop

      render(<WineTable {...tableProps} />);

      // MobileSortSelector should not be present
      // Note: Table might have other elements, so check specifically for sort combobox absence
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });

  describe('WineDetailModal Responsive Behavior', () => {
    const modalProps = {
      wine: mockWine,
      onClose: vi.fn(),
      onUpdate: vi.fn().mockResolvedValue(undefined),
      onDelete: vi.fn(),
      onToggleFavorite: vi.fn(),
    };

    it('renders as dialog on mobile', () => {
      vi.mocked(useMediaQuery).mockReturnValue(true); // Mobile

      render(<WineDetailModal {...modalProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('renders as dialog on desktop', () => {
      vi.mocked(useMediaQuery).mockReturnValue(false); // Desktop

      render(<WineDetailModal {...modalProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('uses Combobox for form fields in add mode', async () => {
      vi.mocked(useMediaQuery).mockReturnValue(true); // Mobile

      render(<WineDetailModal {...modalProps} mode="add" />);

      // Producer, Country, Region, Grape Variety, Where Purchased are Comboboxes
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('WineCard Touch Targets', () => {
    const cardProps = {
      wine: mockWine,
      onClick: vi.fn(),
      onToggleFavorite: vi.fn(),
    };

    it('card has minimum 44px height for touch', () => {
      render(<WineCard {...cardProps} />);

      const card = screen.getByRole('article');
      expect(card).toHaveStyle({ minHeight: '44px' });
    });

    it('favorite button has minimum 44px touch target', () => {
      render(<WineCard {...cardProps} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    });
  });

  describe('Cross-Component Integration', () => {
    it('clicking card opens detail modal with same wine data', () => {
      const onRowClick = vi.fn();
      vi.mocked(useMediaQuery).mockReturnValue(true); // Mobile

      render(
        <WineTable
          wines={mockWines}
          onRowClick={onRowClick}
          onToggleFavorite={vi.fn()}
          sortBy="name"
          sortDirection="asc"
          onSort={vi.fn()}
        />
      );

      const card = screen.getByRole('article');
      card.click();

      expect(onRowClick).toHaveBeenCalledWith(mockWines[0]);
    });

    it('toggling favorite from card calls correct handler', () => {
      const onToggleFavorite = vi.fn();
      vi.mocked(useMediaQuery).mockReturnValue(true); // Mobile

      render(
        <WineTable
          wines={mockWines}
          onRowClick={vi.fn()}
          onToggleFavorite={onToggleFavorite}
          sortBy="name"
          sortDirection="asc"
          onSort={vi.fn()}
        />
      );

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      favoriteButton.click();

      expect(onToggleFavorite).toHaveBeenCalledWith(mockWines[0]);
    });

    it('sort selection works consistently across layouts', () => {
      const onSort = vi.fn();
      vi.mocked(useMediaQuery).mockReturnValue(true); // Mobile

      const { rerender } = render(
        <WineTable
          wines={mockWines}
          onRowClick={vi.fn()}
          onToggleFavorite={vi.fn()}
          sortBy="name"
          sortDirection="asc"
          onSort={onSort}
        />
      );

      // Verify sort selection is preserved
      const sortSelect = screen.getByRole('combobox');
      expect(sortSelect).toHaveValue('name');

      // Change to desktop layout
      vi.mocked(useMediaQuery).mockReturnValue(false);
      rerender(
        <WineTable
          wines={mockWines}
          onRowClick={vi.fn()}
          onToggleFavorite={vi.fn()}
          sortBy="name"
          sortDirection="asc"
          onSort={onSort}
        />
      );

      // Sort headers should be present
      expect(screen.getByRole('columnheader', { name: /wine/i })).toBeInTheDocument();
    });
  });
});
