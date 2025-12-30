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
}

const WINE_COLORS: Record<string, string> = {
  RED: '#7C2D3C',
  WHITE: '#F5F1E8',
  ROSE: '#D4A5A5',
  SPARKLING: '#FFD700',
  DESSERT: '#8B4513',
  FORTIFIED: '#4A1C26',
};

interface WineTableProps {
  wines: Wine[];
  onRowClick: (wine: Wine) => void;
  sortBy: 'name' | 'vintage' | 'producer' | 'price';
  sortDirection: 'asc' | 'desc';
  onSort: (column: 'name' | 'vintage' | 'producer' | 'price') => void;
}

export default function WineTable({
  wines,
  onRowClick,
  sortBy,
  sortDirection,
  onSort,
}: WineTableProps): React.JSX.Element {
  const getSortIndicator = (column: 'name' | 'vintage' | 'producer' | 'price'): string => {
    if (sortBy !== column) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };
  if (wines.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '64px 24px',
          backgroundColor: '#F5F1E8',
          borderRadius: '8px',
          border: '1px solid #E5DFD0',
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🍷</div>
        <h3 style={{ color: '#4A1C26', fontSize: '20px', marginBottom: '8px' }}>No wines found</h3>
        <p style={{ color: '#7C2D3C', fontSize: '16px' }}>
          Try adjusting your filters or add your first wine
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#4A1C26', color: 'white' }}>
            <th
              onClick={() => onSort('name')}
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#5f2330';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ borderBottom: '1px dotted rgba(255, 255, 255, 0.6)' }}>Wine</span>
              {getSortIndicator('name')}
            </th>
            <th
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Type
            </th>
            <th
              onClick={() => onSort('producer')}
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#5f2330';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ borderBottom: '1px dotted rgba(255, 255, 255, 0.6)' }}>Producer</span>
              {getSortIndicator('producer')}
            </th>
            <th
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Country
            </th>
            <th
              onClick={() => onSort('vintage')}
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.2s',
                minWidth: '90px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#5f2330';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ borderBottom: '1px dotted rgba(255, 255, 255, 0.6)' }}>Vintage</span>
              {getSortIndicator('vintage')}
            </th>
            <th
              style={{
                padding: '10px 12px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Qty
            </th>
            <th
              onClick={() => onSort('price')}
              style={{
                padding: '10px 12px',
                textAlign: 'right',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#5f2330';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ borderBottom: '1px dotted rgba(255, 255, 255, 0.6)' }}>Price</span>
              {getSortIndicator('price')}
            </th>
          </tr>
        </thead>
        <tbody>
          {wines.map((wine, index) => (
            <tr
              key={wine.id}
              style={{
                borderBottom: index < wines.length - 1 ? '1px solid #E5DFD0' : 'none',
                transition: 'background-color 0.2s',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F1E8';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
              onClick={() => onRowClick(wine)}
            >
              <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: WINE_COLORS[wine.color] || '#7C2D3C',
                    border: wine.color === 'WHITE' ? '1px solid #D4A5A5' : 'none',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontWeight: '500', color: '#4A1C26' }}>{wine.name}</span>
              </td>
              <td style={{ padding: '12px' }}>
                <span
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#F5F1E8',
                    color: '#7C2D3C',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  {wine.color}
                </span>
              </td>
              <td style={{ padding: '12px', color: '#4A1C26' }}>{wine.producer}</td>
              <td style={{ padding: '12px', color: '#4A1C26' }}>{wine.country}</td>
              <td style={{ padding: '12px', color: '#4A1C26' }}>{wine.vintage}</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#4A1C26' }}>
                {wine.quantity}
              </td>
              <td
                style={{
                  padding: '12px',
                  textAlign: 'right',
                  color: '#4A1C26',
                  fontWeight: '500',
                }}
              >
                {wine.purchasePrice !== null && wine.purchasePrice !== undefined
                  ? `$${wine.purchasePrice.toFixed(2)}`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
