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
  it('has no accessibility violations with default filters', async () => {
    const { container } = render(<WineFilters {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with close button (mobile mode)', async () => {
    const { container } = render(
      <WineFilters {...defaultProps} showCloseButton={true} onClose={vi.fn()} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with active color filters', async () => {
    const { container } = render(
      <WineFilters {...defaultProps} selectedColors={['RED', 'WHITE']} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with all filter types applied', async () => {
    const { container } = render(
      <WineFilters
        {...defaultProps}
        searchText="Bordeaux"
        selectedColors={['RED']}
        selectedCountry="France"
        minRating={90}
        priceRange={[20, 100]}
        showOnlyFavorites={true}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with price range inputs', async () => {
    const { container } = render(<WineFilters {...defaultProps} priceRange={[50, 200]} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
