import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import WineFilters from '../../components/WineFilters';

const defaultProps = {
  searchText: '',
  onSearchChange: vi.fn(),
  selectedColors: [],
  onColorsChange: vi.fn(),
  selectedGrapeVariety: null,
  onGrapeVarietyChange: vi.fn(),
  grapeVarieties: ['Cabernet Sauvignon', 'Merlot', 'Pinot Noir'],
  selectedCountry: null,
  onCountryChange: vi.fn(),
  countries: ['France', 'Italy', 'Spain'],
  showOnlyInCellar: false,
  onShowOnlyInCellarChange: vi.fn(),
  showOnlyFavorites: false,
  onShowOnlyFavoritesChange: vi.fn(),
  minRating: null,
  onMinRatingChange: vi.fn(),
  priceRange: null,
  onPriceRangeChange: vi.fn(),
  priceMin: 0,
  priceMax: 500,
  onClearAll: vi.fn(),
  showCloseButton: false,
};

describe('WineFilters Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<WineFilters {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
