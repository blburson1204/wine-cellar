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

describe('WineDetailModal Accessibility & Loading States', () => {
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

  describe('Favorite button accessibility', () => {
    it('favorite toggle is a button element with correct aria attributes', () => {
      render(<WineDetailModal {...defaultProps} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton.tagName).toBe('BUTTON');
      expect(favoriteButton).toHaveAttribute('aria-label');
      expect(favoriteButton).toHaveAttribute('type', 'button');
    });

    it('favorite button has aria-pressed=true when favorited', () => {
      render(<WineDetailModal {...defaultProps} wine={mockFavoriteWine} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('LoadingSpinner in save button', () => {
    it('shows LoadingSpinner when saving', async () => {
      const user = userEvent.setup();
      const pendingPromise = new Promise<void>(() => {});
      const onUpdate = vi.fn().mockReturnValue(pendingPromise);

      render(<WineDetailModal {...defaultProps} onUpdate={onUpdate} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/saving/i)).toBeInTheDocument();
      });

      const spinner = document.querySelector('[role="status"][aria-label="Loading"]');
      expect(spinner).toBeInTheDocument();
    });

    it('shows LoadingSpinner when uploading image', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/image')) {
          return new Promise(() => {});
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      render(<WineDetailModal {...defaultProps} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(['image-data'], 'wine.jpg', { type: 'image/jpeg' });
        await user.upload(fileInput, file);

        await waitFor(() => {
          expect(screen.getByText(/uploading/i)).toBeInTheDocument();
        });

        const spinner = document.querySelector('[role="status"][aria-label="Loading"]');
        expect(spinner).toBeInTheDocument();
      }
    });
  });
});
