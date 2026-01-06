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
  priceRange: [number, number] | null;
  onPriceRangeChange: (range: [number, number] | null) => void;
  priceMin: number;
  priceMax: number;
  onClearAll: () => void;
}

const WINE_COLORS = [
  { value: 'RED', label: 'Red', color: '#7C2D3C' },
  { value: 'SPARKLING', label: 'Sparkling', color: '#FFD700' },
  { value: 'WHITE', label: 'White', color: '#F5F1E8' },
  { value: 'DESSERT', label: 'Dessert', color: '#8B4513' },
  { value: 'ROSE', label: 'Rosé', color: '#D4A5A5' },
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
  priceRange,
  onPriceRangeChange,
  priceMin,
  priceMax,
  onClearAll,
}: WineFiltersProps): React.JSX.Element {
  const hasActiveFilters =
    searchText !== '' ||
    selectedColors.length > 0 ||
    selectedGrapeVariety !== null ||
    selectedCountry !== null ||
    showOnlyInCellar ||
    priceRange !== null;

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
        backgroundColor: 'rgba(245, 241, 232, 0.6)',
        borderRadius: '8px',
        border: '1px solid #D4A5A5',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(4px)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#7C2D3C',
          color: 'white',
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: '600',
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
              fontWeight: '500',
              color: '#4A1C26',
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
              border: '1px solid #D4A5A5',
              borderRadius: '4px',
              width: '100%',
              backgroundColor: 'rgba(245, 241, 232, 0.8)',
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
              fontWeight: '500',
              color: '#4A1C26',
            }}
          >
            Wine Type
          </label>
          <div
            style={{
              padding: '8px',
              backgroundColor: 'rgba(245, 241, 232, 0.8)',
              border: '1px solid #D4A5A5',
              borderRadius: '6px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
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
                    padding: '4px 6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    borderRadius: '4px',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#FAFAF8';
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
                      accentColor: '#7C2D3C',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#4A1C26', fontWeight: '500' }}>
                    {color.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Grape Variety */}
        <div>
          <label
            htmlFor="grape-variety"
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
          <select
            id="grape-variety"
            value={selectedGrapeVariety ?? ''}
            onChange={(e) => onGrapeVarietyChange(e.target.value || null)}
            style={{
              padding: '8px',
              fontSize: '14px',
              border: '1px solid #D4A5A5',
              borderRadius: '4px',
              width: '100%',
              backgroundColor: 'rgba(245, 241, 232, 0.8)',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            <option value="">All Varieties</option>
            {grapeVarieties.map((variety) => (
              <option key={variety} value={variety}>
                {variety}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div>
          <label
            htmlFor="country"
            style={{
              display: 'block',
              marginBottom: '4px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4A1C26',
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
              fontSize: '14px',
              border: '1px solid #D4A5A5',
              borderRadius: '4px',
              width: '100%',
              backgroundColor: 'rgba(245, 241, 232, 0.8)',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* In Cellar Filter */}
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
            In Cellar
          </label>
          <div
            style={{
              padding: '8px',
              backgroundColor: 'rgba(245, 241, 232, 0.8)',
              border: '1px solid #D4A5A5',
              borderRadius: '6px',
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
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  accentColor: '#7C2D3C',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '13px', color: '#4A1C26', fontWeight: '500' }}>
                Show what's currently in cellar
              </span>
            </label>
          </div>
        </div>

        {/* Price Range */}
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
                  fontWeight: '500',
                  color: '#7C2D3C',
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
                  border: '1px solid #D4A5A5',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(245, 241, 232, 0.8)',
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
                  fontWeight: '500',
                  color: '#7C2D3C',
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
                  border: '1px solid #D4A5A5',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(245, 241, 232, 0.8)',
                  boxSizing: 'border-box',
                  cursor: priceMin === priceMax ? 'not-allowed' : 'text',
                }}
              />
            </div>
          </div>
        </div>

        {/* Clear Button at Bottom */}
        {hasActiveFilters && (
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid #E5DFD0',
            }}
          >
            <button
              type="button"
              onClick={onClearAll}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#7C2D3C',
                border: '1px solid #7C2D3C',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s',
                width: '100%',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#FAFAF8';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
