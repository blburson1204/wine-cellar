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

  describe('Sorting', () => {
    const mockWines = [
      {
        id: '1',
        name: 'Zinfandel Reserve',
        vintage: 2018,
        producer: 'Alpha Winery',
        region: 'Napa',
        country: 'USA',
        grapeVariety: 'Zinfandel',
        blendDetail: null,
        color: 'RED',
        quantity: 2,
        purchasePrice: 50,
        purchaseDate: null,
        drinkByDate: null,
        rating: 4.5,
        notes: null,
        wineLink: null,
        favorite: false,
        imageUrl: null,
      },
      {
        id: '2',
        name: 'Chardonnay Classic',
        vintage: 2020,
        producer: 'Beta Estates',
        region: 'Sonoma',
        country: 'USA',
        grapeVariety: 'Chardonnay',
        blendDetail: null,
        color: 'WHITE',
        quantity: 1,
        purchasePrice: 30,
        purchaseDate: null,
        drinkByDate: null,
        rating: 3.5,
        notes: null,
        wineLink: null,
        favorite: false,
        imageUrl: null,
      },
    ];

    it('sorts by name by default', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        const rows = screen.getAllByRole('row').slice(1);
        // Chardonnay should come before Zinfandel alphabetically
        expect(rows[0]).toHaveTextContent('Chardonnay Classic');
        expect(rows[1]).toHaveTextContent('Zinfandel Reserve');
      });
    });

    it('toggles sort direction when clicking same column header', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Chardonnay Classic')).toBeInTheDocument();
      });

      // Click Wine header to toggle to descending
      const wineHeader = screen.getByText('Wine').closest('th')!;
      await user.click(wineHeader);

      // Should now be descending - Zinfandel before Chardonnay
      await waitFor(() => {
        const rows = screen.getAllByRole('row').slice(1);
        expect(rows[0]).toHaveTextContent('Zinfandel Reserve');
        expect(rows[1]).toHaveTextContent('Chardonnay Classic');
      });
    });

    it('sorts by vintage when Vintage header clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Chardonnay Classic')).toBeInTheDocument();
      });

      const vintageHeader = screen.getByText('Vintage').closest('th')!;
      await user.click(vintageHeader);

      // Should sort by vintage ascending - 2018 before 2020
      await waitFor(() => {
        const rows = screen.getAllByRole('row').slice(1);
        expect(rows[0]).toHaveTextContent('2018');
        expect(rows[1]).toHaveTextContent('2020');
      });
    });

    it('sorts by producer when Producer header clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Chardonnay Classic')).toBeInTheDocument();
      });

      const producerHeader = screen.getByText('Producer').closest('th')!;
      await user.click(producerHeader);

      // Should sort by producer ascending - Alpha before Beta
      await waitFor(() => {
        const rows = screen.getAllByRole('row').slice(1);
        expect(rows[0]).toHaveTextContent('Alpha Winery');
        expect(rows[1]).toHaveTextContent('Beta Estates');
      });
    });

    it('sorts by price when Price header clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Chardonnay Classic')).toBeInTheDocument();
      });

      const priceHeader = screen.getByText('Price').closest('th')!;
      await user.click(priceHeader);

      // Should sort by price ascending - $30 before $50
      await waitFor(() => {
        const rows = screen.getAllByRole('row').slice(1);
        expect(rows[0]).toHaveTextContent('$30.00');
        expect(rows[1]).toHaveTextContent('$50.00');
      });
    });

    it('sorts by rating when Rating header clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Chardonnay Classic')).toBeInTheDocument();
      });

      // Find all Rating texts and get the one in th (table header)
      const ratingTexts = screen.getAllByText('Rating');
      const ratingHeader = ratingTexts.find((el) => el.closest('th'))?.closest('th');
      expect(ratingHeader).toBeTruthy();
      await user.click(ratingHeader!);

      // Should sort by rating ascending - 3.5 before 4.5
      await waitFor(() => {
        const rows = screen.getAllByRole('row').slice(1);
        expect(rows[0]).toHaveTextContent('3.5');
        expect(rows[1]).toHaveTextContent('4.5');
      });
    });
  });

  describe('Favorite Toggle', () => {
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

    it('toggles favorite when star is clicked in table', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [mockWine],
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Wine')).toBeInTheDocument();
      });

      // Click the star to favorite
      const star = screen.getByText('☆');
      await user.click(star);

      // Should have called PUT to update favorite
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/wines/1',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ favorite: true }),
          })
        );
      });
    });

    it('handles toggle favorite error gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(global.fetch).mockImplementation((_url, options): Promise<Response> => {
        if (options?.method === 'PUT') {
          return Promise.resolve({ ok: false } as Response);
        }
        return Promise.resolve({ ok: true, json: async () => [mockWine] } as Response);
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Wine')).toBeInTheDocument();
      });

      const star = screen.getByText('☆');
      await user.click(star);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error toggling favorite:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });

    it('updates selected wine favorite status when toggled from detail modal', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [mockWine],
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Wine')).toBeInTheDocument();
      });

      // Open detail modal by clicking wine name
      await user.click(screen.getByText('Test Wine'));

      await waitFor(() => {
        expect(screen.getByText(/2020 · Test Producer · Red/)).toBeInTheDocument();
      });

      // Toggle favorite from modal (clicking the star in modal - first one found)
      const modalStar = screen.getAllByText('☆')[0];
      await user.click(modalStar);

      // Verify the PUT was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/wines/1',
          expect.objectContaining({
            method: 'PUT',
          })
        );
      });
    });
  });

  describe('Update Wine', () => {
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

    it('updates wine when saved from detail modal', async () => {
      const user = userEvent.setup();

      const updatedWine = { ...mockWine, notes: 'Updated notes' };

      vi.mocked(global.fetch).mockImplementation((url, options): Promise<Response> => {
        if (options?.method === 'PUT') {
          return Promise.resolve({ ok: true, json: async () => updatedWine } as Response);
        }
        // Return updated wine after PUT
        if (url === '/api/wines') {
          return Promise.resolve({ ok: true, json: async () => [updatedWine] } as Response);
        }
        return Promise.resolve({ ok: true, json: async () => [mockWine] } as Response);
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Wine')).toBeInTheDocument();
      });

      // Open detail modal by clicking wine name
      await user.click(screen.getByText('Test Wine'));

      await waitFor(() => {
        expect(screen.getByText(/2020 · Test Producer · Red/)).toBeInTheDocument();
      });

      // Click Edit button
      await user.click(screen.getByRole('button', { name: 'Edit Wine' }));

      // Wait for edit mode
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
      });

      // Save changes (no edits needed to test the save flow)
      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      // Verify PUT was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/wines/1',
          expect.objectContaining({
            method: 'PUT',
          })
        );
      });
    });

    it('handles update wine error with non-ok response', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(global.fetch).mockImplementation((_url, options): Promise<Response> => {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: false,
            status: 500,
            text: async () => 'Server error',
          } as Response);
        }
        return Promise.resolve({ ok: true, json: async () => [mockWine] } as Response);
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Wine')).toBeInTheDocument();
      });

      // Open detail modal by clicking wine name
      await user.click(screen.getByText('Test Wine'));

      // Wait for modal to open - check for wine subtitle
      await waitFor(() => {
        expect(screen.getByText(/2020 · Test Producer · Red/)).toBeInTheDocument();
      });

      // Click Edit button
      await user.click(screen.getByRole('button', { name: 'Edit Wine' }));

      // Wait for edit mode and click Save
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('PUT request failed'),
          expect.anything()
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Delete Confirmation Modal', () => {
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

    it('closes delete confirmation when Cancel is clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [mockWine],
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Wine')).toBeInTheDocument();
      });

      // Open detail modal
      const wineRow = screen.getByText('Test Wine').closest('tr')!;
      await user.click(wineRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Delete Wine' })).toBeInTheDocument();
      });

      // Click Delete Wine
      await user.click(screen.getByRole('button', { name: 'Delete Wine' }));

      // Confirm modal should appear
      await waitFor(() => {
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      });

      // Click Cancel
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      // Confirm modal should be gone
      await waitFor(() => {
        expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
      });
    });

    it('closes delete confirmation when clicking overlay', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [mockWine],
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Wine')).toBeInTheDocument();
      });

      // Open detail modal
      const wineRow = screen.getByText('Test Wine').closest('tr')!;
      await user.click(wineRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Delete Wine' })).toBeInTheDocument();
      });

      // Click Delete Wine
      await user.click(screen.getByRole('button', { name: 'Delete Wine' }));

      // Confirm modal should appear
      await waitFor(() => {
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      });

      // Click the overlay (the background)
      const overlay = screen.getByText('Confirm Delete').closest('div')?.parentElement;
      if (overlay) {
        await user.click(overlay);
      }

      // Confirm modal should be gone
      await waitFor(() => {
        expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
      });
    });
  });

  describe('Bottle Count Display', () => {
    it('shows singular "Bottle" for 1 wine', async () => {
      const mockWine = {
        id: '1',
        name: 'Single Wine',
        vintage: 2020,
        producer: 'Producer',
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

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [mockWine],
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('1 Bottle in Collection')).toBeInTheDocument();
      });
    });

    it('shows plural "Bottles" for multiple wines', async () => {
      const mockWines = [
        {
          id: '1',
          name: 'Wine 1',
          vintage: 2020,
          producer: 'Producer',
          country: 'France',
          color: 'RED',
          quantity: 1,
        },
        {
          id: '2',
          name: 'Wine 2',
          vintage: 2021,
          producer: 'Producer',
          country: 'France',
          color: 'WHITE',
          quantity: 1,
        },
      ];

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('2 Bottles in Collection')).toBeInTheDocument();
      });
    });

    it('shows filtered count when filters are applied', async () => {
      const mockWines = [
        {
          id: '1',
          name: 'Red Wine',
          vintage: 2020,
          producer: 'Producer',
          country: 'France',
          color: 'RED',
          quantity: 1,
        },
        {
          id: '2',
          name: 'White Wine',
          vintage: 2021,
          producer: 'Producer',
          country: 'France',
          color: 'WHITE',
          quantity: 1,
        },
      ];

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      } as Response);

      const user = userEvent.setup();

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('2 Bottles in Collection')).toBeInTheDocument();
      });

      // Type in search to filter
      const searchInput = screen.getByPlaceholderText(/Name, producer, region/i);
      await user.type(searchInput, 'Red');

      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 2 Bottles')).toBeInTheDocument();
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
