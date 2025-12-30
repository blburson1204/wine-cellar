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
    color: 'RED',
    quantity: 2,
    purchasePrice: 150.0,
    purchaseDate: '2020-01-15T00:00:00.000Z',
    drinkByDate: '2030-12-31T00:00:00.000Z',
    rating: 4.5,
    notes: 'Excellent wine with great aging potential',
  };

  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnCreate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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
      expect(screen.getByText('2 bottles')).toBeInTheDocument();
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

      // Check that dates are formatted (not showing ISO strings)
      expect(screen.getByText(/January/i)).toBeInTheDocument();
      expect(screen.getByText(/2020/)).toBeInTheDocument();
      expect(screen.getByText(/December/i)).toBeInTheDocument();
      expect(screen.getByText(/2030/)).toBeInTheDocument();
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

      expect(screen.getByText('1 bottle')).toBeInTheDocument();
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

      const backdrop = container.firstChild as HTMLElement;
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

    it('returns to view mode when cancel clicked without changes', async () => {
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

      // Should return to view mode - look for view mode buttons
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Edit Wine' })).toBeInTheDocument();
      });
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
      expect(screen.getByDisplayValue('1')).toBeInTheDocument(); // Default quantity
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

      // Get all input fields
      const textInputs = screen.getAllByRole('textbox');

      // Fill in required fields (Wine Name, Producer, Country)
      await user.type(textInputs[0], 'New Wine'); // Wine Name
      await user.type(textInputs[1], 'New Producer'); // Producer
      await user.type(textInputs[3], 'Italy'); // Country (after Region)

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
      const textInputs = screen.getAllByRole('textbox');
      await user.clear(textInputs[0]);

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

      const textInputs = screen.getAllByRole('textbox');
      await user.type(textInputs[0], 'Test'); // Wine name
      await user.type(textInputs[1], 'Test Producer'); // Producer
      await user.type(textInputs[3], 'France'); // Country

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

      const textInputs = screen.getAllByRole('textbox');
      await user.clear(textInputs[0]);
      await user.type(textInputs[0], 'Updated Wine Name');

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

      const textInputs = screen.getAllByRole('textbox');
      await user.type(textInputs[0], 'Test');
      await user.type(textInputs[1], 'Test Producer');
      await user.type(textInputs[3], 'France');

      await user.click(screen.getByRole('button', { name: 'Add Wine' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Adding...' })).toBeInTheDocument();
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

      const textInputs = screen.getAllByRole('textbox');
      await user.type(textInputs[0], 'Test');
      await user.type(textInputs[1], 'Test Producer');
      await user.type(textInputs[3], 'France');

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
});
