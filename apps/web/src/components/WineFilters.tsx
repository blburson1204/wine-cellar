interface WineFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  selectedColors: string[];
  onColorsChange: (colors: string[]) => void;
  selectedGrapeVariety: string | null;
  onGrapeVarietyChange: (variety: string | null) => void;
  grapeVarieties: string[];
  selectedCountry: string | null;
  onCountryChange: (country: string | null) => void;
  countries: string[];
  showOnlyInCellar: boolean;
  onShowOnlyInCellarChange: (value: boolean) => void;
  showOnlyFavorites: boolean;
  onShowOnlyFavoritesChange: (value: boolean) => void;
  minRating: number | null;
  onMinRatingChange: (rating: number | null) => void;
  priceRange: [number, number] | null;
  onPriceRangeChange: (range: [number, number] | null) => void;
  priceMin: number;
  priceMax: number;
  onClearAll: () => void;
}

const WINE_COLORS = [
  { value: 'RED', label: 'Red', color: '#7C2D3C' },
  { value: 'WHITE', label: 'White', color: '#F5F1E8' },
  { value: 'ROSE', label: 'Rosé', color: '#D4A5A5' },
  { value: 'SPARKLING', label: 'Sparkling', color: '#FFD700' },
  { value: 'DESSERT', label: 'Dessert', color: '#8B4513' },
  { value: 'FORTIFIED', label: 'Fortified', color: '#4A1C26' },
];

export default function WineFilters({
  searchText,
  onSearchChange,
  selectedColors,
  onColorsChange,
  selectedGrapeVariety,
  onGrapeVarietyChange,
  grapeVarieties,
  selectedCountry,
  onCountryChange,
  countries,
  showOnlyInCellar,
  onShowOnlyInCellarChange,
  showOnlyFavorites,
  onShowOnlyFavoritesChange,
  minRating,
  onMinRatingChange,
  priceRange,
  onPriceRangeChange,
  priceMin,
  priceMax,
  onClearAll,
}: WineFiltersProps): React.JSX.Element {
  const handleColorToggle = (colorValue: string): void => {
    if (selectedColors.includes(colorValue)) {
      // Remove color from selection
      onColorsChange(selectedColors.filter((c) => c !== colorValue));
    } else {
      // Add color to selection
      onColorsChange([...selectedColors, colorValue]);
    }
  };

  const handlePriceMinChange = (value: number): void => {
    const max = priceRange?.[1] ?? priceMax;
    onPriceRangeChange([value, max]);
  };

  const handlePriceMaxChange = (value: number): void => {
    const min = priceRange?.[0] ?? priceMin;
    onPriceRangeChange([min, value]);
  };

  return (
    <>
      {/* Focus styles for accessibility */}
      <style>{`
        .wine-filters input:focus,
        .wine-filters select:focus {
          outline: 2px solid #7C2D3C;
          outline-offset: 1px;
        }
        .wine-filters button:focus-visible {
          outline: 2px solid #7C2D3C;
          outline-offset: 2px;
        }
        .wine-filters label:focus-within .checkbox-indicator {
          outline: 2px solid #7C2D3C;
          outline-offset: 2px;
        }
      `}</style>
      <div
        className="wine-filters"
        style={{
          backgroundColor: '#221a13',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#3d010b',
            color: 'rgba(255, 255, 255, 0.7)',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '700',
          }}
        >
          Filter Criteria
        </div>

        {/* Filter Content */}
        <div
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Search Input */}
          <div>
            <label
              htmlFor="search"
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.7)',
                backgroundColor: '#221a13',
              }}
            >
              Search (Name, Producer, Region)
            </label>
            <input
              id="search"
              type="text"
              placeholder="Name, producer, region..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                padding: '8px',
                fontSize: '14px',
                border: 'none',
                borderRadius: '4px',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                color: 'rgba(255, 255, 255, 0.7)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Wine Type */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.7)',
                backgroundColor: '#221a13',
              }}
            >
              Wine Type
            </label>
            <div
              style={{
                padding: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                borderRadius: '4px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
              }}
            >
              {WINE_COLORS.map((color) => {
                const isSelected = selectedColors.includes(color.value);
                return (
                  <label
                    key={color.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleColorToggle(color.value)}
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      className="checkbox-indicator"
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        border: isSelected ? '2px solid #7C2D3C' : '2px solid #d5ccc5',
                        backgroundColor: isSelected ? '#7C2D3C' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && (
                        <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                          ✓
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: '13px', color: '#d5ccc5' }}>{color.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Grape Variety & Country - Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label
                htmlFor="grape-variety"
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'rgba(255, 255, 255, 0.7)',
                  backgroundColor: '#221a13',
                }}
              >
                Grape
              </label>
              <select
                id="grape-variety"
                value={selectedGrapeVariety ?? ''}
                onChange={(e) => onGrapeVarietyChange(e.target.value || null)}
                style={{
                  padding: '8px',
                  fontSize: '13px',
                  border: 'none',
                  borderRadius: '4px',
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option
                  value=""
                  style={{ backgroundColor: '#443326', color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  All
                </option>
                {grapeVarieties.map((variety) => (
                  <option
                    key={variety}
                    value={variety}
                    style={{ backgroundColor: '#443326', color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {variety}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="country"
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'rgba(255, 255, 255, 0.7)',
                  backgroundColor: '#221a13',
                }}
              >
                Country
              </label>
              <select
                id="country"
                value={selectedCountry ?? ''}
                onChange={(e) => onCountryChange(e.target.value || null)}
                style={{
                  padding: '8px',
                  fontSize: '13px',
                  border: 'none',
                  borderRadius: '4px',
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option
                  value=""
                  style={{ backgroundColor: '#443326', color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  All
                </option>
                {countries.map((country) => (
                  <option
                    key={country}
                    value={country}
                    style={{ backgroundColor: '#443326', color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Show Wine & Rating (left) / Price Range (right) - Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Left column: Show Wine + Rating stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: '#221a13',
                  }}
                >
                  Show Wine
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '4px',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showOnlyInCellar}
                      onChange={(e) => onShowOnlyInCellarChange(e.target.checked)}
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      className="checkbox-indicator"
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        border: showOnlyInCellar ? '2px solid #7C2D3C' : '2px solid #d5ccc5',
                        backgroundColor: showOnlyInCellar ? '#7C2D3C' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {showOnlyInCellar && (
                        <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                          ✓
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: '13px', color: '#d5ccc5' }}>In Cellar</span>
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={showOnlyFavorites}
                      onChange={(e) => onShowOnlyFavoritesChange(e.target.checked)}
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />
                    <span
                      className="checkbox-indicator"
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        border: showOnlyFavorites ? '2px solid #7C2D3C' : '2px solid #d5ccc5',
                        backgroundColor: showOnlyFavorites ? '#7C2D3C' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {showOnlyFavorites && (
                        <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                          ✓
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: '13px', color: '#d5ccc5' }}>Favorites</span>
                  </label>
                </div>
              </div>
              <div>
                <label
                  htmlFor="min-rating"
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: '#221a13',
                  }}
                >
                  Rating
                </label>
                <select
                  id="min-rating"
                  value={minRating ?? ''}
                  onChange={(e) =>
                    onMinRatingChange(e.target.value ? parseFloat(e.target.value) : null)
                  }
                  style={{
                    padding: '8px',
                    fontSize: '13px',
                    border: 'none',
                    borderRadius: '4px',
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <option
                    value=""
                    style={{ backgroundColor: '#443326', color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    Any
                  </option>
                  <option
                    value="4.5"
                    style={{ backgroundColor: '#443326', color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    4.5+
                  </option>
                  <option
                    value="4"
                    style={{ backgroundColor: '#443326', color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    4.0+
                  </option>
                  <option
                    value="3.5"
                    style={{ backgroundColor: '#443326', color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    3.5+
                  </option>
                  <option
                    value="3"
                    style={{ backgroundColor: '#443326', color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    3.0+
                  </option>
                </select>
              </div>
            </div>

            {/* Right column: Price Range */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'rgba(255, 255, 255, 0.7)',
                  backgroundColor: '#221a13',
                }}
              >
                Price ($)
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: '4px',
                  height: '59px',
                  boxSizing: 'border-box',
                }}
              >
                <input
                  id="price-from"
                  type="number"
                  min={priceMin}
                  max={priceMax}
                  step="0.01"
                  placeholder="Min"
                  value={priceRange?.[0] ?? priceMin}
                  onChange={(e) => handlePriceMinChange(parseFloat(e.target.value) || priceMin)}
                  disabled={priceMin === priceMax}
                  aria-label="Minimum price"
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '13px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    boxSizing: 'border-box',
                    cursor: priceMin === priceMax ? 'not-allowed' : 'text',
                    minWidth: 0,
                  }}
                />
                <span style={{ fontSize: '13px', color: '#d5ccc5', flexShrink: 0 }}>to</span>
                <input
                  id="price-to"
                  type="number"
                  min={priceMin}
                  max={priceMax}
                  step="0.01"
                  placeholder="Max"
                  value={priceRange?.[1] ?? priceMax}
                  onChange={(e) => handlePriceMaxChange(parseFloat(e.target.value) || priceMax)}
                  disabled={priceMin === priceMax}
                  aria-label="Maximum price"
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '13px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    boxSizing: 'border-box',
                    cursor: priceMin === priceMax ? 'not-allowed' : 'text',
                    minWidth: 0,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Clear Button at Bottom */}
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <button
              type="button"
              onClick={onClearAll}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3d010b',
                color: 'rgba(255, 255, 255, 0.7)',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '700',
                transition: 'all 0.2s',
                width: '100%',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#5a0210';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#3d010b';
              }}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
