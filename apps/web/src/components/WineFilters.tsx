interface WineFiltersProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  selectedColors: string[];
  onColorsChange: (colors: string[]) => void;
  selectedCountry: string | null;
  onCountryChange: (country: string | null) => void;
  countries: string[];
  vintageRange: [number, number] | null;
  onVintageRangeChange: (range: [number, number] | null) => void;
  vintageMin: number;
  vintageMax: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (sortBy: string, direction: 'asc' | 'desc') => void;
  onClearAll: () => void;
  totalCount: number;
  filteredCount: number;
}

const WINE_COLORS = [
  { value: 'RED', label: 'Red', color: '#7C2D3C' },
  { value: 'WHITE', label: 'White', color: '#F5F1E8' },
  { value: 'ROSE', label: 'Rosé', color: '#D4A5A5' },
  { value: 'SPARKLING', label: 'Sparkling', color: '#FFD700' },
  { value: 'DESSERT', label: 'Dessert', color: '#8B4513' },
  { value: 'FORTIFIED', label: 'Fortified', color: '#4A1C26' },
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)', sortBy: 'name', direction: 'asc' as const },
  { value: 'name-desc', label: 'Name (Z-A)', sortBy: 'name', direction: 'desc' as const },
  {
    value: 'vintage-asc',
    label: 'Vintage (Old-New)',
    sortBy: 'vintage',
    direction: 'asc' as const,
  },
  {
    value: 'vintage-desc',
    label: 'Vintage (New-Old)',
    sortBy: 'vintage',
    direction: 'desc' as const,
  },
  {
    value: 'rating-desc',
    label: 'Rating (High-Low)',
    sortBy: 'rating',
    direction: 'desc' as const,
  },
  { value: 'rating-asc', label: 'Rating (Low-High)', sortBy: 'rating', direction: 'asc' as const },
  {
    value: 'createdAt-desc',
    label: 'Recently Added',
    sortBy: 'createdAt',
    direction: 'desc' as const,
  },
  {
    value: 'createdAt-asc',
    label: 'Oldest First',
    sortBy: 'createdAt',
    direction: 'asc' as const,
  },
];

export default function WineFilters({
  searchText,
  onSearchChange,
  selectedColors,
  onColorsChange,
  selectedCountry,
  onCountryChange,
  countries,
  vintageRange,
  onVintageRangeChange,
  vintageMin,
  vintageMax,
  sortBy,
  sortDirection,
  onSortChange,
  onClearAll,
  totalCount,
  filteredCount,
}: WineFiltersProps): React.JSX.Element {
  const hasActiveFilters =
    searchText !== '' ||
    selectedColors.length > 0 ||
    selectedCountry !== null ||
    vintageRange !== null ||
    sortBy !== 'createdAt' ||
    sortDirection !== 'desc';

  const handleColorToggle = (colorValue: string): void => {
    if (selectedColors.includes(colorValue)) {
      // Remove color from selection
      onColorsChange(selectedColors.filter((c) => c !== colorValue));
    } else {
      // Add color to selection
      onColorsChange([...selectedColors, colorValue]);
    }
  };

  const currentSortValue = `${sortBy}-${sortDirection}`;

  const handleSortSelectChange = (value: string): void => {
    const option = SORT_OPTIONS.find((opt) => opt.value === value);
    if (option) {
      onSortChange(option.sortBy, option.direction);
    }
  };

  const handleVintageMinChange = (value: number): void => {
    const max = vintageRange?.[1] ?? vintageMax;
    onVintageRangeChange([value, max]);
  };

  const handleVintageMaxChange = (value: number): void => {
    const min = vintageRange?.[0] ?? vintageMin;
    onVintageRangeChange([min, value]);
  };

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#F5F1E8',
        borderRadius: '8px',
        border: '1px solid #E5DFD0',
      }}
    >
      {/* Search and Sort Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
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
            placeholder="Search by name, producer, or region..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #D4A5A5',
              borderRadius: '4px',
              width: '100%',
              backgroundColor: 'white',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ minWidth: '200px' }}>
          <label
            htmlFor="sort"
            style={{
              display: 'block',
              marginBottom: '4px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#4A1C26',
            }}
          >
            Sort By
          </label>
          <select
            id="sort"
            value={currentSortValue}
            onChange={(e) => handleSortSelectChange(e.target.value)}
            style={{
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #D4A5A5',
              borderRadius: '4px',
              width: '100%',
              backgroundColor: 'white',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Wine Type and Filters Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '12px',
          alignItems: 'start',
        }}
      >
        {/* Wine Type Filter */}
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
              backgroundColor: 'white',
              border: '1px solid #D4A5A5',
              borderRadius: '6px',
              marginTop: '21px',
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
                    gap: '6px',
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
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: color.color,
                      border: color.value === 'WHITE' ? '1px solid #D4A5A5' : 'none',
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

        {/* Vintage Range and Country Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Vintage Range */}
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
              Vintage Range
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>
                <label
                  htmlFor="vintage-from"
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
                  id="vintage-from"
                  type="number"
                  min={vintageMin}
                  max={vintageMax}
                  value={vintageRange?.[0] ?? vintageMin}
                  onChange={(e) => handleVintageMinChange(parseInt(e.target.value) || vintageMin)}
                  disabled={vintageMin === vintageMax}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #D4A5A5',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                    cursor: vintageMin === vintageMax ? 'not-allowed' : 'text',
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="vintage-to"
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
                  id="vintage-to"
                  type="number"
                  min={vintageMin}
                  max={vintageMax}
                  value={vintageRange?.[1] ?? vintageMax}
                  onChange={(e) => handleVintageMaxChange(parseInt(e.target.value) || vintageMax)}
                  disabled={vintageMin === vintageMax}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #D4A5A5',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                    cursor: vintageMin === vintageMax ? 'not-allowed' : 'text',
                  }}
                />
              </div>
            </div>
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
                backgroundColor: 'white',
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
        </div>
      </div>

      {/* Results Count and Clear Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid #E5DFD0',
        }}
      >
        <span style={{ fontSize: '14px', color: '#4A1C26', fontWeight: '500' }}>
          Showing {filteredCount} of {totalCount} wines
        </span>
        {hasActiveFilters && (
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
        )}
      </div>
    </div>
  );
}
