import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WineDetailModal from '../../components/WineDetailModal';

// Mock useMediaQuery to simulate mobile viewport
const mockUseMediaQuery = vi.fn(() => false);
vi.mock('../../hooks/useMediaQuery', () => ({
  useMediaQuery: () => mockUseMediaQuery(),
}));

describe('WineDetailModal - Hover Effects & Mobile Footer', () => {
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
  const mockOnToggleFavorite = vi.fn();

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

  describe('Edit Mode Button Hover Effects', () => {
    it('changes cancel button background on mouse over', async () => {
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
      });

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      fireEvent.mouseOver(cancelButton);
      expect(cancelButton.style.backgroundColor).toBe('rgba(255, 255, 255, 0.1)');

      fireEvent.mouseOut(cancelButton);
      expect(cancelButton.style.backgroundColor).toBe('transparent');
    });

    it('changes save button background on mouse over', async () => {
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

      const saveButton = screen.getByRole('button', { name: 'Save Changes' });

      fireEvent.mouseOver(saveButton);
      expect(saveButton.style.backgroundColor).toBe('rgb(90, 2, 16)');

      fireEvent.mouseOut(saveButton);
      expect(saveButton.style.backgroundColor).toBe('rgb(61, 1, 11)');
    });

    it('changes add wine button background on mouse over in add mode', () => {
      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={vi.fn()}
        />
      );

      const addButton = screen.getByRole('button', { name: 'Add Wine' });

      fireEvent.mouseOver(addButton);
      expect(addButton.style.backgroundColor).toBe('rgb(90, 2, 16)');

      fireEvent.mouseOut(addButton);
      expect(addButton.style.backgroundColor).toBe('rgb(61, 1, 11)');
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

      // Mobile footer should have Close and Edit Wine buttons
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

      // Should have a Delete button in the mobile footer
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

      // Find and click the Delete button in the mobile footer
      const deleteButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.textContent === 'Delete');
      await user.click(deleteButtons[0]);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    it('calls onClose when mobile footer Close is clicked', async () => {
      const user = userEvent.setup();

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(mockOnClose).toHaveBeenCalled();
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

  describe('Desktop View Mode Button Hover Effects', () => {
    it('changes Delete Wine button background on hover', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: 'Delete Wine' });

      fireEvent.mouseOver(deleteButton);
      expect(deleteButton.style.backgroundColor).toBe('rgba(139, 58, 58, 0.2)');

      fireEvent.mouseOut(deleteButton);
      expect(deleteButton.style.backgroundColor).toBe('transparent');
    });

    it('changes Close button background on hover in view mode', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const closeButton = screen.getByRole('button', { name: 'Close' });

      fireEvent.mouseOver(closeButton);
      expect(closeButton.style.backgroundColor).toBe('rgba(255, 255, 255, 0.1)');

      fireEvent.mouseOut(closeButton);
      expect(closeButton.style.backgroundColor).toBe('transparent');
    });

    it('changes Edit Wine button background on hover in view mode', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const editButton = screen.getByRole('button', { name: 'Edit Wine' });

      fireEvent.mouseOver(editButton);
      expect(editButton.style.backgroundColor).toBe('rgb(90, 2, 16)');

      fireEvent.mouseOut(editButton);
      expect(editButton.style.backgroundColor).toBe('rgb(61, 1, 11)');
    });
  });

  describe('Favorite Star Hover Effects in View Mode', () => {
    it('changes unfavorited star color on hover', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const star = screen.getByText('☆');

      fireEvent.mouseOver(star);
      expect(star.style.color).toBe('rgba(230, 57, 70, 0.6)');

      fireEvent.mouseOut(star);
      expect(star.style.color).toBe('rgba(255, 255, 255, 0.3)');
    });

    it('restores favorited star color on mouse out', () => {
      const favoriteWine = { ...mockWine, favorite: true };
      render(
        <WineDetailModal
          wine={favoriteWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      const stars = screen.getAllByText('★');
      const star = stars[0];

      fireEvent.mouseOver(star);
      fireEvent.mouseOut(star);
      expect(star.style.color).toBe('rgb(230, 57, 70)');
    });
  });

  describe('Wine Link Hover Effects', () => {
    it('underlines wine link on hover and removes on mouse out', () => {
      const wineWithLink = { ...mockWine, wineLink: 'https://example.com/wine' };
      render(
        <WineDetailModal
          wine={wineWithLink}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const link = screen.getByText('Wine Details →');

      fireEvent.mouseOver(link);
      expect(link.style.textDecoration).toBe('underline');

      fireEvent.mouseOut(link);
      expect(link.style.textDecoration).toBe('none');
    });
  });

  describe('Image Button Hover Effects in Edit Mode', () => {
    it('changes Upload Image button opacity on hover', () => {
      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={vi.fn()}
        />
      );

      const uploadButton = screen.getByRole('button', { name: 'Upload Image' });

      fireEvent.mouseOver(uploadButton);
      expect(uploadButton.style.opacity).toBe('0.8');

      fireEvent.mouseOut(uploadButton);
      expect(uploadButton.style.opacity).toBe('1');
    });

    it('changes image Delete button background on hover', async () => {
      const user = userEvent.setup();
      const wineWithImage = { ...mockWine, imageUrl: 'https://example.com/wine.jpg' };

      render(
        <WineDetailModal
          wine={wineWithImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Enter edit mode
      await user.click(screen.getByRole('button', { name: 'Edit Wine' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      });

      // Find the Delete button in the image section
      const deleteButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.textContent === 'Delete');
      const imageDeleteButton = deleteButtons[0];

      fireEvent.mouseOver(imageDeleteButton);
      expect(imageDeleteButton.style.backgroundColor).toBe('rgba(139, 58, 58, 0.2)');

      fireEvent.mouseOut(imageDeleteButton);
      expect(imageDeleteButton.style.backgroundColor).toBe('transparent');
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
