import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WineFilters from '../../components/WineFilters';

const defaultProps = {
  searchText: '',
  onSearchChange: vi.fn(),
  selectedColors: [],
  onColorsChange: vi.fn(),
  selectedGrapeVariety: null,
  onGrapeVarietyChange: vi.fn(),
  grapeVarieties: ['Cabernet Sauvignon', 'Merlot'],
  selectedCountry: null,
  onCountryChange: vi.fn(),
  countries: ['France', 'Italy'],
  showOnlyInCellar: false,
  onShowOnlyInCellarChange: vi.fn(),
  showOnlyFavorites: false,
  onShowOnlyFavoritesChange: vi.fn(),
  minRating: null,
  onMinRatingChange: vi.fn(),
  priceRange: null as [number, number] | null,
  onPriceRangeChange: vi.fn(),
  priceMin: 0,
  priceMax: 100,
  onClearAll: vi.fn(),
  onClose: vi.fn(),
  showCloseButton: true,
};

describe('WineFilters Touch Targets', () => {
  describe('FR-001: Close button 44x44px', () => {
    it('close button has minimum 44px width and height', () => {
      render(<WineFilters {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close filters');
      expect(closeButton).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    });
  });

  describe('FR-002: Checkbox hit areas 44px', () => {
    it('wine type checkbox labels have 44px minimum height', () => {
      const { container } = render(<WineFilters {...defaultProps} />);

      // Each checkbox label wrapping the hidden input + visual indicator
      const checkboxLabels = container.querySelectorAll('label input[type="checkbox"]');
      checkboxLabels.forEach((input) => {
        const label = input.closest('label') as HTMLElement;
        expect(label).toHaveStyle({ minHeight: '44px' });
      });
    });

    it('there are checkbox labels to test', () => {
      const { container } = render(<WineFilters {...defaultProps} />);

      const checkboxLabels = container.querySelectorAll('label input[type="checkbox"]');
      // At minimum: 6 wine colors + In Cellar + Favorites = 8
      expect(checkboxLabels.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('FR-003: Select dropdown minHeight 44px', () => {
    it('grape variety select has minHeight 44px', () => {
      render(<WineFilters {...defaultProps} />);

      const grapeSelect = screen.getByLabelText(/grape/i);
      expect(grapeSelect).toHaveStyle({ minHeight: '44px' });
    });

    it('country select has minHeight 44px', () => {
      render(<WineFilters {...defaultProps} />);

      const countrySelect = screen.getByLabelText(/country/i);
      expect(countrySelect).toHaveStyle({ minHeight: '44px' });
    });

    it('rating select has minHeight 44px', () => {
      render(<WineFilters {...defaultProps} />);

      const ratingSelect = screen.getByLabelText(/rating/i);
      expect(ratingSelect).toHaveStyle({ minHeight: '44px' });
    });
  });

  describe('FR-004: Price inputs minHeight 44px', () => {
    it('minimum price input has minHeight 44px', () => {
      render(<WineFilters {...defaultProps} />);

      const minPrice = screen.getByLabelText('Minimum price');
      expect(minPrice).toHaveStyle({ minHeight: '44px' });
    });

    it('maximum price input has minHeight 44px', () => {
      render(<WineFilters {...defaultProps} />);

      const maxPrice = screen.getByLabelText('Maximum price');
      expect(maxPrice).toHaveStyle({ minHeight: '44px' });
    });
  });

  describe('FR-005: Clear button minHeight 44px', () => {
    it('clear all filters button has minHeight 44px', () => {
      render(<WineFilters {...defaultProps} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearButton).toHaveStyle({ minHeight: '44px' });
    });
  });
});
