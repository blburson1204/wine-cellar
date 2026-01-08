import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WineDetailModal from '../../components/WineDetailModal';

describe('WineDetailModal - Image Upload/Delete', () => {
  const mockWine = {
    id: 'test-wine-123',
    name: 'Test Wine',
    vintage: 2020,
    producer: 'Test Winery',
    region: 'Napa Valley',
    country: 'USA',
    grapeVariety: 'Cabernet Sauvignon',
    blendDetail: null,
    color: 'red',
    quantity: 6,
    purchasePrice: 49.99,
    purchaseDate: '2024-01-15',
    drinkByDate: '2030-12-31',
    rating: 4.5,
    notes: 'Great wine',
    imageUrl: null,
  };

  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Image Upload UI', () => {
    it('should show upload button when in edit mode and no image exists', async () => {
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

      // Click edit button to enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Should show upload button
      const uploadButton = screen.getByRole('button', { name: /upload.*image/i });
      expect(uploadButton).toBeInTheDocument();
    });

    it('should show replace and delete buttons when image exists in edit mode', async () => {
      const user = userEvent.setup();
      const wineWithImage = { ...mockWine, imageUrl: 'test-wine-123.jpg' };

      render(
        <WineDetailModal
          wine={wineWithImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Should show replace and delete buttons
      expect(screen.getByRole('button', { name: /replace.*image/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete.*image/i })).toBeInTheDocument();
    });

    it('should accept only jpeg, png, and webp files', async () => {
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

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Find the hidden file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput?.accept).toBe('image/jpeg,image/png,image/webp');
    });

    it('should not show upload UI in view mode', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Should not show upload button in view mode
      const uploadButton = screen.queryByRole('button', { name: /upload.*image/i });
      expect(uploadButton).not.toBeInTheDocument();
    });
  });

  describe('Image Upload Functionality', () => {
    it('should successfully upload an image', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test-image-content'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        id: mockWine.id,
        imageUrl: 'test-wine-123.jpg',
        name: mockWine.name,
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Upload file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Wait for upload to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/api/wines/${mockWine.id}/image`),
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
          })
        );
      });

      // Should call onUpdate with new imageUrl
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(mockWine.id, {
          imageUrl: 'test-wine-123.jpg',
        });
      });
    });

    it('should show loading state during upload', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test-image-content'], 'test.jpg', { type: 'image/jpeg' });

      // Create a promise that we can control
      let resolveUpload: (value: any) => void;
      const uploadPromise = new Promise((resolve) => {
        resolveUpload = resolve;
      });

      vi.mocked(global.fetch).mockReturnValueOnce(uploadPromise as any);

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Upload file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Should show uploading state
      await waitFor(() => {
        expect(screen.getByText(/uploading/i)).toBeInTheDocument();
      });

      // Resolve the upload
      resolveUpload!({
        ok: true,
        json: async () => ({ id: mockWine.id, imageUrl: 'test.jpg' }),
      });
    });

    it('should display error message when upload fails', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test-image-content'], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'File too large' }),
      } as Response);

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Upload file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/file too large/i)).toBeInTheDocument();
      });

      // Should not call onUpdate
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test-image-content'], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Upload file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should clear file input after successful upload', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test-image-content'], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: mockWine.id, imageUrl: 'test.jpg' }),
      } as Response);

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Upload file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Wait for upload to complete
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });

      // File input should be cleared
      expect(fileInput.value).toBe('');
    });

    it('should do nothing if no file is selected', async () => {
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

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Trigger change event with no file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.click(fileInput);
      // Simulate cancel (no file selected)

      // Should not call fetch
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Image Delete Functionality', () => {
    it('should show confirmation dialog when delete is clicked', async () => {
      const user = userEvent.setup();
      const wineWithImage = { ...mockWine, imageUrl: 'test-wine-123.jpg' };

      render(
        <WineDetailModal
          wine={wineWithImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete.*image/i });
      await user.click(deleteButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/delete this image/i)).toBeInTheDocument();
      });
    });

    it('should successfully delete image when confirmed', async () => {
      const user = userEvent.setup();
      const wineWithImage = { ...mockWine, imageUrl: 'test-wine-123.jpg' };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as Response);

      render(
        <WineDetailModal
          wine={wineWithImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete.*image/i });
      await user.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText(/delete this image/i)).toBeInTheDocument();
      });

      // Find and click the confirm button within the dialog
      const confirmButtons = screen.getAllByRole('button');
      const confirmButton = confirmButtons.find(
        (btn) =>
          btn.textContent?.toLowerCase().includes('delete') && !(btn as HTMLButtonElement).disabled
      );
      expect(confirmButton).toBeInTheDocument();
      await user.click(confirmButton!);

      // Should call DELETE endpoint
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/api/wines/${mockWine.id}/image`),
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });

      // Should call onUpdate with null imageUrl
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(mockWine.id, { imageUrl: null });
      });
    });

    it('should cancel delete when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const wineWithImage = { ...mockWine, imageUrl: 'test-wine-123.jpg' };

      render(
        <WineDetailModal
          wine={wineWithImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete.*image/i });
      await user.click(deleteButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/delete this image/i)).toBeInTheDocument();
      });

      // Click cancel (find all cancel buttons and click the last one which is in the confirmation dialog)
      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
      await user.click(cancelButtons[cancelButtons.length - 1]);

      // Should close dialog
      await waitFor(() => {
        expect(screen.queryByText(/delete this image/i)).not.toBeInTheDocument();
      });

      // Should not call DELETE endpoint
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should show error message when delete fails', async () => {
      const user = userEvent.setup();
      const wineWithImage = { ...mockWine, imageUrl: 'test-wine-123.jpg' };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Image not found' }),
      } as Response);

      render(
        <WineDetailModal
          wine={wineWithImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete.*image/i });
      await user.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText(/delete this image/i)).toBeInTheDocument();
      });

      const confirmButtons = screen.getAllByRole('button');
      const confirmButton = confirmButtons.find(
        (btn) =>
          btn.textContent?.toLowerCase().includes('delete') && !(btn as HTMLButtonElement).disabled
      );
      await user.click(confirmButton!);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/image not found/i)).toBeInTheDocument();
      });

      // Should not call onUpdate
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('should disable delete button while deleting', async () => {
      const user = userEvent.setup();
      const wineWithImage = { ...mockWine, imageUrl: 'test-wine-123.jpg' };

      let resolveDelete: (value: any) => void;
      const deletePromise = new Promise((resolve) => {
        resolveDelete = resolve;
      });

      vi.mocked(global.fetch).mockReturnValueOnce(deletePromise as any);

      render(
        <WineDetailModal
          wine={wineWithImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete.*image/i });
      await user.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText(/delete this image/i)).toBeInTheDocument();
      });

      const confirmButtons = screen.getAllByRole('button');
      const confirmButton = confirmButtons.find(
        (btn) =>
          btn.textContent?.toLowerCase().includes('delete') && !(btn as HTMLButtonElement).disabled
      );
      await user.click(confirmButton!);

      // Button should be disabled during deletion
      await waitFor(() => {
        expect(confirmButton).toBeDisabled();
      });

      // Resolve the delete
      resolveDelete!({ ok: true, status: 204 });
    });
  });

  describe('Image Display', () => {
    it('should display image when imageUrl is present', () => {
      const wineWithImage = { ...mockWine, imageUrl: 'test-wine-123.jpg' };

      render(
        <WineDetailModal
          wine={wineWithImage}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Should show image using API endpoint
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        'src',
        expect.stringContaining('/api/wines/test-wine-123/image')
      );
    });

    it('should show placeholder when no image exists', () => {
      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Should show placeholder text
      expect(screen.getByText(/image not available/i)).toBeInTheDocument();
    });

    it('should update displayed image after successful upload', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test-image-content'], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: mockWine.id, imageUrl: 'new-image.jpg' }),
      } as Response);

      render(
        <WineDetailModal
          wine={mockWine}
          mode="view"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      // Upload file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Wait for upload to complete and image to display (uses API endpoint, timestamp changes)
      await waitFor(() => {
        const image = screen.getByRole('img');
        expect(image).toHaveAttribute(
          'src',
          expect.stringContaining('/api/wines/test-wine-123/image')
        );
      });
    });
  });
});
