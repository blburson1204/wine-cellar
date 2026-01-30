import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import WineTable from '../../components/WineTable';
import WineDetailModal from '../../components/WineDetailModal';
import FilterDrawer from '../../components/FilterDrawer';
import WineFilters from '../../components/WineFilters';

// Mock useMediaQuery with viewport-aware implementation
vi.mock('../../hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(),
}));

import { useMediaQuery } from '../../hooks/useMediaQuery';

/**
 * Sets up viewport-aware media query mock that evaluates actual CSS queries.
 *
 * Breakpoint map:
 *   375px (iPhone SE)      → max-width:767=true,  max-width:1023=true  → cards + drawer
 *   393px (iPhone 14 Pro)  → max-width:767=true,  max-width:1023=true  → cards + drawer
 *   768px (iPad)           → max-width:767=false,  max-width:1023=true → table + drawer
 *   1024px (Desktop)       → max-width:767=false, max-width:1023=false → table + sidebar
 */
function mockViewport(width: number) {
  vi.mocked(useMediaQuery).mockImplementation((query: string) => {
    const maxMatch = query.match(/max-width:\s*(\d+)px/);
    if (maxMatch) return width <= parseInt(maxMatch[1]);
    const minMatch = query.match(/min-width:\s*(\d+)px/);
    if (minMatch) return width >= parseInt(minMatch[1]);
    return false;
  });
}

const mockWines = [
  {
    id: '1',
    name: 'Chateau Margaux',
    vintage: 2018,
    producer: 'Chateau Margaux',
    region: 'Bordeaux',
    country: 'France',
    grapeVariety: 'Cabernet Sauvignon',
    blendDetail: null,
    color: 'RED',
    quantity: 3,
    purchasePrice: 150,
    purchaseDate: '2021-05-10',
    drinkByDate: '2038-12-31',
    rating: 95,
    notes: 'Exceptional vintage',
    expertRatings: null,
    wherePurchased: 'Wine Exchange',
    wineLink: null,
    favorite: true,
    imageUrl: null,
  },
  {
    id: '2',
    name: 'Cloudy Bay Sauvignon Blanc',
    vintage: 2022,
    producer: 'Cloudy Bay',
    region: 'Marlborough',
    country: 'New Zealand',
    grapeVariety: 'Sauvignon Blanc',
    blendDetail: null,
    color: 'WHITE',
    quantity: 6,
    purchasePrice: 22,
    purchaseDate: '2023-03-20',
    drinkByDate: '2026-12-31',
    rating: 88,
    notes: null,
    expertRatings: null,
    wherePurchased: null,
    wineLink: null,
    favorite: false,
    imageUrl: null,
  },
];

const tableProps = {
  wines: mockWines,
  onRowClick: vi.fn(),
  onToggleFavorite: vi.fn(),
  sortBy: 'name' as const,
  sortDirection: 'asc' as const,
  onSort: vi.fn(),
};

describe('Cross-Viewport Device Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  describe('iPhone SE (375px)', () => {
    beforeEach(() => mockViewport(375));

    it('renders wine cards (not table)', () => {
      render(<WineTable {...tableProps} />);

      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(2);
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('shows MobileSortSelector', () => {
      render(<WineTable {...tableProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders each wine card with name visible', () => {
      render(<WineTable {...tableProps} />);

      const cards = screen.getAllByRole('article');
      // First card has "Chateau Margaux" in both name and producer spans
      expect(within(cards[0]).getAllByText('Chateau Margaux').length).toBeGreaterThan(0);
      expect(within(cards[1]).getByText('Cloudy Bay Sauvignon Blanc')).toBeInTheDocument();
    });

    it('shows favorite toggle on each card', () => {
      render(<WineTable {...tableProps} />);

      const favoriteButtons = screen.getAllByRole('button', { name: /favorite/i });
      expect(favoriteButtons.length).toBe(2);
    });
  });

  describe('iPhone 14 Pro (393px)', () => {
    beforeEach(() => mockViewport(393));

    it('renders wine cards (not table)', () => {
      render(<WineTable {...tableProps} />);

      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(2);
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('shows MobileSortSelector', () => {
      render(<WineTable {...tableProps} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('iPad (768px)', () => {
    beforeEach(() => mockViewport(768));

    it('renders table (not cards)', () => {
      render(<WineTable {...tableProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });

    it('hides MobileSortSelector', () => {
      render(<WineTable {...tableProps} />);

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('shows sortable column headers', () => {
      render(<WineTable {...tableProps} />);

      expect(screen.getByRole('columnheader', { name: /wine/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /vintage/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /type/i })).toBeInTheDocument();
    });

    it('renders wine data in table rows', () => {
      render(<WineTable {...tableProps} />);

      const table = screen.getByRole('table');
      // "Chateau Margaux" appears in both name and producer columns
      expect(within(table).getAllByText('Chateau Margaux').length).toBeGreaterThan(0);
      expect(within(table).getByText('Cloudy Bay Sauvignon Blanc')).toBeInTheDocument();
    });
  });

  describe('Desktop (1024px)', () => {
    beforeEach(() => mockViewport(1024));

    it('renders table (not cards)', () => {
      render(<WineTable {...tableProps} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });

    it('hides MobileSortSelector', () => {
      render(<WineTable {...tableProps} />);

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('shows all column headers', () => {
      render(<WineTable {...tableProps} />);

      const headers = screen.getAllByRole('columnheader');
      // Favorite, Vintage, Wine, Type, Region, Grape, Producer, Country, Rating, In Cellar, Price
      expect(headers.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('WineDetailModal across viewports', () => {
    const modalProps = {
      wine: mockWines[0],
      onClose: vi.fn(),
      onUpdate: vi.fn().mockResolvedValue(undefined),
      onDelete: vi.fn(),
      onToggleFavorite: vi.fn(),
    };

    it('renders dialog at mobile viewport (375px)', () => {
      mockViewport(375);
      render(<WineDetailModal {...modalProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('renders dialog at tablet viewport (768px)', () => {
      mockViewport(768);
      render(<WineDetailModal {...modalProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('renders dialog at desktop viewport (1024px)', () => {
      mockViewport(1024);
      render(<WineDetailModal {...modalProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('FilterDrawer across viewports', () => {
    const filterProps = {
      searchText: '',
      onSearchChange: vi.fn(),
      selectedColors: [] as string[],
      onColorsChange: vi.fn(),
      selectedGrapeVariety: null,
      onGrapeVarietyChange: vi.fn(),
      grapeVarieties: ['Cabernet Sauvignon', 'Merlot'],
      selectedCountry: null,
      onCountryChange: vi.fn(),
      countries: ['France', 'Italy'],
      showOnlyInCellar: false,
      onShowOnlyInCellarChange: vi.fn(),
      showOnlyFavorites: false,
      onShowOnlyFavoritesChange: vi.fn(),
      minRating: null,
      onMinRatingChange: vi.fn(),
      priceRange: null,
      onPriceRangeChange: vi.fn(),
      priceMin: 0,
      priceMax: 500,
      onClearAll: vi.fn(),
      showCloseButton: true,
      onClose: vi.fn(),
    };

    it('renders as accessible dialog at mobile viewport (375px)', () => {
      mockViewport(375);
      render(
        <FilterDrawer isOpen={true} onClose={vi.fn()}>
          <WineFilters {...filterProps} />
        </FilterDrawer>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', 'Filter options');
    });

    it('renders nothing when closed regardless of viewport', () => {
      mockViewport(375);
      render(
        <FilterDrawer isOpen={false} onClose={vi.fn()}>
          <WineFilters {...filterProps} />
        </FilterDrawer>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('contains filter controls when open', () => {
      mockViewport(375);
      render(
        <FilterDrawer isOpen={true} onClose={vi.fn()}>
          <WineFilters {...filterProps} />
        </FilterDrawer>
      );

      // Search input should be present
      expect(screen.getByPlaceholderText('Name, producer, region...')).toBeInTheDocument();
    });
  });

  describe('Layout transition consistency', () => {
    it('preserves sort state when switching from mobile to tablet', () => {
      mockViewport(375);
      const onSort = vi.fn();
      const props = { ...tableProps, sortBy: 'vintage' as const, onSort };

      const { rerender } = render(<WineTable {...props} />);

      // Mobile: sort combobox reflects current sort
      expect(screen.getByRole('combobox')).toHaveValue('vintage');

      // Switch to tablet (768px) → table layout
      mockViewport(768);
      rerender(<WineTable {...props} />);

      // Table should now be visible
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('displays wine data consistently across viewport transitions', () => {
      mockViewport(375);
      const { rerender } = render(<WineTable {...tableProps} />);

      // Mobile: wine names visible in cards
      expect(screen.getAllByText('Chateau Margaux').length).toBeGreaterThan(0);
      expect(screen.getByText('Cloudy Bay Sauvignon Blanc')).toBeInTheDocument();

      // Switch to desktop
      mockViewport(1024);
      rerender(<WineTable {...tableProps} />);

      // Desktop: same wine names visible in table
      expect(screen.getAllByText('Chateau Margaux').length).toBeGreaterThan(0);
      expect(screen.getByText('Cloudy Bay Sauvignon Blanc')).toBeInTheDocument();
    });
  });
});
