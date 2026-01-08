'use client';

import { useState, useEffect, useRef } from 'react';

interface Wine {
  id: string;
  name: string;
  vintage: number;
  producer: string;
  region: string | null;
  country: string;
  grapeVariety: string | null;
  blendDetail: string | null;
  color: string;
  quantity: number;
  purchasePrice: number | null;
  purchaseDate: string | null;
  drinkByDate: string | null;
  rating: number | null;
  notes: string | null;
  imageUrl: string | null;
}

interface WineDetailModalProps {
  wine: Wine | null;
  mode?: 'view' | 'add'; // 'view' for viewing existing wine, 'add' for creating new wine
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Wine>) => Promise<void>;
  onCreate?: (data: Omit<Wine, 'id'>) => Promise<Wine>;
  onDelete?: (id: string) => void;
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

const formatPrice = (price: number | null): string => {
  if (price === null || price === undefined) return '—';
  return `$${price.toFixed(2)}`;
};

const StarRating = ({ rating }: { rating: number | null }): React.JSX.Element => {
  if (!rating) return <span style={{ color: '#7C2D3C' }}>Not rated</span>;

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.3 && rating % 1 < 0.8;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '2px', fontSize: '18px', color: '#FFD700' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) {
            return <span key={star}>★</span>;
          } else if (star === fullStars + 1 && hasHalfStar) {
            return (
              <span key={star} style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{ color: '#D3D3D3' }}>★</span>
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    overflow: 'hidden',
                    width: '50%',
                    color: '#FFD700',
                  }}
                >
                  ★
                </span>
              </span>
            );
          } else {
            return (
              <span key={star} style={{ color: '#D3D3D3' }}>
                ★
              </span>
            );
          }
        })}
      </div>
      <span style={{ color: '#4A1C26', fontSize: '14px', fontWeight: '500' }}>
        ({rating.toFixed(1)})
      </span>
    </div>
  );
};

export default function WineDetailModal({
  wine,
  mode = 'view',
  onClose,
  onUpdate,
  onCreate,
  onDelete,
}: WineDetailModalProps): React.JSX.Element | null {
  const [isEditMode, setIsEditMode] = useState(mode === 'add');
  const [editForm, setEditForm] = useState<Partial<Wine>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(wine?.imageUrl || null);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [stagedImageFile, setStagedImageFile] = useState<File | null>(null);
  const [stagedImagePreview, setStagedImagePreview] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update currentImageUrl when wine prop changes
  useEffect(() => {
    setCurrentImageUrl(wine?.imageUrl || null);
  }, [wine?.imageUrl]);

  // Initialize form with default values for add mode
  useEffect(() => {
    if (mode === 'add') {
      setEditForm({
        name: '',
        vintage: new Date().getFullYear(),
        producer: '',
        region: null,
        country: '',
        grapeVariety: null,
        blendDetail: null,
        color: 'RED',
        quantity: 1,
        purchasePrice: null,
        purchaseDate: null,
        drinkByDate: null,
        rating: null,
        notes: null,
        imageUrl: null,
      });
    } else if (wine) {
      setEditForm(wine);
    }
  }, [mode, wine]);

  // Auto-focus the name field when entering edit mode, or close button in view mode
  useEffect(() => {
    if (isEditMode && nameInputRef.current) {
      nameInputRef.current.focus();
    } else if (!isEditMode && mode === 'view' && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isEditMode, mode]);

  if (mode === 'view' && !wine) return null;

  const handleEditClick = (): void => {
    if (wine) {
      setEditForm(wine);
    }
    setErrors({});
    setIsEditMode(true);
  };

  const handleCancelEdit = (): void => {
    if (mode === 'add') {
      // For add mode, just close the modal
      onClose();
    } else {
      // For edit mode, check for unsaved changes then close the modal
      const hasChanges = JSON.stringify(editForm) !== JSON.stringify(wine);
      if (hasChanges) {
        // eslint-disable-next-line no-alert
        if (!window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
          return;
        }
      }
      // Close the modal instead of returning to view mode
      onClose();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editForm.name || editForm.name.trim().length === 0) {
      newErrors.name = 'Name is required';
    } else if (editForm.name.length > 200) {
      newErrors.name = 'Name must be less than 200 characters';
    }

    if (!editForm.vintage) {
      newErrors.vintage = 'Vintage is required';
    } else if (editForm.vintage < 1900 || editForm.vintage > new Date().getFullYear()) {
      newErrors.vintage = `Vintage must be between 1900 and ${new Date().getFullYear()}`;
    }

    if (!editForm.producer || editForm.producer.trim().length === 0) {
      newErrors.producer = 'Producer is required';
    } else if (editForm.producer.length > 200) {
      newErrors.producer = 'Producer must be less than 200 characters';
    }

    if (editForm.region && editForm.region.length > 200) {
      newErrors.region = 'Region must be less than 200 characters';
    }

    if (!editForm.country || editForm.country.trim().length === 0) {
      newErrors.country = 'Country is required';
    } else if (editForm.country.length > 100) {
      newErrors.country = 'Country must be less than 100 characters';
    }

    if (editForm.grapeVariety && editForm.grapeVariety.length > 200) {
      newErrors.grapeVariety = 'Grape variety must be less than 200 characters';
    }

    if (!editForm.color) {
      newErrors.color = 'Wine type is required';
    }

    if (editForm.quantity === undefined || editForm.quantity === null) {
      newErrors.quantity = 'Quantity is required';
    } else if (editForm.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    if (editForm.purchasePrice !== null && editForm.purchasePrice !== undefined) {
      if (editForm.purchasePrice <= 0) {
        newErrors.purchasePrice = 'Purchase price must be positive';
      } else if (Math.round(editForm.purchasePrice * 100) / 100 !== editForm.purchasePrice) {
        newErrors.purchasePrice = 'Purchase price must have at most 2 decimal places';
      }
    }

    // Validate purchase date - check both the stored value and the DOM input validity
    if (editForm.purchaseDate) {
      const purchaseDate = new Date(editForm.purchaseDate);
      if (isNaN(purchaseDate.getTime())) {
        newErrors.purchaseDate = 'Invalid date';
      }
    }
    // Also check if there's a browser validation error on the purchase date input
    const purchaseDateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    if (purchaseDateInput && !purchaseDateInput.validity.valid) {
      newErrors.purchaseDate = 'Please enter a valid date';
    }

    // Validate drink by date - check both the stored value and the DOM input validity
    if (editForm.drinkByDate) {
      const drinkByDate = new Date(editForm.drinkByDate);
      if (isNaN(drinkByDate.getTime())) {
        newErrors.drinkByDate = 'Invalid date';
      }
    }
    // Also check if there's a browser validation error on the drink by date input
    const drinkByDateInput = document.querySelectorAll('input[type="date"]')[1] as HTMLInputElement;
    if (drinkByDateInput && !drinkByDateInput.validity.valid) {
      newErrors.drinkByDate = 'Please enter a valid date';
    }

    if (editForm.rating !== null && editForm.rating !== undefined) {
      if (editForm.rating < 1 || editForm.rating > 5) {
        newErrors.rating = 'Rating must be between 1.0 and 5.0';
      } else if (Math.round(editForm.rating * 10) / 10 !== editForm.rating) {
        newErrors.rating = 'Rating must be in 0.1 increments (e.g., 3.1, 4.5)';
      }
    }

    if (editForm.notes && editForm.notes.length > 2000) {
      newErrors.notes = 'Notes must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      if (mode === 'add') {
        // Create new wine
        if (!onCreate) {
          throw new Error('onCreate handler is required for add mode');
        }
        const createdWine = await onCreate(editForm as Omit<Wine, 'id'>);

        // If there's a staged image, upload it to the newly created wine
        if (stagedImageFile) {
          setIsUploadingImage(true);
          try {
            const formData = new FormData();
            formData.append('image', stagedImageFile);

            const response = await fetch(`/api/wines/${createdWine.id}/image`, {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Failed to upload image');
            }

            // Image uploaded successfully - notify parent to refresh the wine list
            const updatedWine = await response.json();
            await onUpdate(createdWine.id, { imageUrl: updatedWine.imageUrl });
          } catch (imageError) {
            console.error('Error uploading image:', imageError);
            // Don't fail the whole operation if image upload fails
            // The wine was created successfully
            setErrors({
              _general: 'Wine created, but image upload failed. You can add the image later.',
            });
            // Give user time to see the error
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } finally {
            setIsUploadingImage(false);
            // Clean up the staged image
            if (stagedImagePreview) {
              URL.revokeObjectURL(stagedImagePreview);
            }
            setStagedImageFile(null);
            setStagedImagePreview(null);
          }
        }

        onClose(); // Close modal after successful creation
      } else {
        // Update existing wine
        if (!wine) {
          throw new Error('Wine is required for update mode');
        }
        await onUpdate(wine.id, editForm);
        onClose(); // Close modal after successful update
      }
    } catch (error) {
      console.error('❌ Error in handleSave:', error);
      setErrors({
        _general:
          mode === 'add'
            ? 'Failed to add wine. Please try again.'
            : 'Failed to update wine. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset error state
    setUploadError(null);

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`File size ${Math.round(file.size / 1024 / 1024)}MB exceeds maximum 5MB`);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    // If in add mode, stage the image for later upload
    if (mode === 'add') {
      setStagedImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setStagedImagePreview(previewUrl);
      return;
    }

    // If in edit mode with existing wine, upload immediately
    if (!wine) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/wines/${wine.id}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const updatedWine = await response.json();

      // Update the wine in the parent component (this will refresh the wine list)
      await onUpdate(wine.id, { imageUrl: updatedWine.imageUrl });

      // Update local state to show the new image immediately
      setCurrentImageUrl(updatedWine.imageUrl);
      setImageTimestamp(Date.now()); // Force image refresh
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageDelete = async (): Promise<void> => {
    // If in add mode, just clear the staged image
    if (mode === 'add') {
      if (stagedImagePreview) {
        URL.revokeObjectURL(stagedImagePreview);
      }
      setStagedImageFile(null);
      setStagedImagePreview(null);
      setShowDeleteConfirm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // If in edit mode, delete from server
    if (!wine || !currentImageUrl) return;

    setIsDeletingImage(true);
    setUploadError(null);

    try {
      const response = await fetch(`/api/wines/${wine.id}/image`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete image');
      }

      // Update the wine in the parent component (this will refresh the wine list)
      await onUpdate(wine.id, { imageUrl: null });

      // Update local state to show placeholder immediately
      setCurrentImageUrl(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting image:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to delete image');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeletingImage(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '8px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - only show for view mode (not edit/add mode) */}
        {mode === 'view' && wine && !isEditMode && (
          <div style={{ marginBottom: '24px' }}>
            <h2
              style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#4A1C26' }}
            >
              {wine.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '16px', color: '#7C2D3C' }}>
                {wine.vintage} · {wine.producer} ·
              </span>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  backgroundColor: '#F5F1E8',
                  color: '#7C2D3C',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {wine.color}
              </span>
            </div>
          </div>
        )}

        {/* Read-Only View - only for view mode */}
        {!isEditMode && mode === 'view' && wine && (
          <div>
            {/* Main content flex container */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
              {/* Left side - Wine Details */}
              <div style={{ flex: 1 }}>
                {/* Details Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px 24px',
                    marginBottom: '24px',
                  }}
                >
                  {/* Region */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#7C2D3C',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Region
                    </label>
                    <p style={{ margin: 0, fontSize: '16px', color: '#4A1C26' }}>
                      {wine.region || '—'}
                    </p>
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#7C2D3C',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Country
                    </label>
                    <p style={{ margin: 0, fontSize: '16px', color: '#4A1C26' }}>{wine.country}</p>
                  </div>

                  {/* Grape Variety */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#7C2D3C',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Grape Variety
                    </label>
                    <p style={{ margin: 0, fontSize: '16px', color: '#4A1C26' }}>
                      {wine.grapeVariety || '—'}
                    </p>
                  </div>

                  {/* Blend Details */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#7C2D3C',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Blend Details
                    </label>
                    <p style={{ margin: 0, fontSize: '16px', color: '#4A1C26' }}>
                      {wine.blendDetail || '—'}
                    </p>
                  </div>

                  {/* Rating */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#7C2D3C',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Rating
                    </label>
                    <StarRating rating={wine.rating} />
                  </div>

                  {/* Currently in Cellar */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#7C2D3C',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Currently in Cellar?
                    </label>
                    <p style={{ margin: 0, fontSize: '16px', color: '#4A1C26' }}>
                      {wine.quantity === 0
                        ? 'No'
                        : `Yes - ${wine.quantity} ${wine.quantity === 1 ? 'bottle' : 'bottles'}`}
                    </p>
                  </div>

                  {/* Purchase Price */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#7C2D3C',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Purchase Price
                    </label>
                    <p style={{ margin: 0, fontSize: '16px', color: '#4A1C26' }}>
                      {formatPrice(wine.purchasePrice)}
                    </p>
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#7C2D3C',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Purchase Date
                    </label>
                    <p style={{ margin: 0, fontSize: '16px', color: '#4A1C26' }}>
                      {formatDate(wine.purchaseDate)}
                    </p>
                  </div>

                  {/* Tasting Notes - Full Width spanning both columns */}
                  {wine.notes && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#7C2D3C',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Tasting Notes
                      </label>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '16px',
                          color: '#4A1C26',
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.5',
                        }}
                      >
                        {wine.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Wine Label Image */}
              <div style={{ flexShrink: 0, width: '300px' }}>
                {currentImageUrl ? (
                  <img
                    src={`/api/wines/${wine.id}/image?t=${imageTimestamp}`}
                    alt={`${wine.name} label`}
                    style={{
                      width: '100%',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                    loading="lazy"
                    onError={(e) => {
                      // If image fails to load, show placeholder
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.nextElementSibling as HTMLElement;
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: currentImageUrl ? 'none' : 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                  }}
                >
                  <div style={{ fontSize: '80px', color: '#D4A5A5' }}>🍷</div>
                  <div style={{ fontSize: '14px', color: '#7C2D3C', marginTop: '12px' }}>
                    Image not available
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
              {/* Delete button on the left */}
              {onDelete && wine && (
                <button
                  onClick={() => {
                    if (wine) {
                      onClose(); // Close the detail modal first
                      onDelete(wine.id); // Then show the delete confirmation modal
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: '#C73E3A',
                    border: '1px solid #C73E3A',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEE';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Delete Wine
                </button>
              )}

              {/* Close and Edit buttons on the right */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: '#7C2D3C',
                    border: '1px solid #7C2D3C',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F1E8';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Close
                </button>
                <button
                  onClick={handleEditClick}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#7C2D3C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(124, 45, 60, 0.2)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#5f2330';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#7C2D3C';
                  }}
                >
                  Edit Wine
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Mode / Add Mode */}
        {isEditMode && (
          <div>
            {/* Header with Action Buttons */}
            <div
              style={{
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#4A1C26' }}>
                  {mode === 'add' ? 'Add New Wine' : 'Edit Wine'}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#7C2D3C' }}>
                  {mode === 'add' ? 'Add a new wine to your collection' : 'Update wine details'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: '#7C2D3C',
                    border: '1px solid #7C2D3C',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    opacity: isSaving ? 0.5 : 1,
                  }}
                  onMouseOver={(e) => {
                    if (!isSaving) e.currentTarget.style.backgroundColor = '#F5F1E8';
                  }}
                  onMouseOut={(e) => {
                    if (!isSaving) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: isSaving ? '#9a4a59' : '#7C2D3C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(124, 45, 60, 0.2)',
                  }}
                  onMouseOver={(e) => {
                    if (!isSaving) e.currentTarget.style.backgroundColor = '#5f2330';
                  }}
                  onMouseOut={(e) => {
                    if (!isSaving) e.currentTarget.style.backgroundColor = '#7C2D3C';
                  }}
                >
                  {isSaving
                    ? mode === 'add'
                      ? 'Adding...'
                      : 'Saving...'
                    : mode === 'add'
                      ? 'Add Wine'
                      : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* General Error */}
            {errors._general && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#FEE',
                  border: '1px solid #C73E3A',
                  borderRadius: '4px',
                  marginBottom: '16px',
                  color: '#C73E3A',
                  fontSize: '14px',
                }}
              >
                {errors._general}
              </div>
            )}

            {/* Main content flex container */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
              {/* Left side - Edit Form */}
              <div style={{ flex: 1 }}>
                {/* Edit Form Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px 24px',
                    marginBottom: '24px',
                  }}
                >
                  {/* Name */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4A1C26',
                      }}
                    >
                      Wine Name *
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        border: `1px solid ${errors.name ? '#C73E3A' : '#D4A5A5'}`,
                        borderRadius: '4px',
                        width: '100%',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.name && (
                      <span style={{ fontSize: '12px', color: '#C73E3A', marginTop: '2px' }}>
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Vintage */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4A1C26',
                      }}
                    >
                      Vintage *
                    </label>
                    <input
                      type="number"
                      value={editForm.vintage || ''}
                      onChange={(e) =>
                        setEditForm({ ...editForm, vintage: parseInt(e.target.value) || 0 })
                      }
                      min={1900}
                      max={new Date().getFullYear()}
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        border: `1px solid ${errors.vintage ? '#C73E3A' : '#D4A5A5'}`,
                        borderRadius: '4px',
                        width: '100%',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.vintage && (
                      <span style={{ fontSize: '12px', color: '#C73E3A', marginTop: '2px' }}>
                        {errors.vintage}
                      </span>
                    )}
                  </div>

                  {/* Producer */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4A1C26',
                      }}
                    >
                      Producer *
                    </label>
                    <input
                      type="text"
                      value={editForm.producer || ''}
                      onChange={(e) => setEditForm({ ...editForm, producer: e.target.value })}
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        border: `1px solid ${errors.producer ? '#C73E3A' : '#D4A5A5'}`,
                        borderRadius: '4px',
                        width: '100%',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.producer && (
                      <span style={{ fontSize: '12px', color: '#C73E3A', marginTop: '2px' }}>
                        {errors.producer}
                      </span>
                    )}
                  </div>

                  {/* Region */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4A1C26',
                      }}
                    >
                      Region
                    </label>
                    <input
                      type="text"
                      value={editForm.region || ''}
                      onChange={(e) => setEditForm({ ...editForm, region: e.target.value || null })}
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        border: `1px solid ${errors.region ? '#C73E3A' : '#D4A5A5'}`,
                        borderRadius: '4px',
                        width: '100%',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.region && (
                      <span style={{ fontSize: '12px', color: '#C73E3A', marginTop: '2px' }}>
                        {errors.region}
                      </span>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4A1C26',
                      }}
                    >
                      Country *
                    </label>
                    <input
                      type="text"
                      value={editForm.country || ''}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        border: `1px solid ${errors.country ? '#C73E3A' : '#D4A5A5'}`,
                        borderRadius: '4px',
                        width: '100%',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.country && (
                      <span style={{ fontSize: '12px', color: '#C73E3A', marginTop: '2px' }}>
                        {errors.country}
                      </span>
                    )}
                  </div>

                  {/* Grape Variety */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4A1C26',
                      }}
                    >
                      Grape Variety
                    </label>
                    <input
                      type="text"
                      value={editForm.grapeVariety || ''}
                      onChange={(e) =>
                        setEditForm({ ...editForm, grapeVariety: e.target.value || null })
                      }
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        border: `1px solid ${errors.grapeVariety ? '#C73E3A' : '#D4A5A5'}`,
                        borderRadius: '4px',
                        width: '100%',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.grapeVariety && (
                      <span style={{ fontSize: '12px', color: '#C73E3A', marginTop: '2px' }}>
                        {errors.grapeVariety}
                      </span>
                    )}
                  </div>

                  {/* Blend Details */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4A1C26',
                      }}
                    >
                      Blend Details
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Cabernet Sauvignon 60%, Merlot 30%, Cabernet Franc 10%"
                      value={editForm.blendDetail || ''}
                      onChange={(e) =>
                        setEditForm({ ...editForm, blendDetail: e.target.value || null })
                      }
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        border: `1px solid ${errors.blendDetail ? '#C73E3A' : '#D4A5A5'}`,
                        borderRadius: '4px',
                        width: '100%',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.blendDetail && (
                      <span style={{ fontSize: '12px', color: '#C73E3A', marginTop: '2px' }}>
                        {errors.blendDetail}
                      </span>
                    )}
                  </div>

                  {/* Wine Type */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4A1C26',
                      }}
                    >
                      Wine Type *
                    </label>
                    <select
                      value={editForm.color || ''}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        border: `1px solid ${errors.color ? '#C73E3A' : '#D4A5A5'}`,
                        borderRadius: '4px',
                        width: '100%',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="RED">Red</option>
                      <option value="WHITE">White</option>
                      <option value="ROSE">Rosé</option>
                      <option value="SPARKLING">Sparkling</option>
                      <option value="DESSERT">Dessert</option>
                      <option value="FORTIFIED">Fortified</option>
                    </select>
                    {errors.color && (
                      <span style={{ fontSize: '12px', color: '#C73E3A', marginTop: '2px' }}>
                        {errors.color}
                      </span>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4A1C26',
                      }}
                    >
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={editForm.quantity ?? ''}
                      onChange={(e) =>
                        setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })
                      }
                      min={0}
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        border: `1px solid ${errors.quantity ? '#C73E3A' : '#D4A5A5'}`,
                        borderRadius: '4px',
                        width: '100%',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.quantity && (
                      <span style={{ fontSize: '12px', color: '#C73E3A', marginTop: '2px' }}>
                        {errors.quantity}
                      </span>
                    )}
                  </div>

                  {/* Purchase Price */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4A1C26',
                      }}
                    >
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.purchasePrice ?? ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          purchasePrice: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        border: `1px solid ${errors.purchasePrice ? '#C73E3A' : '#D4A5A5'}`,
                        borderRadius: '4px',
                        width: '100%',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.purchasePrice && (
                      <span style={{ fontSize: '12px', color: '#C73E3A', marginTop: '2px' }}>
                        {errors.purchasePrice}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4A1C26',
                      }}
                    >
                      Rating (1.0 - 5.0)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={editForm.rating ?? ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          rating: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                      placeholder="e.g., 3.6"
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        border: `1px solid ${errors.rating ? '#C73E3A' : '#D4A5A5'}`,
                        borderRadius: '4px',
                        width: '100%',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.rating && (
                      <span style={{ fontSize: '12px', color: '#C73E3A', marginTop: '2px' }}>
                        {errors.rating}
                      </span>
                    )}
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '4px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#4A1C26',
                      }}
                    >
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={
                        editForm.purchaseDate
                          ? (() => {
                              try {
                                return new Date(editForm.purchaseDate).toISOString().split('T')[0];
                              } catch {
                                return '';
                              }
                            })()
                          : ''
                      }
                      onChange={(e) => {
                        // Only update if we have a valid value or user explicitly cleared it
                        const inputValue = e.target.value;

                        if (inputValue === '') {
                          // User cleared the field - set to null
                          setEditForm({ ...editForm, purchaseDate: null });
                        } else {
                          // Try to parse the date
                          const date = new Date(inputValue);
                          if (!isNaN(date.getTime())) {
                            setEditForm({
                              ...editForm,
                              purchaseDate: date.toISOString(),
                            });
                          }
                          // If invalid, don't update state (keep existing value)
                        }
                      }}
                      onBlur={(e) => {
                        // When user leaves the field, validate what's in the input
                        if (e.target.validity && !e.target.validity.valid) {
                          // Browser detected invalid date - show error
                          setErrors((prev) => ({
                            ...prev,
                            purchaseDate: 'Please enter a valid date',
                          }));
                        } else {
                          // Clear the error if it was previously set
                          setErrors((prev) => {
                            const { purchaseDate: _removed, ...remainingErrors } = prev;
                            return remainingErrors;
                          });
                        }
                      }}
                      onInvalid={(e) => {
                        // Also catch invalid events (when user tries to submit with invalid date)
                        e.preventDefault();
                        setErrors((prev) => ({
                          ...prev,
                          purchaseDate: 'Please enter a valid date',
                        }));
                      }}
                      style={{
                        padding: '10px',
                        fontSize: '16px',
                        border: `1px solid ${errors.purchaseDate ? '#C73E3A' : '#D4A5A5'}`,
                        borderRadius: '4px',
                        width: '100%',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.purchaseDate && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#C73E3A',
                          marginTop: '2px',
                          display: 'block',
                        }}
                      >
                        {errors.purchaseDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side - Wine Label Image with Upload/Delete */}
              {(wine || mode === 'add') && (
                <div style={{ flexShrink: 0, width: '300px' }}>
                  {/* Image Display */}
                  {mode === 'add' && stagedImagePreview ? (
                    // Show staged image preview in add mode
                    <div style={{ position: 'relative' }}>
                      <img
                        src={stagedImagePreview}
                        alt="Wine label preview"
                        style={{
                          width: '100%',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                        loading="lazy"
                      />
                    </div>
                  ) : wine && currentImageUrl ? (
                    // Show existing image in edit mode
                    <div style={{ position: 'relative' }}>
                      <img
                        src={`/api/wines/${wine.id}/image?t=${imageTimestamp}`}
                        alt={`${wine.name} label`}
                        style={{
                          width: '100%',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                        loading="lazy"
                        onError={(e) => {
                          // If image fails to load, show placeholder
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                      <div
                        style={{
                          display: 'none',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '40px 20px',
                        }}
                      >
                        <div style={{ fontSize: '80px', color: '#D4A5A5' }}>🍷</div>
                        <div style={{ fontSize: '14px', color: '#7C2D3C', marginTop: '12px' }}>
                          Image not available
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Show placeholder when no image
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 20px',
                      }}
                    >
                      <div style={{ fontSize: '80px', color: '#D4A5A5' }}>🍷</div>
                      <div style={{ fontSize: '14px', color: '#7C2D3C', marginTop: '12px' }}>
                        No image
                      </div>
                    </div>
                  )}

                  {/* Upload/Delete Controls */}
                  <div
                    style={{
                      marginTop: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {/* Upload Error Message */}
                    {uploadError && (
                      <div
                        style={{
                          padding: '10px',
                          backgroundColor: '#FEE',
                          border: '1px solid #C73E3A',
                          borderRadius: '4px',
                          fontSize: '14px',
                          color: '#C73E3A',
                        }}
                      >
                        {uploadError}
                      </div>
                    )}

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />

                    {/* Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage || isDeletingImage}
                      style={{
                        padding: '10px 16px',
                        backgroundColor:
                          currentImageUrl || stagedImagePreview ? '#F5F1E8' : '#7C2D3C',
                        color: currentImageUrl || stagedImagePreview ? '#7C2D3C' : '#F5F1E8',
                        border: `1px solid ${currentImageUrl || stagedImagePreview ? '#D4A5A5' : '#7C2D3C'}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: isUploadingImage || isDeletingImage ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: isUploadingImage || isDeletingImage ? 0.6 : 1,
                      }}
                      onMouseOver={(e) => {
                        if (!isUploadingImage && !isDeletingImage) {
                          e.currentTarget.style.opacity = '0.8';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isUploadingImage && !isDeletingImage) {
                          e.currentTarget.style.opacity = '1';
                        }
                      }}
                    >
                      {isUploadingImage
                        ? 'Uploading...'
                        : currentImageUrl || stagedImagePreview
                          ? 'Replace Image'
                          : 'Upload Image'}
                    </button>

                    {/* Delete Button (only if image exists) */}
                    {(currentImageUrl || stagedImagePreview) && !showDeleteConfirm && (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isUploadingImage || isDeletingImage}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: 'transparent',
                          color: '#C73E3A',
                          border: '1px solid #C73E3A',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: isUploadingImage || isDeletingImage ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          opacity: isUploadingImage || isDeletingImage ? 0.6 : 1,
                        }}
                        onMouseOver={(e) => {
                          if (!isUploadingImage && !isDeletingImage) {
                            e.currentTarget.style.backgroundColor = '#FEE';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isUploadingImage && !isDeletingImage) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        Delete Image
                      </button>
                    )}

                    {/* Delete Confirmation */}
                    {showDeleteConfirm && (
                      <div
                        style={{
                          padding: '12px',
                          backgroundColor: '#FFF8F8',
                          border: '1px solid #C73E3A',
                          borderRadius: '6px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '14px',
                            color: '#4A1C26',
                            marginBottom: '12px',
                            fontWeight: '500',
                          }}
                        >
                          Delete this image?
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={handleImageDelete}
                            disabled={isDeletingImage}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              backgroundColor: '#C73E3A',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: isDeletingImage ? 'not-allowed' : 'pointer',
                              opacity: isDeletingImage ? 0.6 : 1,
                            }}
                          >
                            {isDeletingImage ? 'Deleting...' : 'Yes, Delete'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeletingImage}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              backgroundColor: '#F5F1E8',
                              color: '#7C2D3C',
                              border: '1px solid #D4A5A5',
                              borderRadius: '4px',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: isDeletingImage ? 'not-allowed' : 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Helper Text */}
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#7C2D3C',
                        textAlign: 'center',
                        lineHeight: '1.4',
                      }}
                    >
                      JPEG, PNG, or WebP • Max 5MB
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tasting Notes - Full Width Below */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#4A1C26',
                }}
              >
                Tasting Notes
              </label>
              <textarea
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value || null })}
                maxLength={2000}
                rows={4}
                style={{
                  padding: '10px',
                  fontSize: '16px',
                  border: `1px solid ${errors.notes ? '#C73E3A' : '#D4A5A5'}`,
                  borderRadius: '4px',
                  width: '100%',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '4px',
                }}
              >
                <span style={{ fontSize: '12px', color: '#7C2D3C' }}>
                  {editForm.notes?.length || 0} / 2000 characters
                </span>
                {errors.notes && (
                  <span style={{ fontSize: '12px', color: '#C73E3A' }}>{errors.notes}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
