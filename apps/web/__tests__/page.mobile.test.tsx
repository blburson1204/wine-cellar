import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock useMediaQuery to simulate mobile viewport
vi.mock('../src/hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(() => true),
}));

import Home from '../src/app/page';

// Mock fetch globally
global.fetch = vi.fn();

describe('Home Page - Mobile View', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockWines = [
    {
      id: '1',
      name: 'Barolo Reserve',
      vintage: 2018,
      producer: 'Italian Estate',
      region: 'Piedmont',
      country: 'Italy',
      grapeVariety: 'Nebbiolo',
      blendDetail: null,
      color: 'RED',
      quantity: 3,
      purchasePrice: 75,
      purchaseDate: null,
      drinkByDate: null,
      rating: 4.5,
      notes: null,
      wineLink: null,
      favorite: true,
      imageUrl: null,
    },
    {
      id: '2',
      name: 'Chablis Premier Cru',
      vintage: 2020,
      producer: 'French Domaine',
      region: 'Burgundy',
      country: 'France',
      grapeVariety: 'Chardonnay',
      blendDetail: null,
      color: 'WHITE',
      quantity: 0,
      purchasePrice: 45,
      purchaseDate: null,
      drinkByDate: null,
      rating: 3.5,
      notes: null,
      wineLink: null,
      favorite: false,
      imageUrl: null,
    },
  ];

  describe('Mobile Filter Toggle', () => {
    it('renders mobile filter toggle button when wines exist', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Mobile filter toggle should be present
      const filterButton = screen.getByRole('button', { name: /filter/i });
      expect(filterButton).toBeInTheDocument();
    });

    it('opens filter drawer when filter toggle clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Click the filter toggle
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await user.click(filterButton);

      // Filter drawer should be open - look for a close button or filter content
      await waitFor(() => {
        // The filter drawer should contain the WineFilters with a close button
        const closeButtons = screen.getAllByRole('button', { name: /close/i });
        expect(closeButtons.length).toBeGreaterThan(0);
      });
    });

    it('does not show filter toggle when no wines', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/No wines found/i)).toBeInTheDocument();
      });

      // Filter toggle should not be present
      expect(screen.queryByRole('button', { name: /filter/i })).not.toBeInTheDocument();
    });
  });

  describe('Mobile Card Layout', () => {
    it('renders wines as cards instead of table rows on mobile', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Should render article elements (WineCards) instead of table rows
      const cards = screen.getAllByRole('article');
      expect(cards.length).toBe(2);

      // Should NOT have a table
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Filter Drawer Interaction', () => {
    it('shows search input in filter drawer', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Open filter drawer
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await user.click(filterButton);

      // Search input should be visible in the drawer
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Name, producer, region/i)).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Filter Drawer Close', () => {
    it('closes filter drawer when WineFilters close button is clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Open filter drawer
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await user.click(filterButton);

      // Wait for dialog to appear (FilterDrawer renders when isOpen=true)
      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).not.toBeNull();
      });

      // Click the close button inside WineFilters
      const closeButton = screen.getByRole('button', { name: /close filters/i });
      await user.click(closeButton);

      // FilterDrawer returns null when isOpen=false, so dialog should be removed
      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeNull();
      });
    });

    it('closes filter drawer when backdrop is clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Open filter drawer
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await user.click(filterButton);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).not.toBeNull();
      });

      // Find the backdrop by its fixed positioning style and click it
      const backdrop = document.querySelector(
        'div[aria-hidden="true"][style*="position: fixed"]'
      ) as HTMLElement;
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop);

      // FilterDrawer returns null when isOpen=false, so dialog should be removed
      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeNull();
      });
    });
  });

  describe('Mobile Filter Drawer Escape Key', () => {
    it('closes filter drawer on Escape key press', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Open filter drawer
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await user.click(filterButton);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).not.toBeNull();
      });

      // Press Escape - FilterDrawer listens for keydown on document
      fireEvent.keyDown(document, { key: 'Escape' });

      // FilterDrawer returns null when isOpen=false
      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeNull();
      });
    });
  });

  describe('Color Filter', () => {
    it('filters wines by color when a color checkbox is selected', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
        expect(screen.getByText('Chablis Premier Cru')).toBeInTheDocument();
      });

      // Open filter drawer
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).not.toBeNull();
      });

      // Click the "White" color checkbox inside the filter drawer
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
      const drawerScope = within(dialog);
      await user.click(drawerScope.getByText('White'));

      // Only white wine should be visible, red wine should be gone
      await waitFor(() => {
        expect(screen.getByText('Chablis Premier Cru')).toBeInTheDocument();
        expect(screen.queryByText('Barolo Reserve')).not.toBeInTheDocument();
      });
    });
  });

  describe('Price Range Filter', () => {
    it('filters wines by minimum price', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
        expect(screen.getByText('Chablis Premier Cru')).toBeInTheDocument();
      });

      // Open filter drawer
      const filterButton = screen.getByRole('button', { name: /filter/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).not.toBeNull();
      });

      // Set minimum price to 50 (Barolo is 75, Chablis is 45)
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
      const drawerScope = within(dialog);
      const minPriceInput = drawerScope.getByLabelText('Minimum price');
      fireEvent.change(minPriceInput, { target: { value: '50' } });

      // Only Barolo (price 75) should remain, Chablis (price 45) should be filtered out
      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
        expect(screen.queryByText('Chablis Premier Cru')).not.toBeInTheDocument();
      });
    });
  });
});
