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
      vi.mocked(global.fetch).mockImplementation(() =>
        new Promise(() => {})
      );

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
        expect(screen.getByText('0 Bottles in Collection')).toBeInTheDocument();
      });

      expect(screen.getByText(/Your cellar is empty/i)).toBeInTheDocument();
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
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('1 Bottle in Collection')).toBeInTheDocument();
      });
    });

    it('renders wine details', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockWines,
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getAllByText('Chateau Margaux').length).toBeGreaterThan(0);
      });

      expect(screen.getByText('2015')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
    });
  });

  describe('Add Wine Form', () => {
    it('toggles form when Add Wine button clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Wine/i })).toBeInTheDocument();
      });

      // Form should not be visible
      expect(screen.queryByPlaceholderText(/Chateau Margaux/i)).not.toBeInTheDocument();

      // Click Add Wine
      await user.click(screen.getByRole('button', { name: /Add Wine/i }));

      // Form should be visible
      expect(screen.getByPlaceholderText(/Chateau Margaux/i)).toBeInTheDocument();
    });

    it('submits wine with correct data', async () => {
      const user = userEvent.setup();

      // Mock fetch for all calls
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Wine/i })).toBeInTheDocument();
      });

      // Open form
      await user.click(screen.getByRole('button', { name: /Add Wine/i }));

      // Fill form using placeholder text
      await user.type(screen.getByPlaceholderText(/Chateau Margaux/i), 'Test Wine');
      await user.type(screen.getByPlaceholderText(/2015/i), '2020');
      await user.type(screen.getByPlaceholderText(/Opus One/i), 'Test Producer');
      await user.type(screen.getByPlaceholderText(/France/i), 'France');

      // Submit
      await user.click(screen.getByRole('button', { name: /Save Wine/i }));

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
      color: 'RED',
      quantity: 1,
      rating: null,
      notes: null,
    };

    it('calls delete API when confirmed', async () => {
      const user = userEvent.setup();
      window.confirm = vi.fn(() => true);

      // Mock fetch to return wine initially, then empty after delete
      let callCount = 0;
      vi.mocked(global.fetch).mockImplementation((url, options) => {
        if (options?.method === 'DELETE') {
          return Promise.resolve({ ok: true, json: async () => ({}) });
        }
        // GET requests
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ ok: true, json: async () => [mockWine] });
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getAllByText('Test Wine').length).toBeGreaterThan(0);
      });

      await user.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/wines/1', {
          method: 'DELETE',
        });
      });
    });

    it('does not delete when cancelled', async () => {
      const user = userEvent.setup();
      window.confirm = vi.fn(() => false);

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [mockWine],
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getAllByText('Test Wine').length).toBeGreaterThan(0);
      });

      const fetchCallCount = vi.mocked(global.fetch).mock.calls.length;
      await user.click(screen.getByText('Delete'));

      // Verify DELETE was NOT called
      expect(vi.mocked(global.fetch).mock.calls.length).toBe(fetchCallCount);
    });
  });

  describe('Error Handling', () => {
    it('handles fetch error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('0 Bottles in Collection')).toBeInTheDocument();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching wines:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('handles add wine error', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock initial fetch to succeed, POST to fail
      vi.mocked(global.fetch).mockImplementation((url, options) => {
        if (options?.method === 'POST') {
          return Promise.reject(new Error('Server error'));
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Wine/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Add Wine/i }));
      await user.type(screen.getByPlaceholderText(/Chateau Margaux/i), 'Test Wine');
      await user.type(screen.getByPlaceholderText(/2015/i), '2020');
      await user.type(screen.getByPlaceholderText(/Opus One/i), 'Test Producer');
      await user.type(screen.getByPlaceholderText(/France/i), 'France');
      await user.click(screen.getByRole('button', { name: /Save Wine/i }));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error adding wine:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });

    it('handles delete error', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      window.confirm = vi.fn(() => true);

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
      };

      vi.mocked(global.fetch).mockImplementation((url, options) => {
        if (options?.method === 'DELETE') {
          return Promise.reject(new Error('Delete failed'));
        }
        return Promise.resolve({ ok: true, json: async () => [mockWine] });
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getAllByText('Test Wine').length).toBeGreaterThan(0);
      });

      await user.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting wine:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
