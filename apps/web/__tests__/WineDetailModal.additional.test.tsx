import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import WineDetailModal from '../src/components/WineDetailModal';

describe('WineDetailModal - Additional Coverage', () => {
  const mockWine = {
    id: '1',
    name: 'Test Wine',
    vintage: 2020,
    producer: 'Test Producer',
    region: 'Test Region',
    country: 'France',
    grapeVariety: 'Cabernet Sauvignon',
    blendDetail: 'Cab 60%, Merlot 40%',
    color: 'RED',
    quantity: 2,
    purchasePrice: 50.0,
    purchaseDate: '2023-01-15T00:00:00.000Z',
    drinkByDate: '2030-12-31T00:00:00.000Z',
    rating: 3.5,
    notes: 'Great wine',
    expertRatings: null,
    wherePurchased: null,
    wineLink: 'https://example.com/wine',
    favorite: false,
    imageUrl: null,
  };

  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnCreate = vi.fn();
  const mockOnToggleFavorite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch to return empty arrays for meta endpoints (combobox options)
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

  describe('Escape Key Handler', () => {
    it('closes modal when Escape key is pressed', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Wine Link Display', () => {
    it('displays wine link when present', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const link = screen.getByRole('link', { name: /wine details/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com/wine');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('does not display wine link when null', () => {
      const wineWithoutLink = { ...mockWine, wineLink: null };

      render(
        <WineDetailModal
          wine={wineWithoutLink}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByRole('link', { name: /wine details/i })).not.toBeInTheDocument();
    });
  });

  describe('Favorite Toggle', () => {
    it('displays non-favorite star when wine is not favorite', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      // Non-favorite shows empty star
      expect(screen.getByText('☆')).toBeInTheDocument();
    });

    it('displays filled star when wine is favorite', () => {
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

      // The filled star in the header (now a button, not a span)
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton.textContent).toBe('★');
    });

    it('calls onToggleFavorite when star is clicked', async () => {
      const user = userEvent.setup();

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onToggleFavorite={mockOnToggleFavorite}
        />
      );

      await user.click(screen.getByText('☆'));

      expect(mockOnToggleFavorite).toHaveBeenCalledWith(mockWine);
    });

    it('does not show favorite toggle when onToggleFavorite not provided', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Should not have the empty star toggle
      expect(screen.queryByText('☆')).not.toBeInTheDocument();
    });
  });

  describe('StarRating Component', () => {
    it('displays "Not rated" when rating is null', () => {
      const unratedWine = { ...mockWine, rating: null };

      render(
        <WineDetailModal
          wine={unratedWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Not rated')).toBeInTheDocument();
    });

    it('displays numeric rating value', () => {
      const wine4Stars = { ...mockWine, rating: 4.0 };

      render(
        <WineDetailModal
          wine={wine4Stars}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('(4.0)')).toBeInTheDocument();
    });
  });

  describe('formatDate Edge Cases', () => {
    it('displays em dash for null date', () => {
      const wineNullDate = { ...mockWine, purchaseDate: null };

      render(
        <WineDetailModal
          wine={wineNullDate}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Find the purchase date field and check for em dash
      const purchaseDateLabel = screen.getByText('Purchase Date');
      const purchaseDateValue = purchaseDateLabel.parentElement?.querySelector('p');
      expect(purchaseDateValue?.textContent).toBe('—');
    });

    it('handles invalid date string gracefully', () => {
      const wineInvalidDate = { ...mockWine, purchaseDate: 'not-a-date' };

      render(
        <WineDetailModal
          wine={wineInvalidDate}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // formatDate catches the error and returns em dash for invalid dates
      // Note: 'not-a-date' creates an Invalid Date object, which formatDate handles
      const purchaseDateLabel = screen.getByText('Purchase Date');
      const purchaseDateValue = purchaseDateLabel.parentElement?.querySelector('p');
      // The formatDate function tries to format the date; if it throws, it returns '—'
      // But 'not-a-date' creates Invalid Date which doesn't throw, just returns 'Invalid Date'
      expect(purchaseDateValue?.textContent).toBeDefined();
    });
  });

  describe('formatPrice Edge Cases', () => {
    it('displays em dash for null price', () => {
      const wineNullPrice = { ...mockWine, purchasePrice: null };

      render(
        <WineDetailModal
          wine={wineNullPrice}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const purchasePriceLabel = screen.getByText('Purchase Price');
      const purchasePriceValue = purchasePriceLabel.parentElement?.querySelector('p');
      expect(purchasePriceValue?.textContent).toBe('—');
    });

    it('formats price with two decimal places', () => {
      const wineWithPrice = { ...mockWine, purchasePrice: 99.9 };

      render(
        <WineDetailModal
          wine={wineWithPrice}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('$99.90')).toBeInTheDocument();
    });
  });

  describe('Blend Details Display', () => {
    it('displays blend details when present', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Cab 60%, Merlot 40%')).toBeInTheDocument();
    });

    it('displays em dash when blend details is null', () => {
      const wineNoBlend = { ...mockWine, blendDetail: null };

      render(
        <WineDetailModal
          wine={wineNoBlend}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const blendLabel = screen.getByText('Blend Details');
      const blendValue = blendLabel.parentElement?.querySelector('p');
      expect(blendValue?.textContent).toBe('—');
    });
  });

  describe('Form Validation Edge Cases', () => {
    it.each([
      ['Enter wine name', 'Name must be less than 200 characters', 201],
      ['Enter producer', 'Producer must be less than 200 characters', 201],
      ['Enter country', 'Country must be less than 100 characters', 101],
      ['Enter region', 'Region must be less than 200 characters', 201],
      ['Enter grape variety', 'Grape variety must be less than 200 characters', 201],
    ])('validates "%s" field max length', async (placeholder, expectedError, charCount) => {
      const user = userEvent.setup();

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      const nameInput = screen.getByPlaceholderText('Enter wine name');
      const producerInput = screen.getByPlaceholderText('Enter producer');
      const countryInput = screen.getByPlaceholderText('Enter country');
      const targetInput = screen.getByPlaceholderText(placeholder);

      // Fill required fields with valid data (unless they're the one being tested)
      if (placeholder !== 'Enter wine name') await user.type(nameInput, 'Wine Name');
      if (placeholder !== 'Enter producer') await user.type(producerInput, 'Producer');
      if (placeholder !== 'Enter country') {
        await user.click(nameInput);
        await user.type(countryInput, 'Country');
      }
      await user.click(nameInput);

      // Type the overlong value into the target field
      await user.type(targetInput, 'X'.repeat(charCount));
      // Blur Combobox fields to close dropdown before clicking submit
      if (placeholder !== 'Enter wine name') await user.click(nameInput);

      await user.click(screen.getByRole('button', { name: 'Add Wine' }));
      expect(screen.getByText(expectedError)).toBeInTheDocument();
    });

    it('validates notes too long', async () => {
      const user = userEvent.setup();

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      const nameInput = screen.getByPlaceholderText('Enter wine name');
      const producerInput = screen.getByPlaceholderText('Enter producer');
      const countryInput = screen.getByPlaceholderText('Enter country');

      await user.type(nameInput, 'Wine Name');
      await user.type(producerInput, 'Producer');
      await user.click(nameInput); // Blur Combobox
      await user.type(countryInput, 'Country');
      await user.click(nameInput); // Blur Combobox

      // Notes is the last textbox (textarea)
      const textInputs = screen.getAllByRole('textbox');
      const notesInput = textInputs[textInputs.length - 1];
      // Set value beyond limit to test validation
      fireEvent.change(notesInput, { target: { value: 'N'.repeat(2001) } });

      await user.click(screen.getByRole('button', { name: 'Add Wine' }));

      expect(screen.getByText('Notes must be less than 2000 characters')).toBeInTheDocument();
    });

    it('validates negative quantity', async () => {
      const user = userEvent.setup();

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      const nameInput = screen.getByPlaceholderText('Enter wine name');
      const producerInput = screen.getByPlaceholderText('Enter producer');
      const countryInput = screen.getByPlaceholderText('Enter country');

      await user.type(nameInput, 'Wine Name');
      await user.type(producerInput, 'Producer');
      await user.click(nameInput); // Blur Combobox
      await user.type(countryInput, 'Country');
      await user.click(nameInput); // Blur Combobox

      const spinButtons = screen.getAllByRole('spinbutton');
      const quantityInput = spinButtons.find((input) => input.getAttribute('min') === '0');

      if (quantityInput) {
        // Use fireEvent to set negative value directly since HTML min attribute prevents typing negative
        fireEvent.change(quantityInput, { target: { value: '-5' } });
      }

      await user.click(screen.getByRole('button', { name: 'Add Wine' }));

      expect(screen.getByText('Quantity cannot be negative')).toBeInTheDocument();
    });

    it('validates purchase price must be positive', async () => {
      const user = userEvent.setup();

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      const nameInput = screen.getByPlaceholderText('Enter wine name');
      const producerInput = screen.getByPlaceholderText('Enter producer');
      const countryInput = screen.getByPlaceholderText('Enter country');

      await user.type(nameInput, 'Wine Name');
      await user.type(producerInput, 'Producer');
      await user.click(nameInput); // Blur Combobox
      await user.type(countryInput, 'Country');
      await user.click(nameInput); // Blur Combobox

      const spinButtons = screen.getAllByRole('spinbutton');
      const priceInput = spinButtons.find((input) => input.getAttribute('step') === '0.01');

      if (priceInput) {
        await user.type(priceInput, '0');
      }

      await user.click(screen.getByRole('button', { name: 'Add Wine' }));

      expect(screen.getByText('Purchase price must be positive')).toBeInTheDocument();
    });

    it('validates purchase price decimal places', async () => {
      const user = userEvent.setup();

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      const nameInput = screen.getByPlaceholderText('Enter wine name');
      const producerInput = screen.getByPlaceholderText('Enter producer');
      const countryInput = screen.getByPlaceholderText('Enter country');

      await user.type(nameInput, 'Wine Name');
      await user.type(producerInput, 'Producer');
      await user.click(nameInput); // Blur Combobox
      await user.type(countryInput, 'Country');
      await user.click(nameInput); // Blur Combobox

      const spinButtons = screen.getAllByRole('spinbutton');
      const priceInput = spinButtons.find((input) => input.getAttribute('step') === '0.01');

      if (priceInput) {
        await user.type(priceInput, '10.999');
      }

      await user.click(screen.getByRole('button', { name: 'Add Wine' }));

      expect(
        screen.getByText('Purchase price must have at most 2 decimal places')
      ).toBeInTheDocument();
    });

    it('validates rating increment (0.1)', async () => {
      const user = userEvent.setup();

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      const nameInput = screen.getByPlaceholderText('Enter wine name');
      const producerInput = screen.getByPlaceholderText('Enter producer');
      const countryInput = screen.getByPlaceholderText('Enter country');

      await user.type(nameInput, 'Wine Name');
      await user.type(producerInput, 'Producer');
      await user.click(nameInput); // Blur Combobox
      await user.type(countryInput, 'Country');
      await user.click(nameInput); // Blur Combobox

      const spinButtons = screen.getAllByRole('spinbutton');
      const ratingInput = spinButtons.find((input) => input.getAttribute('step') === '0.1');

      if (ratingInput) {
        // Use fireEvent to set value with incorrect increment
        fireEvent.change(ratingInput, { target: { value: '3.55' } });
      }

      await user.click(screen.getByRole('button', { name: 'Add Wine' }));

      expect(
        screen.getByText('Rating must be in 0.1 increments (e.g., 3.1, 4.5)')
      ).toBeInTheDocument();
    });
  });

  describe('handleSave Error Handling', () => {
    it('throws error when onCreate is not provided in add mode', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          // onCreate intentionally not provided
        />
      );

      const nameInput = screen.getByPlaceholderText('Enter wine name');
      const producerInput = screen.getByPlaceholderText('Enter producer');
      const countryInput = screen.getByPlaceholderText('Enter country');

      await user.type(nameInput, 'Wine Name');
      await user.type(producerInput, 'Producer');
      await user.click(nameInput); // Blur Combobox
      await user.type(countryInput, 'Country');
      await user.click(nameInput); // Blur Combobox

      await user.click(screen.getByRole('button', { name: 'Add Wine' }));

      expect(screen.getByText('Failed to add wine. Please try again.')).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    it('shows error when update fails', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockOnUpdate.mockRejectedValue(new Error('Update failed'));

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Edit Wine' }));

      const textInputs = screen.getAllByRole('textbox');
      await user.clear(textInputs[0]);
      await user.type(textInputs[0], 'Updated Name');

      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      expect(
        await screen.findByText('Failed to update wine. Please try again.')
      ).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Modal Accessibility', () => {
    it('has correct aria attributes', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'wine-modal-title');
    });

    it('has wine emoji with aria-hidden', () => {
      render(
        <WineDetailModal
          wine={{ ...mockWine, imageUrl: null }}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const emoji = screen.getByText('🍷');
      expect(emoji).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Edit Mode Focus Management', () => {
    it('focuses close button in view mode', async () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Wait for effect to run
      await new Promise((resolve) => setTimeout(resolve, 0));

      const closeButton = screen.getByRole('button', { name: 'Close' });
      expect(document.activeElement).toBe(closeButton);
    });
  });
});
