import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import WineDetailModal from '../src/components/WineDetailModal';

describe('WineDetailModal', () => {
  const mockWine = {
    id: '1',
    name: 'Chateau Margaux',
    vintage: 2015,
    producer: 'Margaux Winery',
    region: 'Bordeaux',
    country: 'France',
    grapeVariety: 'Cabernet Sauvignon',
    blendDetail: null,
    color: 'RED',
    quantity: 2,
    purchasePrice: 150.0,
    purchaseDate: '2020-01-15T00:00:00.000Z',
    drinkByDate: '2030-12-31T00:00:00.000Z',
    rating: 4.5,
    notes: 'Excellent wine with great aging potential',
    expertRatings: null,
    wherePurchased: null,
    wineLink: null,
    favorite: false,
    imageUrl: null,
  };

  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnCreate = vi.fn();
  const mockOnDelete = vi.fn();

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

  describe('Read-Only View Mode', () => {
    it('renders wine details in view mode', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Check header
      expect(screen.getByText('Chateau Margaux')).toBeInTheDocument();
      expect(screen.getByText(/2015.*Margaux Winery/)).toBeInTheDocument();

      // Check details
      expect(screen.getByText('Bordeaux')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
      expect(screen.getByText('Cabernet Sauvignon')).toBeInTheDocument();
      expect(screen.getByText('Yes - 2 bottles')).toBeInTheDocument();
      expect(screen.getByText('$150.00')).toBeInTheDocument();
      expect(screen.getByText('Excellent wine with great aging potential')).toBeInTheDocument();

      // Check buttons
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit Wine' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete Wine' })).toBeInTheDocument();
    });

    it('formats dates correctly', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Check that purchase date is formatted (not showing ISO strings)
      expect(screen.getByText(/January/i)).toBeInTheDocument();
      expect(screen.getByText(/2020/)).toBeInTheDocument();
    });

    it('displays rating with stars', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('(4.5)')).toBeInTheDocument();
    });

    it('shows singular bottle when quantity is 1', () => {
      const singleBottleWine = { ...mockWine, quantity: 1 };
      render(
        <WineDetailModal
          wine={singleBottleWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Yes - 1 bottle')).toBeInTheDocument();
    });

    it('shows No when quantity is 0', () => {
      const noCellarWine = { ...mockWine, quantity: 0 };
      render(
        <WineDetailModal
          wine={noCellarWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Currently in Cellar?')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
    });

    it('displays em dash for null values', () => {
      const wineWithNulls = {
        ...mockWine,
        region: null,
        grapeVariety: null,
        purchasePrice: null,
        purchaseDate: null,
        drinkByDate: null,
        rating: null,
        notes: null,
      };

      render(
        <WineDetailModal
          wine={wineWithNulls}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Should show em dashes for null fields
      const emDashes = screen.getAllByText('—');
      expect(emDashes.length).toBeGreaterThan(0);
      expect(screen.getByText('Not rated')).toBeInTheDocument();
    });

    it('calls onClose when close button clicked', async () => {
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
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop clicked', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Find the backdrop div (fixed position overlay)
      const backdrop = container.querySelector('div[style*="position: fixed"]') as HTMLElement;
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onDelete then onClose when delete button clicked', async () => {
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

      await user.click(screen.getByRole('button', { name: 'Delete Wine' }));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    it('does not show delete button when onDelete not provided', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByRole('button', { name: 'Delete Wine' })).not.toBeInTheDocument();
    });
  });

  describe('Edit Mode Toggle', () => {
    it('switches to edit mode when Edit Wine clicked', async () => {
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

      // Should show edit form
      expect(screen.getByText('Edit Wine')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('closes modal when cancel clicked without changes', async () => {
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
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      // Should close the modal
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows confirmation when canceling with unsaved changes', async () => {
      const user = userEvent.setup();
      const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Edit Wine' }));

      // Make a change to the first text input (wine name)
      const inputs = screen.getAllByRole('textbox');
      await user.clear(inputs[0]); // Wine name field
      await user.type(inputs[0], 'Modified Wine Name');

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockConfirm).toHaveBeenCalledWith(
        'You have unsaved changes. Are you sure you want to cancel?'
      );

      mockConfirm.mockRestore();
    });
  });

  describe('Add Mode', () => {
    it('renders add form with default values', () => {
      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      expect(screen.getByText('Add New Wine')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Wine' })).toBeInTheDocument();

      // Check default values
      expect(screen.getByDisplayValue(new Date().getFullYear().toString())).toBeInTheDocument();
      expect(screen.getByDisplayValue('0')).toBeInTheDocument(); // Default quantity
    });

    it('closes modal when cancel clicked in add mode', async () => {
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

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onCreate with wine data when form submitted', async () => {
      const user = userEvent.setup();
      mockOnCreate.mockResolvedValue(undefined);

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      // Wait for form to be fully initialized (default vintage should be visible)
      await waitFor(() => {
        expect(screen.getByDisplayValue(new Date().getFullYear().toString())).toBeInTheDocument();
      });

      // Fill required fields using specific placeholder text
      const nameInput = screen.getByPlaceholderText('Enter wine name');
      const producerInput = screen.getByPlaceholderText('Enter producer');
      const countryInput = screen.getByPlaceholderText('Enter country');

      // Fill name (regular input)
      await user.type(nameInput, 'New Wine');
      expect(nameInput).toHaveValue('New Wine');

      // Fill producer (Combobox) - type and blur by clicking elsewhere
      await user.type(producerInput, 'New Producer');
      await user.click(nameInput); // Blur producer combobox

      // Fill country (Combobox) - type and blur by clicking elsewhere
      await user.type(countryInput, 'Italy');
      await user.click(nameInput); // Blur country combobox

      await user.click(screen.getByRole('button', { name: 'Add Wine' }));

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Wine',
            producer: 'New Producer',
            country: 'Italy',
          })
        );
      });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('validates required field - name', async () => {
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

      // Clear the name field and try to submit
      const nameInput = screen.getByPlaceholderText('Enter wine name');
      await user.clear(nameInput);

      await user.click(screen.getByRole('button', { name: 'Add Wine' }));

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    it('validates rating range', async () => {
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
      await user.type(nameInput, 'Test');
      // Blur Combobox fields to commit values
      await user.type(producerInput, 'Test Producer');
      await user.click(nameInput);
      await user.type(countryInput, 'France');
      await user.click(nameInput);

      const spinButtons = screen.getAllByRole('spinbutton');
      const ratingInput = spinButtons.find((input) => input.getAttribute('step') === '0.1');

      if (ratingInput) {
        await user.type(ratingInput, '6');
        await user.click(screen.getByRole('button', { name: 'Add Wine' }));

        await waitFor(() => {
          expect(screen.getByText(/Rating must be between 1.0 and 5.0/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Save and Update', () => {
    it('calls onUpdate when saving changes in edit mode', async () => {
      const user = userEvent.setup();
      mockOnUpdate.mockResolvedValue(undefined);

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Edit Wine' }));

      const nameInput = screen.getByPlaceholderText('Enter wine name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Wine Name');

      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            name: 'Updated Wine Name',
          })
        );
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows saving state when submitting', async () => {
      const user = userEvent.setup();
      let resolveSave: () => void;
      const savePromise = new Promise<void>((resolve) => {
        resolveSave = resolve;
      });
      mockOnCreate.mockReturnValue(savePromise);

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      // Fill in required fields (blur Combobox fields to commit values)
      const nameInput = screen.getByPlaceholderText('Enter wine name');
      const producerInput = screen.getByPlaceholderText('Enter producer');
      const countryInput = screen.getByPlaceholderText('Enter country');
      await user.type(nameInput, 'Test');
      await user.type(producerInput, 'Test Producer');
      await user.click(nameInput);
      await user.type(countryInput, 'France');
      await user.click(nameInput);

      await user.click(screen.getByRole('button', { name: 'Add Wine' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /adding/i })).toBeInTheDocument();
      });

      resolveSave!();
    });

    it('handles save errors', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockOnCreate.mockRejectedValue(new Error('Save failed'));

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      // Fill in required fields (blur Combobox fields to commit values)
      const nameInput = screen.getByPlaceholderText('Enter wine name');
      const producerInput = screen.getByPlaceholderText('Enter producer');
      const countryInput = screen.getByPlaceholderText('Enter country');
      await user.type(nameInput, 'Test');
      await user.type(producerInput, 'Test Producer');
      await user.click(nameInput);
      await user.type(countryInput, 'France');
      await user.click(nameInput);

      await user.click(screen.getByRole('button', { name: 'Add Wine' }));

      await waitFor(() => {
        expect(screen.getByText('Failed to add wine. Please try again.')).toBeInTheDocument();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Notes Character Counter', () => {
    it('displays character count for notes field', async () => {
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

      expect(screen.getByText('0 / 2000 characters')).toBeInTheDocument();

      // Notes textarea is the last textbox
      const textboxes = screen.getAllByRole('textbox');
      const notesInput = textboxes[textboxes.length - 1];
      await user.type(notesInput, 'Test notes');

      expect(screen.getByText('10 / 2000 characters')).toBeInTheDocument();
    });
  });

  describe('Null Handling', () => {
    it('returns null when wine is null in view mode', () => {
      const { container } = render(
        <WineDetailModal wine={null} mode="view" onClose={mockOnClose} onUpdate={mockOnUpdate} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Wine Label Image Display', () => {
    it('displays wine label image when imageUrl is present', () => {
      const wineWithImage = {
        ...mockWine,
        imageUrl: 'test-wine-label.jpg',
      };

      render(
        <WineDetailModal
          wine={wineWithImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const img = document.querySelector('img[alt*="label"]') as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.src).toContain(`/api/wines/${wineWithImage.id}/image`);
      expect(img.alt).toBe(`${wineWithImage.name} label`);
    });

    it('does not display image when imageUrl is null', () => {
      const wineWithoutImage = {
        ...mockWine,
        imageUrl: null,
      };

      render(
        <WineDetailModal
          wine={wineWithoutImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const img = document.querySelector('img[alt*="label"]');
      expect(img).not.toBeInTheDocument();
    });

    it('handles image load error by hiding image and showing placeholder', () => {
      const wineWithImage = {
        ...mockWine,
        imageUrl: 'test-wine-label.jpg',
      };

      render(
        <WineDetailModal
          wine={wineWithImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const img = document.querySelector('img[alt*="label"]') as HTMLImageElement;
      expect(img).toBeInTheDocument();

      // Get the placeholder (next sibling)
      const placeholder = img.nextElementSibling as HTMLElement;
      expect(placeholder).toBeInTheDocument();

      // Simulate image load error
      const errorEvent = new Event('error');
      img.dispatchEvent(errorEvent);

      // Image should be hidden after error
      expect(img.style.display).toBe('none');

      // Placeholder should be visible
      expect(placeholder.style.display).toBe('flex');
    });

    it('displays placeholder when imageUrl is null', () => {
      const wineWithoutImage = {
        ...mockWine,
        imageUrl: null,
      };

      render(
        <WineDetailModal
          wine={wineWithoutImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Should show placeholder text
      expect(screen.getByText('Image not available')).toBeInTheDocument();
      expect(screen.getByText('🍷')).toBeInTheDocument();
    });

    it('displays image with lazy loading attribute', () => {
      const wineWithImage = {
        ...mockWine,
        imageUrl: 'test-wine-label.jpg',
      };

      render(
        <WineDetailModal
          wine={wineWithImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const img = document.querySelector('img[alt*="label"]') as HTMLImageElement;
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('displays image in edit mode when imageUrl is present', () => {
      const wineWithImage = {
        ...mockWine,
        imageUrl: 'test-wine-label.jpg',
      };

      render(
        <WineDetailModal
          wine={wineWithImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Switch to edit mode
      const editButton = screen.getByRole('button', { name: 'Edit Wine' });
      editButton.click();

      // Image should still be displayed in edit mode
      const img = document.querySelector('img[alt*="label"]') as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.src).toContain(`/api/wines/${wineWithImage.id}/image`);
    });
  });

  describe('Expert Ratings and Where Purchased Fields', () => {
    beforeEach(() => {
      // Mock fetch for combobox options
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('displays expert ratings in view mode when present', () => {
      const wineWithExpertRatings = {
        ...mockWine,
        expertRatings: 'WS 92, RP 94, JD 95',
      };

      render(
        <WineDetailModal
          wine={wineWithExpertRatings}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Expert Ratings')).toBeInTheDocument();
      expect(screen.getByText('WS 92, RP 94, JD 95')).toBeInTheDocument();
    });

    it('displays where purchased in view mode when present', () => {
      const wineWithWherePurchased = {
        ...mockWine,
        wherePurchased: 'Total Wine',
      };

      render(
        <WineDetailModal
          wine={wineWithWherePurchased}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Where Purchased')).toBeInTheDocument();
      expect(screen.getByText('Total Wine')).toBeInTheDocument();
    });

    it('does not display expert ratings label when null', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByText('Expert Ratings')).not.toBeInTheDocument();
    });

    it('does not display where purchased label when null', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByText('Where Purchased')).not.toBeInTheDocument();
    });

    it('shows expert ratings input in edit mode', async () => {
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

      // Find the expert ratings input by placeholder
      const expertRatingsInput = screen.getByPlaceholderText('e.g., WS 92, RP 94, JD 95');
      expect(expertRatingsInput).toBeInTheDocument();
    });

    it('shows where purchased input as combobox in edit mode', async () => {
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

      // Find the where purchased input by placeholder (now a Combobox)
      const wherePurchasedInput = screen.getByPlaceholderText('Select or type...');
      expect(wherePurchasedInput).toBeInTheDocument();
      expect(wherePurchasedInput).toHaveAttribute('role', 'combobox');
    });

    it('can edit expert ratings field', async () => {
      const user = userEvent.setup();
      mockOnUpdate.mockResolvedValue(undefined);

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Edit Wine' }));

      const expertRatingsInput = screen.getByPlaceholderText('e.g., WS 92, RP 94, JD 95');
      await user.type(expertRatingsInput, 'WS 90, RP 91');

      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          mockWine.id,
          expect.objectContaining({
            expertRatings: 'WS 90, RP 91',
          })
        );
      });
    });

    it('can edit where purchased field', async () => {
      const user = userEvent.setup();
      mockOnUpdate.mockResolvedValue(undefined);

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Edit Wine' }));

      // Where Purchased is now a Combobox - type and blur to commit value
      const wherePurchasedInput = screen.getByPlaceholderText('Select or type...');
      await user.type(wherePurchasedInput, 'Wine.com');
      // Click elsewhere to trigger blur and commit the value
      const nameInput = screen.getByPlaceholderText('Enter wine name');
      await user.click(nameInput);

      await user.click(screen.getByRole('button', { name: 'Save Changes' }));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          mockWine.id,
          expect.objectContaining({
            wherePurchased: 'Wine.com',
          })
        );
      });
    });

    it('fetches combobox options on mount', async () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/wines/meta/where-purchased');
        expect(global.fetch).toHaveBeenCalledWith('/api/wines/meta/producers');
        expect(global.fetch).toHaveBeenCalledWith('/api/wines/meta/countries');
        expect(global.fetch).toHaveBeenCalledWith('/api/wines/meta/regions');
        expect(global.fetch).toHaveBeenCalledWith('/api/wines/meta/grape-varieties');
      });
    });
  });
});
