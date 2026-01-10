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
    <div
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
            Search
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
              borderRadius: '6px',
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
                    padding: '0 6px',
                    height: '34px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleColorToggle(color.value)}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                      accentColor: 'rgba(255, 255, 255, 0.4)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {color.label}
                  </span>
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

        {/* In Cellar & Rating - Side by Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
              In Cellar
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 8px',
                height: '34px',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                borderRadius: '4px',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <input
                type="checkbox"
                checked={showOnlyInCellar}
                onChange={(e) => onShowOnlyInCellarChange(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  accentColor: 'rgba(255, 255, 255, 0.4)',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Currently in cellar
              </span>
            </label>
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
                onMinRatingChange(e.target.value ? parseInt(e.target.value, 10) : null)
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
                value="95"
                style={{ backgroundColor: '#443326', color: 'rgba(255, 255, 255, 0.7)' }}
              >
                95+
              </option>
              <option
                value="90"
                style={{ backgroundColor: '#443326', color: 'rgba(255, 255, 255, 0.7)' }}
              >
                90+
              </option>
              <option
                value="85"
                style={{ backgroundColor: '#443326', color: 'rgba(255, 255, 255, 0.7)' }}
              >
                85+
              </option>
              <option
                value="80"
                style={{ backgroundColor: '#443326', color: 'rgba(255, 255, 255, 0.7)' }}
              >
                80+
              </option>
            </select>
          </div>
        </div>

        {/* Price Range */}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label
                htmlFor="price-from"
                style={{
                  display: 'block',
                  marginBottom: '2px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'rgba(255, 255, 255, 0.7)',
                  backgroundColor: '#221a13',
                }}
              >
                From
              </label>
              <input
                id="price-from"
                type="number"
                min={priceMin}
                max={priceMax}
                step="0.01"
                value={priceRange?.[0] ?? priceMin}
                onChange={(e) => handlePriceMinChange(parseFloat(e.target.value) || priceMin)}
                disabled={priceMin === priceMax}
                style={{
                  width: '100%',
                  padding: '6px',
                  fontSize: '13px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  boxSizing: 'border-box',
                  cursor: priceMin === priceMax ? 'not-allowed' : 'text',
                }}
              />
            </div>
            <div>
              <label
                htmlFor="price-to"
                style={{
                  display: 'block',
                  marginBottom: '2px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'rgba(255, 255, 255, 0.7)',
                  backgroundColor: '#221a13',
                }}
              >
                To
              </label>
              <input
                id="price-to"
                type="number"
                min={priceMin}
                max={priceMax}
                step="0.01"
                value={priceRange?.[1] ?? priceMax}
                onChange={(e) => handlePriceMaxChange(parseFloat(e.target.value) || priceMax)}
                disabled={priceMin === priceMax}
                style={{
                  width: '100%',
                  padding: '6px',
                  fontSize: '13px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  boxSizing: 'border-box',
                  cursor: priceMin === priceMax ? 'not-allowed' : 'text',
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
  );
}
