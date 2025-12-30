'use client';

import { useState, useEffect } from 'react';

interface Wine {
  id: string;
  name: string;
  vintage: number;
  producer: string;
  region: string | null;
  country: string;
  grapeVariety: string | null;
  color: string;
  quantity: number;
  purchasePrice: number | null;
  purchaseDate: string | null;
  drinkByDate: string | null;
  rating: number | null;
  notes: string | null;
}

interface WineDetailModalProps {
  wine: Wine | null;
  mode?: 'view' | 'add'; // 'view' for viewing existing wine, 'add' for creating new wine
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Wine>) => Promise<void>;
  onCreate?: (data: Omit<Wine, 'id'>) => Promise<void>;
  onDelete?: (id: string) => void;
}

const WINE_COLORS: Record<string, string> = {
  RED: '#7C2D3C',
  WHITE: '#F5F1E8',
  ROSE: '#D4A5A5',
  SPARKLING: '#FFD700',
  DESSERT: '#8B4513',
  FORTIFIED: '#4A1C26',
};

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
        color: 'RED',
        quantity: 1,
        purchasePrice: null,
        purchaseDate: null,
        drinkByDate: null,
        rating: null,
        notes: null,
      });
    } else if (wine) {
      setEditForm(wine);
    }
  }, [mode, wine]);

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
      // For edit mode, check for unsaved changes
      const hasChanges = JSON.stringify(editForm) !== JSON.stringify(wine);
      if (hasChanges) {
        // eslint-disable-next-line no-alert
        if (!window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
          return;
        }
      }
      setIsEditMode(false);
      setEditForm({});
      setErrors({});
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
        await onCreate(editForm as Omit<Wine, 'id'>);
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
          maxWidth: '600px',
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
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: WINE_COLORS[wine.color] || '#7C2D3C',
                  border: wine.color === 'WHITE' ? '1px solid #D4A5A5' : 'none',
                  flexShrink: 0,
                }}
              />
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#4A1C26' }}>
                {wine.name}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '16px', color: '#7C2D3C' }}>
              {wine.vintage} · {wine.producer}
            </p>
          </div>
        )}

        {/* Read-Only View - only for view mode */}
        {!isEditMode && mode === 'view' && wine && (
          <div>
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

              {/* Wine Type */}
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
                  Wine Type
                </label>
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

              {/* Quantity */}
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
                  Quantity
                </label>
                <p style={{ margin: 0, fontSize: '16px', color: '#4A1C26' }}>
                  {wine.quantity} {wine.quantity === 1 ? 'bottle' : 'bottles'}
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

              {/* Drink By Date */}
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
                  Drink By Date
                </label>
                <p style={{ margin: 0, fontSize: '16px', color: '#4A1C26' }}>
                  {formatDate(wine.drinkByDate)}
                </p>
              </div>
            </div>

            {/* Rating - Full Width */}
            <div style={{ marginBottom: '24px' }}>
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

            {/* Notes - Full Width */}
            {wine.notes && (
              <div style={{ marginBottom: '24px' }}>
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
                  Notes
                </label>
                <p
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    color: '#4A1C26',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {wine.notes}
                </p>
              </div>
            )}

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
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#4A1C26' }}>
                {mode === 'add' ? 'Add New Wine' : 'Edit Wine'}
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#7C2D3C' }}>
                {mode === 'add' ? 'Add a new wine to your collection' : 'Update wine details'}
              </p>
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
                      setErrors((prev) => ({ ...prev, purchaseDate: 'Please enter a valid date' }));
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
                    setErrors((prev) => ({ ...prev, purchaseDate: 'Please enter a valid date' }));
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

              {/* Drink By Date */}
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
                  Drink By Date
                </label>
                <input
                  type="date"
                  value={
                    editForm.drinkByDate
                      ? (() => {
                          try {
                            return new Date(editForm.drinkByDate).toISOString().split('T')[0];
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
                      setEditForm({ ...editForm, drinkByDate: null });
                    } else {
                      // Try to parse the date
                      const date = new Date(inputValue);
                      if (!isNaN(date.getTime())) {
                        setEditForm({
                          ...editForm,
                          drinkByDate: date.toISOString(),
                        });
                      }
                      // If invalid, don't update state (keep existing value)
                    }
                  }}
                  onBlur={(e) => {
                    // When user leaves the field, validate what's in the input
                    if (e.target.validity && !e.target.validity.valid) {
                      // Browser detected invalid date - show error
                      setErrors((prev) => ({ ...prev, drinkByDate: 'Please enter a valid date' }));
                    } else {
                      // Clear the error if it was previously set
                      setErrors((prev) => {
                        const { drinkByDate: _removed, ...remainingErrors } = prev;
                        return remainingErrors;
                      });
                    }
                  }}
                  onInvalid={(e) => {
                    // Also catch invalid events (when user tries to submit with invalid date)
                    e.preventDefault();
                    setErrors((prev) => ({ ...prev, drinkByDate: 'Please enter a valid date' }));
                  }}
                  style={{
                    padding: '10px',
                    fontSize: '16px',
                    border: `1px solid ${errors.drinkByDate ? '#C73E3A' : '#D4A5A5'}`,
                    borderRadius: '4px',
                    width: '100%',
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.drinkByDate && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#C73E3A',
                      marginTop: '2px',
                      display: 'block',
                    }}
                  >
                    {errors.drinkByDate}
                  </span>
                )}
              </div>
            </div>

            {/* Notes - Full Width */}
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
                Notes
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
        )}
      </div>
    </div>
  );
}
