'use client';

import { useState, useEffect, useRef } from 'react';

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
  imageUrl: string | null;
}

interface WineTableProps {
  wines: Wine[];
  onRowClick: (wine: Wine) => void;
  sortBy: 'name' | 'vintage' | 'producer' | 'price';
  sortDirection: 'asc' | 'desc';
  onSort: (column: 'name' | 'vintage' | 'producer' | 'price') => void;
  maxHeight?: string;
}

export default function WineTable({
  wines,
  onRowClick,
  sortBy,
  sortDirection,
  onSort,
  maxHeight,
}: WineTableProps): React.JSX.Element {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const tableRef = useRef<HTMLDivElement>(null);

  // Set focus on first row when wines change (including initial load)
  useEffect(() => {
    if (wines.length > 0 && focusedIndex >= wines.length) {
      setFocusedIndex(0);
    }
  }, [wines, focusedIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (wines.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, wines.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onRowClick(wines[focusedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wines, focusedIndex, onRowClick]);
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
          backgroundColor: '#f5f1e8',
          borderRadius: '8px',
          border: '1px solid #C4B5A0',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
    <div
      ref={tableRef}
      style={{
        borderRadius: '8px',
        border: '1px solid #C4B5A0',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f5f1e8',
        overflow: 'auto',
        maxHeight: maxHeight,
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
          backgroundColor: 'transparent',
        }}
      >
        <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#7C2D3C' }}>
          <tr style={{ backgroundColor: '#7C2D3C', color: 'white' }}>
            <th
              onClick={() => onSort('vintage')}
              style={{
                padding: '10px 8px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.2s',
                width: '56px',
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
              onClick={() => onSort('name')}
              style={{
                padding: '10px 8px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.2s',
                width: '230px',
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
                padding: '10px 8px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                width: '80px',
              }}
            >
              Type
            </th>
            <th
              onClick={() => onSort('producer')}
              style={{
                padding: '10px 8px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.2s',
                width: '180px',
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
                padding: '10px 8px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                width: '120px',
              }}
            >
              Country
            </th>
            <th
              style={{
                padding: '10px 8px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '600',
                width: '80px',
              }}
            >
              In Cellar
            </th>
            <th
              onClick={() => onSort('price')}
              style={{
                padding: '10px 8px',
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
          {wines.map((wine, index) => {
            const isFocused = index === focusedIndex;
            return (
              <tr
                key={wine.id}
                style={{
                  borderBottom: index < wines.length - 1 ? '1px solid #E5DFD0' : 'none',
                  transition: 'background-color 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  backgroundColor: isFocused ? '#E8DCC8' : 'transparent',
                  boxShadow: isFocused ? 'inset 0 0 0 1px #C4B5A0' : 'none',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#E8DCC8';
                }}
                onMouseOut={(e) => {
                  if (!isFocused) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  } else {
                    e.currentTarget.style.backgroundColor = '#E8DCC8';
                  }
                }}
                onClick={() => {
                  setFocusedIndex(index);
                  onRowClick(wine);
                }}
              >
                <td style={{ padding: '6px 8px', fontSize: '14px', color: '#4A1C26' }}>
                  {wine.vintage}
                </td>
                <td
                  style={{
                    padding: '6px 8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#4A1C26',
                  }}
                >
                  {wine.name}
                </td>
                <td style={{ padding: '6px 8px', fontSize: '14px' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#FFFFFF',
                      color: '#7C2D3C',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: '1px solid #E5DFD0',
                    }}
                  >
                    {wine.color}
                  </span>
                </td>
                <td style={{ padding: '6px 8px', fontSize: '14px', color: '#4A1C26' }}>
                  {wine.producer}
                </td>
                <td style={{ padding: '6px 8px', fontSize: '14px', color: '#4A1C26' }}>
                  {wine.country}
                </td>
                <td
                  style={{
                    padding: '6px 8px',
                    fontSize: '14px',
                    textAlign: 'center',
                    color: '#4A1C26',
                  }}
                >
                  {wine.quantity > 0 ? 'Yes' : 'No'}
                </td>
                <td
                  style={{
                    padding: '6px 8px',
                    fontSize: '14px',
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
