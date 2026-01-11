import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Home from '../src/app/page';

// Mock fetch globally
global.fetch = vi.fn();

describe('Home Page - Wine Cellar', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('displays loading message initially', () => {
      // Mock fetch to never resolve (keeps loading state)
      vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));

      render(<Home />);
      expect(screen.getByText('Loading your collection...')).toBeInTheDocument();
    });
  });

  describe('Empty Collection', () => {
    it('shows empty state when no wines exist', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        json: async () => [],
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/No wines found/i)).toBeInTheDocument();
      });

      // Bottle count and filters are not shown when there are no wines
      expect(screen.queryByText('0 Bottles in Collection')).not.toBeInTheDocument();
    });
  });

  describe('Wine List', () => {
    const mockWines = [
      {
        id: '1',
        name: 'Chateau Margaux',
        vintage: 2015,
        producer: 'Chateau Margaux',
        region: 'Bordeaux',
        country: 'France',
        grapeVariety: 'Cabernet Sauvignon',
        color: 'RED',
        quantity: 2,
        rating: 95,
        notes: 'Excellent',
      },
    ];

    it('displays wine count correctly', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('1 Bottle in Collection')).toBeInTheDocument();
      });
    });

    it('renders wine details', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getAllByText('Chateau Margaux').length).toBeGreaterThan(0);
      });

      expect(screen.getByText('2015')).toBeInTheDocument();
      expect(screen.getAllByText('France').length).toBeGreaterThan(0);
    });
  });

  describe('Add Wine Modal', () => {
    it('opens add wine modal when Add Wine button clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Wine/i })).toBeInTheDocument();
      });

      // Modal should not be visible
      expect(screen.queryByText('Add New Wine')).not.toBeInTheDocument();

      // Click Add Wine
      await user.click(screen.getByRole('button', { name: /Add Wine/i }));

      // Modal should be visible
      await waitFor(() => {
        expect(screen.getByText('Add New Wine')).toBeInTheDocument();
      });
    });

    it('submits wine with correct data from modal', async () => {
      const user = userEvent.setup();

      // Mock fetch for all calls
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      render(<Home />);

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: /Add Wine/i });
        expect(addButtons.length).toBeGreaterThan(0);
      });

      // Open modal - click the first Add Wine button (in header)
      const addButtons = screen.getAllByRole('button', { name: /Add Wine/i });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Add New Wine')).toBeInTheDocument();
      });

      // Fill form using text inputs
      // Order: Wine Name, Producer, Country, Region, Grape Variety, Blend, Wine Link, Notes
      const textInputs = screen.getAllByRole('textbox');
      await user.type(textInputs[0], 'Test Wine'); // Wine Name
      await user.type(textInputs[1], 'Test Producer'); // Producer
      await user.type(textInputs[2], 'France'); // Country

      // Submit - click the second Add Wine button (in modal)
      const submitButtons = screen.getAllByRole('button', { name: /Add Wine/i });
      await user.click(submitButtons[submitButtons.length - 1]);

      // Verify POST was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/wines',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });
  });

  describe('Delete Wine', () => {
    const mockWine = {
      id: '1',
      name: 'Test Wine',
      vintage: 2020,
      producer: 'Test Producer',
      region: null,
      country: 'France',
      grapeVariety: null,
      blendDetail: null,
      color: 'RED',
      quantity: 1,
      purchasePrice: null,
      purchaseDate: null,
      drinkByDate: null,
      rating: null,
      notes: null,
      wineLink: null,
      favorite: false,
      imageUrl: null,
    };

    it('opens detail modal when clicking wine row', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [mockWine],
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getAllByText('Test Wine').length).toBeGreaterThan(0);
      });

      // Click on the wine name to open detail modal
      const wineNameElements = screen.getAllByText('Test Wine');
      await user.click(wineNameElements[0]);

      // Detail modal should open - color is displayed in Title Case (e.g., "Red")
      await waitFor(() => {
        expect(screen.getByText(/2020 · Test Producer · Red/)).toBeInTheDocument();
      });
    });

    it('can delete wine from detail modal', async () => {
      const user = userEvent.setup();

      // Mock fetch to return wine initially
      let deleteCallCount = 0;
      vi.mocked(global.fetch).mockImplementation((_url, options): Promise<Response> => {
        if (options?.method === 'DELETE') {
          deleteCallCount++;
          return Promise.resolve({ ok: true, json: async () => ({}) } as Response);
        }
        return Promise.resolve({ ok: true, json: async () => [mockWine] } as Response);
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getAllByText('Test Wine').length).toBeGreaterThan(0);
      });

      // Click wine row to open detail modal
      const wineNameElements = screen.getAllByText('Test Wine');
      await user.click(wineNameElements[0]);

      // Wait for detail modal
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Delete Wine' })).toBeInTheDocument();
      });

      // Click Delete Wine button
      await user.click(screen.getByRole('button', { name: 'Delete Wine' }));

      // Confirm modal should appear
      await waitFor(() => {
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      });

      // Click Delete in confirmation modal
      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      await user.click(deleteButtons[0]);

      // Wait for DELETE to be called
      await waitFor(() => {
        expect(deleteCallCount).toBe(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles fetch error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/No wines found/i)).toBeInTheDocument();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching wines:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('handles add wine error', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock initial fetch to succeed, POST to fail
      vi.mocked(global.fetch).mockImplementation((_url, options): Promise<Response> => {
        if (options?.method === 'POST') {
          return Promise.reject(new Error('Server error'));
        }
        return Promise.resolve({ ok: true, json: async () => [] } as Response);
      });

      render(<Home />);

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: /Add Wine/i });
        expect(addButtons.length).toBeGreaterThan(0);
      });

      const addButtons = screen.getAllByRole('button', { name: /Add Wine/i });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Add New Wine')).toBeInTheDocument();
      });

      // Order: Wine Name, Producer, Country, Region, Grape Variety, Blend, Wine Link, Notes
      const textInputs = screen.getAllByRole('textbox');
      await user.type(textInputs[0], 'Test Wine');
      await user.type(textInputs[1], 'Test Producer');
      await user.type(textInputs[2], 'France'); // Country

      const submitButtons = screen.getAllByRole('button', { name: /Add Wine/i });
      await user.click(submitButtons[submitButtons.length - 1]);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Error'),
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('handles delete error', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockWine = {
        id: '1',
        name: 'Test Wine',
        vintage: 2020,
        producer: 'Test Producer',
        region: null,
        country: 'France',
        grapeVariety: null,
        color: 'RED',
        quantity: 1,
        rating: null,
        notes: null,
        purchasePrice: null,
        purchaseDate: null,
        drinkByDate: null,
      };

      vi.mocked(global.fetch).mockImplementation((_url, options): Promise<Response> => {
        if (options?.method === 'DELETE') {
          return Promise.reject(new Error('Delete failed'));
        }
        return Promise.resolve({ ok: true, json: async () => [mockWine] } as Response);
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getAllByText('Test Wine').length).toBeGreaterThan(0);
      });

      // Click wine row to open detail modal
      const wineNameElements = screen.getAllByText('Test Wine');
      await user.click(wineNameElements[0]);

      // Wait for detail modal and click Delete Wine
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Delete Wine' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Delete Wine' }));

      // Confirm modal should appear
      await waitFor(() => {
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      });

      // Click Delete in confirmation modal
      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      await user.click(deleteButtons[0]);

      // Wait for the error to be logged
      await waitFor(
        () => {
          expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting wine:', expect.any(Error));
        },
        { timeout: 2000 }
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
