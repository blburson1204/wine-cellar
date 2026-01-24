import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Home from '../src/app/page';

// Mock fetch globally
global.fetch = vi.fn();

describe('Home Page - Additional Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Sample wines for filter testing
  const mockWinesForFilters = [
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
      quantity: 0, // Not in cellar
      purchasePrice: 45,
      purchaseDate: null,
      drinkByDate: null,
      rating: 3.5,
      notes: null,
      wineLink: null,
      favorite: false,
      imageUrl: null,
    },
    {
      id: '3',
      name: 'Chianti Classico',
      vintage: 2019,
      producer: 'Tuscan Vineyard',
      region: 'Tuscany',
      country: 'Italy',
      grapeVariety: 'Sangiovese',
      blendDetail: null,
      color: 'RED',
      quantity: 2,
      purchasePrice: null, // No price
      purchaseDate: null,
      drinkByDate: null,
      rating: null, // No rating
      notes: null,
      wineLink: null,
      favorite: false,
      imageUrl: null,
    },
  ];

  describe('Filter Functionality', () => {
    it('filters by grape variety', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWinesForFilters,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Find grape variety select by its id
      const grapeDropdown = document.getElementById('grape-variety') as HTMLSelectElement;
      await user.selectOptions(grapeDropdown, 'Nebbiolo');

      // Should only show wines with Nebbiolo grape
      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
        expect(screen.queryByText('Chablis Premier Cru')).not.toBeInTheDocument();
        expect(screen.queryByText('Chianti Classico')).not.toBeInTheDocument();
      });
    });

    it('filters by country', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWinesForFilters,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Find country select by its id
      const countryDropdown = document.getElementById('country') as HTMLSelectElement;
      await user.selectOptions(countryDropdown, 'France');

      // Should only show wines from France
      await waitFor(() => {
        expect(screen.queryByText('Barolo Reserve')).not.toBeInTheDocument();
        expect(screen.getByText('Chablis Premier Cru')).toBeInTheDocument();
        expect(screen.queryByText('Chianti Classico')).not.toBeInTheDocument();
      });
    });

    it('filters by In Cellar checkbox', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWinesForFilters,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Find the "In Cellar" checkbox in the filter section (not the table header)
      // The filter checkbox is inside a label element, the table header is in a th
      const inCellarLabels = screen.getAllByText('In Cellar');
      const inCellarFilterLabel = inCellarLabels.find(
        (el) => el.closest('label') && !el.closest('th')
      );
      expect(inCellarFilterLabel).toBeTruthy();
      const inCellarCheckbox = inCellarFilterLabel!
        .closest('label')
        ?.querySelector('input[type="checkbox"]');
      expect(inCellarCheckbox).toBeTruthy();
      await user.click(inCellarCheckbox!);

      // Should only show wines with quantity > 0
      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
        expect(screen.queryByText('Chablis Premier Cru')).not.toBeInTheDocument(); // quantity 0
        expect(screen.getByText('Chianti Classico')).toBeInTheDocument();
      });
    });

    it('filters by Favorites checkbox', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWinesForFilters,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Find the "Favorites" checkbox by looking for label text and getting associated checkbox
      const favoritesLabel = screen.getByText('Favorites');
      const favoritesCheckbox = favoritesLabel
        .closest('label')
        ?.querySelector('input[type="checkbox"]');
      expect(favoritesCheckbox).toBeTruthy();
      await user.click(favoritesCheckbox!);

      // Should only show favorite wines
      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument(); // favorite: true
        expect(screen.queryByText('Chablis Premier Cru')).not.toBeInTheDocument();
        expect(screen.queryByText('Chianti Classico')).not.toBeInTheDocument();
      });
    });

    it('filters by minimum rating', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWinesForFilters,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Find rating select by id
      const ratingSelect = document.getElementById('min-rating') as HTMLSelectElement;
      await user.selectOptions(ratingSelect, '4');

      // Should only show wines with rating >= 4
      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument(); // rating 4.5
        expect(screen.queryByText('Chablis Premier Cru')).not.toBeInTheDocument(); // rating 3.5
        expect(screen.queryByText('Chianti Classico')).not.toBeInTheDocument(); // no rating
      });
    });

    it('clears all filters when Clear All Filters button is clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWinesForFilters,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Apply a search filter first
      const searchInput = screen.getByPlaceholderText(/Name, producer, region/i);
      await user.type(searchInput, 'Barolo');

      // Verify filter is applied
      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 3 Bottles')).toBeInTheDocument();
      });

      // Click Clear All Filters button
      const clearButton = screen.getByRole('button', { name: /Clear All Filters/i });
      await user.click(clearButton);

      // All wines should be visible again
      await waitFor(() => {
        expect(screen.getByText('3 Bottles in Collection')).toBeInTheDocument();
      });
    });
  });

  describe('Additional Sorting', () => {
    it('sorts by color when Type header clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWinesForFilters,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Find Type in table header
      const typeHeader = screen
        .getAllByText('Type')
        .find((el) => el.closest('th'))
        ?.closest('th');
      expect(typeHeader).toBeTruthy();
      await user.click(typeHeader!);

      // Should sort by color (RED comes before WHITE alphabetically)
      await waitFor(() => {
        const rows = screen.getAllByRole('row').slice(1);
        expect(rows[0]).toHaveTextContent('Red');
      });
    });

    it('sorts by region when Region header clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWinesForFilters,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Find Region in table header
      const regionHeader = screen
        .getAllByText('Region')
        .find((el) => el.closest('th'))
        ?.closest('th');
      expect(regionHeader).toBeTruthy();
      await user.click(regionHeader!);

      // Should sort by region alphabetically
      await waitFor(() => {
        const rows = screen.getAllByRole('row').slice(1);
        expect(rows[0]).toHaveTextContent('Burgundy'); // B before P and T
      });
    });

    it('sorts by grape variety when Grape header clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWinesForFilters,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Find Grape in table header (not the filter label)
      const grapeHeader = screen
        .getAllByText('Grape')
        .find((el) => el.closest('th'))
        ?.closest('th');
      expect(grapeHeader).toBeTruthy();
      await user.click(grapeHeader!);

      // Should sort by grape variety
      await waitFor(() => {
        const rows = screen.getAllByRole('row').slice(1);
        expect(rows[0]).toHaveTextContent('Chardonnay'); // C before N and S
      });
    });

    it('sorts by country when Country header clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWinesForFilters,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Find Country header in table (not the filter label)
      const countryHeader = screen
        .getAllByText('Country')
        .find((el) => el.closest('th'))
        ?.closest('th');
      expect(countryHeader).toBeTruthy();
      await user.click(countryHeader!);

      // Should sort by country
      await waitFor(() => {
        const rows = screen.getAllByRole('row').slice(1);
        expect(rows[0]).toHaveTextContent('France'); // F before I
      });
    });

    it('sorts by quantity when In Cellar header clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWinesForFilters,
      } as Response);

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Barolo Reserve')).toBeInTheDocument();
      });

      // Find In Cellar header in table (not the filter checkbox)
      const inCellarHeader = screen
        .getAllByText('In Cellar')
        .find((el) => el.closest('th'))
        ?.closest('th');
      expect(inCellarHeader).toBeTruthy();
      await user.click(inCellarHeader!);

      // Should sort by quantity (ascending by default)
      await waitFor(() => {
        const rows = screen.getAllByRole('row').slice(1);
        expect(rows[0]).toHaveTextContent('No'); // quantity 0 first
      });
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('handles create wine with non-ok response', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(global.fetch).mockImplementation((_url, options): Promise<Response> => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 400,
            text: async () => 'Validation failed',
          } as Response);
        }
        return Promise.resolve({ ok: true, json: async () => [] } as Response);
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Wine/i })).toBeInTheDocument();
      });

      // Open add modal
      await user.click(screen.getByRole('button', { name: /Add Wine/i }));

      await waitFor(() => {
        expect(screen.getByText('Add New Wine')).toBeInTheDocument();
      });

      // Fill form
      await user.type(screen.getByPlaceholderText('Enter wine name'), 'Test Wine');
      await user.type(screen.getByPlaceholderText('Enter producer'), 'Test Producer');
      await user.type(screen.getByPlaceholderText('Enter country'), 'France');

      // Submit
      const submitButtons = screen.getAllByRole('button', { name: /Add Wine/i });
      await user.click(submitButtons[submitButtons.length - 1]);

      // Should log error
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('POST request failed'),
          expect.anything()
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('handles update when wine not found in fresh list', async () => {
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

      let fetchCallCount = 0;
      vi.mocked(global.fetch).mockImplementation((_url, options): Promise<Response> => {
        if (options?.method === 'PUT') {
          return Promise.resolve({ ok: true, json: async () => mockWine } as Response);
        }
        fetchCallCount++;
        if (fetchCallCount === 1) {
          // Initial load
          return Promise.resolve({ ok: true, json: async () => [mockWine] } as Response);
        } else {
          // After update - return empty list (wine "disappeared")
          return Promise.resolve({ ok: true, json: async () => [] } as Response);
        }
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Wine')).toBeInTheDocument();
      });

      // Open detail modal
      await user.click(screen.getByText('Test Wine'));

      await waitFor(() => {
        expect(screen.getByText(/2020 · Test Producer · Red/)).toBeInTheDocument();
      });

      // Click Edit
      await user.click(screen.getByRole('button', { name: 'Edit Wine' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
      });

      // Save changes
      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      // Should log error about not finding wine
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Could not find updated wine')
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
