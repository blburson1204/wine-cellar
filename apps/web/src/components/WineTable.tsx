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
  wineLink: string | null;
  imageUrl: string | null;
}

interface WineTableProps {
  wines: Wine[];
  onRowClick: (wine: Wine) => void;
  sortBy: 'name' | 'vintage' | 'producer' | 'price' | 'rating';
  sortDirection: 'asc' | 'desc';
  onSort: (column: 'name' | 'vintage' | 'producer' | 'price' | 'rating') => void;
  maxHeight?: string;
}

const COLOR_LABELS: Record<string, string> = {
  RED: 'Red',
  WHITE: 'White',
  ROSE: 'Rosé',
  SPARKLING: 'Sparkling',
  DESSERT: 'Dessert',
  FORTIFIED: 'Fortified',
};

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
  const getSortIndicator = (
    column: 'name' | 'vintage' | 'producer' | 'price' | 'rating'
  ): string => {
    if (sortBy !== column) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };
  if (wines.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '64px 24px',
          backgroundColor: '#221a13',
          borderRadius: '8px',
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🍷</div>
        <h3
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '20px',
            marginBottom: '8px',
            fontWeight: '700',
          }}
        >
          No wines found
        </h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', fontWeight: '700' }}>
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
        backgroundColor: '#221a13',
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
        <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#3d010b' }}>
          <tr style={{ backgroundColor: '#3d010b' }}>
            <th
              onClick={() => onSort('vintage')}
              style={{
                padding: '10px 8px 10px 20px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.2s',
                width: '56px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#5a0210';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ borderBottom: '1px dotted rgba(255, 255, 255, 0.5)' }}>Vintage</span>
              {getSortIndicator('vintage')}
            </th>
            <th
              onClick={() => onSort('name')}
              style={{
                padding: '10px 8px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.2s',
                width: '320px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#5a0210';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ borderBottom: '1px dotted rgba(255, 255, 255, 0.5)' }}>Wine</span>
              {getSortIndicator('name')}
            </th>
            <th
              style={{
                padding: '10px 8px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.7)',
                width: '80px',
              }}
            >
              Type
            </th>
            <th
              style={{
                padding: '10px 8px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.7)',
                width: '120px',
              }}
            >
              Region
            </th>
            <th
              style={{
                padding: '10px 8px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.7)',
                width: '120px',
              }}
            >
              Grape
            </th>
            <th
              onClick={() => onSort('producer')}
              style={{
                padding: '10px 8px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.2s',
                width: '180px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#5a0210';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ borderBottom: '1px dotted rgba(255, 255, 255, 0.5)' }}>Producer</span>
              {getSortIndicator('producer')}
            </th>
            <th
              style={{
                padding: '10px 8px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.7)',
                width: '120px',
              }}
            >
              Country
            </th>
            <th
              onClick={() => onSort('rating')}
              style={{
                padding: '10px 8px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.2s',
                width: '90px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#5a0210';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ borderBottom: '1px dotted rgba(255, 255, 255, 0.5)' }}>Rating</span>
              {getSortIndicator('rating')}
            </th>
            <th
              style={{
                padding: '10px 8px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.7)',
                width: '80px',
              }}
            >
              In Cellar
            </th>
            <th
              onClick={() => onSort('price')}
              style={{
                padding: '10px 20px 10px 8px',
                textAlign: 'right',
                fontSize: '14px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#5a0210';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ borderBottom: '1px dotted rgba(255, 255, 255, 0.5)' }}>Price</span>
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
                  transition: 'background-color 0.2s',
                  cursor: 'pointer',
                  backgroundColor: isFocused ? '#7a0215' : '#221a13',
                  color: isFocused ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.7)',
                  fontWeight: isFocused ? '700' : '400',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#7a0215';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                  e.currentTarget.style.fontWeight = '700';
                }}
                onMouseOut={(e) => {
                  if (!isFocused) {
                    e.currentTarget.style.backgroundColor = '#221a13';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.fontWeight = '400';
                  } else {
                    e.currentTarget.style.backgroundColor = '#7a0215';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                    e.currentTarget.style.fontWeight = '700';
                  }
                }}
                onClick={() => {
                  setFocusedIndex(index);
                  onRowClick(wine);
                }}
              >
                <td style={{ padding: '6px 8px 6px 20px', fontSize: '14px' }}>{wine.vintage}</td>
                <td
                  style={{
                    padding: '6px 8px',
                    fontSize: '14px',
                  }}
                >
                  {wine.name}
                </td>
                <td style={{ padding: '6px 8px', fontSize: '14px' }}>
                  {COLOR_LABELS[wine.color] || wine.color}
                </td>
                <td style={{ padding: '6px 8px', fontSize: '14px' }}>{wine.region || '—'}</td>
                <td style={{ padding: '6px 8px', fontSize: '14px' }}>{wine.grapeVariety || '—'}</td>
                <td style={{ padding: '6px 8px', fontSize: '14px' }}>{wine.producer}</td>
                <td style={{ padding: '6px 8px', fontSize: '14px' }}>{wine.country}</td>
                <td
                  style={{
                    padding: '6px 8px',
                    fontSize: '14px',
                    textAlign: 'center',
                  }}
                >
                  {wine.rating !== null && wine.rating !== undefined ? wine.rating : '—'}
                </td>
                <td
                  style={{
                    padding: '6px 8px',
                    fontSize: '14px',
                    textAlign: 'center',
                  }}
                >
                  {wine.quantity > 0 ? 'Yes' : 'No'}
                </td>
                <td
                  style={{
                    padding: '6px 20px 6px 8px',
                    fontSize: '14px',
                    textAlign: 'right',
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
