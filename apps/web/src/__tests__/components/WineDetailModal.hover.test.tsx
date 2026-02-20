import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WineDetailModal from '../../components/WineDetailModal';

// Mock useMediaQuery to simulate mobile viewport
const mockUseMediaQuery = vi.fn(() => false);
vi.mock('../../hooks/useMediaQuery', () => ({
  useMediaQuery: () => mockUseMediaQuery(),
}));

describe('WineDetailModal - Mobile Footer & File Validation', () => {
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
    quantity: 2,
    purchasePrice: 50.0,
    purchaseDate: '2023-01-15T00:00:00.000Z',
    drinkByDate: '2030-12-31T00:00:00.000Z',
    rating: 3.5,
    notes: 'Great wine',
    expertRatings: null,
    wherePurchased: null,
    wineLink: null,
    favorite: false,
    imageUrl: null,
  };

  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMediaQuery.mockReturnValue(false);
    vi.mocked(global.fetch).mockImplementation((url: string | URL | Request) => {
      const urlString = url.toString();
      if (urlString.includes('/api/wines/meta/')) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as Response);
    });
  });

  describe('Mobile View Mode Footer', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true);
    });

    it('renders mobile footer with Close and Edit Wine buttons', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit Wine' })).toBeInTheDocument();
    });

    it('renders mobile footer Delete button when onDelete is provided', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.textContent === 'Delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('calls onClose and onDelete when mobile footer Delete is clicked', async () => {
      const user = userEvent.setup();

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.textContent === 'Delete');
      await user.click(deleteButtons[0]);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    it('switches to edit mode when mobile footer Edit Wine is clicked', async () => {
      const user = userEvent.setup();

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Edit Wine' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Edit Mode', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true);
    });

    it('shows cancel and save buttons in mobile edit mode', async () => {
      const user = userEvent.setup();

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Edit Wine' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
      });
    });
  });

  describe('File Size Validation in Edit Mode', () => {
    it('rejects files over 5MB', async () => {
      const user = userEvent.setup();

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Edit Wine' }));

      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, largeFile);

      await waitFor(() => {
        expect(screen.getByText(/exceeds maximum 5MB/i)).toBeInTheDocument();
      });
    });
  });
});
