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
    // Mock fetch to return empty arrays for meta endpoints (combobox options)
    // Use mockImplementation on existing mock instead of replacing it
    vi.mocked(global.fetch).mockImplementation((url: string | URL | Request) => {
      const urlString = url.toString();
      if (urlString.includes('/api/wines/meta/')) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        } as Response);
      }
      // Default: return empty object for other endpoints
      return Promise.resolve({ ok: true, json: async () => ({}) } as Response);
    });
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
      expect(screen.getByRole('button', { name: /replace/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
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

      // Set mock for image upload AFTER render (so meta endpoint calls are handled)
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

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

      // Set mock for image upload AFTER render
      vi.mocked(global.fetch).mockReturnValueOnce(uploadPromise as any);

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

      // Set mock for image upload AFTER render
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'File too large' }),
      } as Response);

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

      // Set mock for image upload AFTER render
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

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

      // Set mock for image upload AFTER render
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: mockWine.id, imageUrl: 'test.jpg' }),
      } as Response);

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

      // Should not call fetch for image endpoint (meta endpoints are called during mount)
      const imageCalls = vi
        .mocked(global.fetch)
        .mock.calls.filter((call) => String(call[0]).includes('/image'));
      expect(imageCalls).toHaveLength(0);
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
      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(deleteButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/delete this image/i)).toBeInTheDocument();
      });
    });

    it('should successfully delete image when confirmed', async () => {
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
      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText(/delete this image/i)).toBeInTheDocument();
      });

      // Set mock for image delete AFTER render and before confirm
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as Response);

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
      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(deleteButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/delete this image/i)).toBeInTheDocument();
      });

      // Click cancel in the delete confirmation dialog (it's the first Cancel button in the scrollable content)
      // The footer Cancel button comes after, so we click the first one
      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
      await user.click(cancelButtons[0]);

      // Should close dialog
      await waitFor(() => {
        expect(screen.queryByText(/delete this image/i)).not.toBeInTheDocument();
      });

      // Should not call DELETE endpoint (meta endpoints are called during mount)
      const imageCalls = vi
        .mocked(global.fetch)
        .mock.calls.filter((call) => String(call[0]).includes('/image'));
      expect(imageCalls).toHaveLength(0);
    });

    it('should show error message when delete fails', async () => {
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
      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText(/delete this image/i)).toBeInTheDocument();
      });

      // Set mock for image delete AFTER render
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Image not found' }),
      } as Response);

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
      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText(/delete this image/i)).toBeInTheDocument();
      });

      // Set mock for image delete AFTER render
      vi.mocked(global.fetch).mockReturnValueOnce(deletePromise as any);

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

      // Set mock for image upload AFTER render
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: mockWine.id, imageUrl: 'new-image.jpg' }),
      } as Response);

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

  describe('Image Upload in Add Mode', () => {
    const mockOnCreate = vi.fn();

    beforeEach(() => {
      mockOnCreate.mockClear();
    });

    it('should show image upload UI in add mode', () => {
      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      // Should show upload button in add mode
      const uploadButton = screen.getByRole('button', { name: /upload.*image/i });
      expect(uploadButton).toBeInTheDocument();

      // Should have file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput?.accept).toBe('image/jpeg,image/png,image/webp');
    });

    it('should stage image and show preview when file selected in add mode', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test-image-content'], 'test.jpg', { type: 'image/jpeg' });

      // Mock URL.createObjectURL
      const mockObjectUrl = 'blob:http://localhost/test-image-preview';
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockObjectUrl);

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      // Upload file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Should show preview image
      await waitFor(() => {
        const previewImg = document.querySelector(
          'img[alt="Wine label preview"]'
        ) as HTMLImageElement;
        expect(previewImg).toBeInTheDocument();
        expect(previewImg.src).toBe(mockObjectUrl);
      });

      // Should NOT call fetch for image upload (image is staged, not uploaded yet)
      // Meta endpoints are called during mount
      const imageCalls = vi
        .mocked(global.fetch)
        .mock.calls.filter((call) => String(call[0]).includes('/image'));
      expect(imageCalls).toHaveLength(0);

      createObjectURLSpy.mockRestore();
    });

    it('should allow replacing staged image before saving', async () => {
      const user = userEvent.setup();
      const mockFile1 = new File(['test-image-1'], 'test1.jpg', { type: 'image/jpeg' });
      const mockFile2 = new File(['test-image-2'], 'test2.jpg', { type: 'image/jpeg' });

      const mockObjectUrl1 = 'blob:http://localhost/test-image-1';
      const mockObjectUrl2 = 'blob:http://localhost/test-image-2';
      const createObjectURLSpy = vi
        .spyOn(URL, 'createObjectURL')
        .mockReturnValueOnce(mockObjectUrl1)
        .mockReturnValueOnce(mockObjectUrl2);
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      // Upload first file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile1);

      // Verify first image is shown
      await waitFor(() => {
        const previewImg = document.querySelector(
          'img[alt="Wine label preview"]'
        ) as HTMLImageElement;
        expect(previewImg).toBeInTheDocument();
        expect(previewImg.src).toBe(mockObjectUrl1);
      });

      // Should now show "Replace" button
      expect(screen.getByRole('button', { name: /replace/i })).toBeInTheDocument();

      // Upload second file (replace)
      await user.upload(fileInput, mockFile2);

      // Verify second image is shown
      await waitFor(() => {
        const previewImg = document.querySelector(
          'img[alt="Wine label preview"]'
        ) as HTMLImageElement;
        expect(previewImg.src).toBe(mockObjectUrl2);
      });

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('should allow deleting staged image before saving', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test-image-content'], 'test.jpg', { type: 'image/jpeg' });

      const mockObjectUrl = 'blob:http://localhost/test-image-preview';
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockObjectUrl);
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      // Upload file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Verify image is shown
      await waitFor(() => {
        const previewImg = document.querySelector(
          'img[alt="Wine label preview"]'
        ) as HTMLImageElement;
        expect(previewImg).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(deleteButton);

      // Should show confirmation
      await waitFor(() => {
        expect(screen.getByText(/delete this image/i)).toBeInTheDocument();
      });

      // Confirm delete
      const confirmButton = screen.getByRole('button', { name: /yes, delete/i });
      await user.click(confirmButton);

      // Image should be removed, placeholder should show
      await waitFor(() => {
        expect(screen.queryByAltText('Wine label preview')).not.toBeInTheDocument();
        expect(screen.getByText(/no image/i)).toBeInTheDocument();
      });

      // Should revoke the blob URL
      expect(revokeObjectURLSpy).toHaveBeenCalledWith(mockObjectUrl);

      // Should NOT call fetch for image endpoint (no server request for staged image)
      // Meta endpoints are called during mount
      const imageCalls = vi
        .mocked(global.fetch)
        .mock.calls.filter((call) => String(call[0]).includes('/image'));
      expect(imageCalls).toHaveLength(0);

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('should validate file size (5MB max) in add mode', async () => {
      const user = userEvent.setup();
      // Create a file that's larger than 5MB
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      // Upload large file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, largeFile);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/exceeds maximum 5mb/i)).toBeInTheDocument();
      });

      // Should NOT stage the image
      expect(screen.queryByAltText('Wine label preview')).not.toBeInTheDocument();
    });

    it('should validate file type (JPEG, PNG, WebP) in add mode', async () => {
      const invalidFile = new File(['test-content'], 'test.gif', { type: 'image/gif' });

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      // Get the file input and simulate a change event directly
      // (bypasses userEvent.upload which respects the accept attribute)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Create a custom event that simulates file selection
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      });

      // Dispatch change event
      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/please upload a jpeg, png, or webp image/i)).toBeInTheDocument();
      });

      // Should NOT stage the image
      expect(screen.queryByAltText('Wine label preview')).not.toBeInTheDocument();
    });

    it('should upload staged image after creating wine', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test-image-content'], 'test.jpg', { type: 'image/jpeg' });
      const createdWine = {
        id: 'new-wine-123',
        name: 'New Wine',
        vintage: 2020,
        producer: 'Test Producer',
        country: 'France',
        region: null,
        grapeVariety: null,
        blendDetail: null,
        color: 'RED',
        quantity: 0,
        purchasePrice: null,
        purchaseDate: null,
        drinkByDate: null,
        rating: null,
        notes: null,
        expertRatings: null,
        wherePurchased: null,
        wineLink: null,
        favorite: false,
        imageUrl: null,
      };

      // Mock onCreate to return the created wine
      mockOnCreate.mockResolvedValue(createdWine);

      const mockObjectUrl = 'blob:http://localhost/test-image-preview';
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockObjectUrl);
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      // Fill required fields
      const nameInput = screen.getByPlaceholderText('Enter wine name');
      const producerInput = screen.getByPlaceholderText('Enter producer');
      const countryInput = screen.getByPlaceholderText('Enter country');
      await user.type(nameInput, 'New Wine');
      await user.type(producerInput, 'Test Producer');
      await user.type(countryInput, 'France');

      // Stage an image
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Verify image is staged
      await waitFor(() => {
        expect(screen.getByAltText('Wine label preview')).toBeInTheDocument();
      });

      // Mock the image upload request AFTER render and before submit
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...createdWine, imageUrl: 'new-wine-123.jpg' }),
      } as Response);

      // Submit the form
      await user.click(screen.getByRole('button', { name: 'Add Wine' }));

      // Should call onCreate first
      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalled();
      });

      // Should then upload the image
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/wines/new-wine-123/image',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
          })
        );
      });

      // Should call onUpdate with the new imageUrl
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('new-wine-123', {
          imageUrl: 'new-wine-123.jpg',
        });
      });

      // Should clean up blob URL
      expect(revokeObjectURLSpy).toHaveBeenCalledWith(mockObjectUrl);

      // Should close the modal
      expect(mockOnClose).toHaveBeenCalled();

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('should handle image upload failure gracefully (wine still created)', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test-image-content'], 'test.jpg', { type: 'image/jpeg' });
      const createdWine = {
        id: 'new-wine-123',
        name: 'New Wine',
        vintage: 2020,
        producer: 'Test Producer',
        country: 'France',
        region: null,
        grapeVariety: null,
        blendDetail: null,
        color: 'RED',
        quantity: 0,
        purchasePrice: null,
        purchaseDate: null,
        drinkByDate: null,
        rating: null,
        notes: null,
        expertRatings: null,
        wherePurchased: null,
        wineLink: null,
        favorite: false,
        imageUrl: null,
      };

      // Mock onCreate to return the created wine
      mockOnCreate.mockResolvedValue(createdWine);

      const mockObjectUrl = 'blob:http://localhost/test-image-preview';
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockObjectUrl);
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      // Fill required fields
      const nameInput = screen.getByPlaceholderText('Enter wine name');
      const producerInput = screen.getByPlaceholderText('Enter producer');
      const countryInput = screen.getByPlaceholderText('Enter country');
      await user.type(nameInput, 'New Wine');
      await user.type(producerInput, 'Test Producer');
      await user.type(countryInput, 'France');

      // Stage an image
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Mock the image upload to fail AFTER render and before submit
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Upload failed' }),
      } as Response);

      // Submit the form
      await user.click(screen.getByRole('button', { name: 'Add Wine' }));

      // Wine should still be created
      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalled();
      });

      // Should show error message about image upload failure
      await waitFor(() => {
        expect(screen.getByText(/wine created, but image upload failed/i)).toBeInTheDocument();
      });

      // Should NOT call onUpdate since image upload failed
      expect(mockOnUpdate).not.toHaveBeenCalled();

      // Should eventually close the modal (after showing error)
      await waitFor(
        () => {
          expect(mockOnClose).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('should clear staged image when cancel is clicked', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test-image-content'], 'test.jpg', { type: 'image/jpeg' });

      const mockObjectUrl = 'blob:http://localhost/test-image-preview';
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockObjectUrl);

      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      // Stage an image
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Verify image is staged
      await waitFor(() => {
        expect(screen.getByAltText('Wine label preview')).toBeInTheDocument();
      });

      // Click cancel
      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      // Should close the modal
      expect(mockOnClose).toHaveBeenCalled();

      // Should NOT have uploaded anything (meta endpoints are called during mount)
      const imageCalls = vi
        .mocked(global.fetch)
        .mock.calls.filter((call) => String(call[0]).includes('/image'));
      expect(imageCalls).toHaveLength(0);

      createObjectURLSpy.mockRestore();
    });

    it('should accept valid file types from file input accept attribute', () => {
      render(
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onCreate={mockOnCreate}
        />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput.accept).toBe('image/jpeg,image/png,image/webp');
    });
  });
});
