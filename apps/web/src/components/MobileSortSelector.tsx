'use client';

type SortColumn =
  | 'name'
  | 'vintage'
  | 'producer'
  | 'price'
  | 'rating'
  | 'color'
  | 'region'
  | 'grapeVariety'
  | 'country'
  | 'quantity';

interface MobileSortSelectorProps {
  sortBy: SortColumn;
  sortDirection: 'asc' | 'desc';
  onSort: (column: SortColumn) => void;
}

const SORT_LABELS: Record<SortColumn, string> = {
  name: 'Name',
  vintage: 'Vintage',
  producer: 'Producer',
  price: 'Price',
  rating: 'Rating',
  color: 'Type',
  region: 'Region',
  grapeVariety: 'Grape',
  country: 'Country',
  quantity: 'Quantity',
};

const SORT_OPTIONS: SortColumn[] = [
  'name',
  'vintage',
  'producer',
  'price',
  'rating',
  'color',
  'region',
  'grapeVariety',
  'country',
  'quantity',
];

export default function MobileSortSelector({
  sortBy,
  sortDirection,
  onSort,
}: MobileSortSelectorProps): React.JSX.Element {
  const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSort(e.target.value as SortColumn);
  };

  const handleDirectionToggle = () => {
    // Re-clicking same column toggles direction (parent handles this logic)
    onSort(sortBy);
  };

  const directionLabel = sortDirection === 'asc' ? 'ascending' : 'descending';

  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
      <label htmlFor="mobile-sort-select" className="text-sm text-white/70 whitespace-nowrap">
        Sort by:
      </label>
      <select
        id="mobile-sort-select"
        value={sortBy}
        onChange={handleColumnChange}
        className="flex-1 bg-transparent text-white border-0 focus:ring-2 focus:ring-wine-burgundy rounded-md"
        style={{ minHeight: '44px' }}
        aria-label="Sort by"
      >
        {SORT_OPTIONS.map((column) => (
          <option key={column} value={column} className="bg-wine-dark text-white">
            {SORT_LABELS[column]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleDirectionToggle}
        aria-label={`Sort direction: ${directionLabel}. Click to toggle.`}
        className="flex items-center justify-center text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-burgundy rounded"
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        {sortDirection === 'asc' ? (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
    </div>
  );
}
