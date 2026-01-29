import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WineDetailModal from '../../components/WineDetailModal';

// Mock useMediaQuery
vi.mock('../../hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(),
}));

import { useMediaQuery } from '../../hooks/useMediaQuery';

const mockWine = {
  id: '1',
  name: 'Test Wine',
  vintage: 2020,
  producer: 'Test Producer',
  region: 'Test Region',
  country: 'France',
  grapeVariety: 'Cabernet Sauvignon',
  blendDetail: null,
  color: 'RED',
  quantity: 6,
  purchasePrice: 50,
  purchaseDate: '2022-01-15',
  drinkByDate: '2030-12-31',
  rating: 4.5,
  notes: 'Great wine',
  expertRatings: null,
  wherePurchased: 'Wine Shop',
  wineLink: 'https://example.com/wine',
  favorite: false,
  imageUrl: null,
};

const mockFavoriteWine = {
  ...mockWine,
  favorite: true,
};

describe('WineDetailModal Touch Targets', () => {
  const defaultProps = {
    wine: mockWine,
    onClose: vi.fn(),
    onUpdate: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn(),
    onToggleFavorite: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMediaQuery).mockReturnValue(true); // Mobile view
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  describe('FR-006: Favorite button element and accessibility', () => {
    it('favorite toggle is a button element, not a span', () => {
      render(<WineDetailModal {...defaultProps} />);

      // Should be accessible as a button with the favorite/star function
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton.tagName).toBe('BUTTON');
    });

    it('favorite button has aria-label', () => {
      render(<WineDetailModal {...defaultProps} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toHaveAttribute('aria-label');
    });

    it('favorite button has aria-pressed=false when not favorited', () => {
      render(<WineDetailModal {...defaultProps} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('favorite button has aria-pressed=true when favorited', () => {
      render(<WineDetailModal {...defaultProps} wine={mockFavoriteWine} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('favorite button has 44px minimum touch target', () => {
      render(<WineDetailModal {...defaultProps} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    });

    it('favorite button calls onToggleFavorite when clicked', async () => {
      const user = userEvent.setup();
      render(<WineDetailModal {...defaultProps} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      await user.click(favoriteButton);

      expect(defaultProps.onToggleFavorite).toHaveBeenCalledWith(mockWine);
    });

    it('favorite button has type="button" to prevent form submission', () => {
      render(<WineDetailModal {...defaultProps} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toHaveAttribute('type', 'button');
    });
  });

  describe('FR-007: Wine link touch target', () => {
    it('wine details link has minHeight 44px', () => {
      render(<WineDetailModal {...defaultProps} />);

      const wineLink = screen.getByText('Wine Details →');
      expect(wineLink).toHaveStyle({ minHeight: '44px' });
    });

    it('wine details link renders as an anchor tag', () => {
      render(<WineDetailModal {...defaultProps} />);

      const wineLink = screen.getByText('Wine Details →');
      expect(wineLink.tagName).toBe('A');
    });

    it('wine details link has display inline-flex for vertical alignment', () => {
      render(<WineDetailModal {...defaultProps} />);

      const wineLink = screen.getByText('Wine Details →');
      expect(wineLink).toHaveStyle({ display: 'inline-flex' });
    });
  });

  describe('FR-013: LoadingSpinner in save button', () => {
    it('shows LoadingSpinner when saving', async () => {
      const user = userEvent.setup();
      // Mock onUpdate to return a promise that stays pending (simulates loading)
      const pendingPromise = new Promise<void>(() => {});
      const onUpdate = vi.fn().mockReturnValue(pendingPromise);

      render(<WineDetailModal {...defaultProps} onUpdate={onUpdate} />);

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Click save - form should be valid since wine data fills the form
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Wait for saving state to be set
      await waitFor(() => {
        expect(screen.getByText(/saving/i)).toBeInTheDocument();
      });

      // A LoadingSpinner should be present in the save button area
      const spinner = document.querySelector('[role="status"][aria-label="Loading"]');
      expect(spinner).toBeInTheDocument();
    });

    it('shows LoadingSpinner when uploading image', async () => {
      const user = userEvent.setup();
      // Mock fetch for image upload that stays pending
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/image')) {
          return new Promise(() => {}); // Never resolves - stays in uploading state
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      render(<WineDetailModal {...defaultProps} />);

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Simulate file upload by finding the hidden file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(['image-data'], 'wine.jpg', { type: 'image/jpeg' });
        await user.upload(fileInput, file);

        // Wait for uploading state
        await waitFor(() => {
          expect(screen.getByText(/uploading/i)).toBeInTheDocument();
        });

        // A LoadingSpinner should be present
        const spinner = document.querySelector('[role="status"][aria-label="Loading"]');
        expect(spinner).toBeInTheDocument();
      }
    });
  });
});
