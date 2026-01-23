'use client';

import { useEffect, useState, useMemo } from 'react';
import WineTable from '../components/WineTable';
import WineFilters from '../components/WineFilters';
import WineDetailModal from '../components/WineDetailModal';

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
  expertRatings: string | null;
  wherePurchased: string | null;
  wineLink: string | null;
  favorite: boolean;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function Home(): React.JSX.Element {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'add' | null>(null);

  // Filter and sort state
  const [searchText, setSearchText] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedGrapeVariety, setSelectedGrapeVariety] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showOnlyInCellar, setShowOnlyInCellar] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [vintageRange, setVintageRange] = useState<[number, number] | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<
    | 'name'
    | 'vintage'
    | 'producer'
    | 'price'
    | 'rating'
    | 'color'
    | 'region'
    | 'grapeVariety'
    | 'country'
    | 'quantity'
  >('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Derived state for filters
  const grapeVarieties = useMemo(() => {
    const uniqueVarieties = wines
      .map((w) => w.grapeVariety)
      .filter((v): v is string => v !== null && v !== undefined && v.trim() !== '');
    return [...new Set(uniqueVarieties)].sort();
  }, [wines]);

  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(wines.map((w) => w.country))];
    return uniqueCountries.sort();
  }, [wines]);

  const priceMin = useMemo(() => {
    if (wines.length === 0) return 0;
    const prices = wines
      .map((w) => w.purchasePrice)
      .filter((p): p is number => p !== null && p !== undefined);
    return prices.length > 0 ? Math.floor(Math.min(...prices)) : 0;
  }, [wines]);

  const priceMax = useMemo(() => {
    if (wines.length === 0) return 1000;
    const prices = wines
      .map((w) => w.purchasePrice)
      .filter((p): p is number => p !== null && p !== undefined);
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000;
  }, [wines]);

  // Filtered and sorted wines
  const filteredAndSortedWines = useMemo(() => {
    let result = [...wines];

    // Stage 1: Text search (name, producer, region)
    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter(
        (wine) =>
          wine.name.toLowerCase().includes(search) ||
          wine.producer.toLowerCase().includes(search) ||
          (wine.region?.toLowerCase().includes(search) ?? false)
      );
    }

    // Stage 2: Color filter (multiple selection)
    if (selectedColors.length > 0) {
      result = result.filter((wine) => selectedColors.includes(wine.color));
    }

    // Stage 3: Grape variety filter
    if (selectedGrapeVariety) {
      result = result.filter((wine) => wine.grapeVariety === selectedGrapeVariety);
    }

    // Stage 4: Country filter
    if (selectedCountry) {
      result = result.filter((wine) => wine.country === selectedCountry);
    }

    // Stage 5: In Cellar filter
    if (showOnlyInCellar) {
      result = result.filter((wine) => wine.quantity > 0);
    }

    // Stage 5b: Favorites filter
    if (showOnlyFavorites) {
      result = result.filter((wine) => wine.favorite);
    }

    // Stage 6: Vintage range filter
    if (vintageRange) {
      result = result.filter(
        (wine) => wine.vintage >= vintageRange[0] && wine.vintage <= vintageRange[1]
      );
    }

    // Stage 7: Price range filter
    if (priceRange) {
      result = result.filter((wine) => {
        if (wine.purchasePrice === null || wine.purchasePrice === undefined) return false;
        return wine.purchasePrice >= priceRange[0] && wine.purchasePrice <= priceRange[1];
      });
    }

    // Stage 8: Rating filter
    if (minRating !== null) {
      result = result.filter((wine) => {
        if (wine.rating === null || wine.rating === undefined) return false;
        return wine.rating >= minRating;
      });
    }

    // Stage 9: Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'vintage':
          comparison = a.vintage - b.vintage;
          break;
        case 'producer':
          comparison = a.producer.localeCompare(b.producer);
          break;
        case 'price':
          comparison = (a.purchasePrice ?? 0) - (b.purchasePrice ?? 0);
          break;
        case 'rating':
          comparison = (a.rating ?? 0) - (b.rating ?? 0);
          break;
        case 'color':
          comparison = a.color.localeCompare(b.color);
          break;
        case 'region':
          comparison = (a.region ?? '').localeCompare(b.region ?? '');
          break;
        case 'grapeVariety':
          comparison = (a.grapeVariety ?? '').localeCompare(b.grapeVariety ?? '');
          break;
        case 'country':
          comparison = a.country.localeCompare(b.country);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [
    wines,
    searchText,
    selectedColors,
    selectedGrapeVariety,
    selectedCountry,
    showOnlyInCellar,
    showOnlyFavorites,
    vintageRange,
    priceRange,
    minRating,
    sortBy,
    sortDirection,
  ]);

  const handleClearFilters = (): void => {
    setSearchText('');
    setSelectedColors([]);
    setSelectedGrapeVariety(null);
    setSelectedCountry(null);
    setShowOnlyInCellar(false);
    setShowOnlyFavorites(false);
    setVintageRange(null);
    setPriceRange(null);
    setMinRating(null);
    setSortBy('name');
    setSortDirection('asc');
  };

  useEffect(() => {
    void fetchWines();
  }, []);

  const fetchWines = async (): Promise<void> => {
    try {
      const res = await fetch('/api/wines');
      const data = await res.json();
      setWines(data);
    } catch (error) {
      console.error('Error fetching wines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWine = async (data: Omit<Wine, 'id'>): Promise<Wine> => {
    try {
      const response = await fetch('/api/wines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ POST request failed:', errorText);
        throw new Error(`Failed to create wine: ${response.status} ${errorText}`);
      }

      const createdWine = await response.json();

      // Fetch fresh list
      const res = await fetch('/api/wines');
      const updatedWines = await res.json();
      setWines(updatedWines);
      setModalMode(null);
      setSelectedWine(null);

      return createdWine;
    } catch (error) {
      console.error('❌ Error creating wine:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleteConfirm) return;
    try {
      await fetch(`/api/wines/${deleteConfirm}`, { method: 'DELETE' });
      void fetchWines();
    } catch (error) {
      console.error('Error deleting wine:', error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleUpdateWine = async (id: string, data: Partial<Wine>): Promise<void> => {
    try {
      // Filter out read-only fields that the API doesn't accept
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...updateData } = data as Wine;

      const updateResponse = await fetch(`/api/wines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('❌ PUT request failed:', errorText);
        throw new Error(`Failed to update wine: ${updateResponse.status} ${errorText}`);
      }

      // Fetch fresh list
      const res = await fetch('/api/wines');
      const updatedWines = await res.json();
      setWines(updatedWines);

      // Update the selected wine with fresh data from server
      const updatedWine = updatedWines.find((w: Wine) => w.id === id);

      if (updatedWine) {
        setSelectedWine(updatedWine);
      } else {
        console.error('❌ Could not find updated wine in fresh list');
      }
    } catch (error) {
      console.error('❌ Error updating wine:', error);
      throw error;
    }
  };

  const handleToggleFavorite = async (wine: Wine): Promise<void> => {
    try {
      const response = await fetch(`/api/wines/${wine.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: !wine.favorite }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      // Update local state immediately for responsiveness
      setWines((prevWines) =>
        prevWines.map((w) => (w.id === wine.id ? { ...w, favorite: !w.favorite } : w))
      );

      // Also update selected wine if it's the same
      if (selectedWine?.id === wine.id) {
        setSelectedWine({ ...selectedWine, favorite: !selectedWine.favorite });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: '#7C2D3C' }}>
        <p style={{ fontSize: '18px' }}>Loading your collection...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '8px',
              maxWidth: '400px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#4A1C26' }}>Confirm Delete</h3>
            <p style={{ marginBottom: '24px', color: '#7C2D3C' }}>
              Are you sure you want to delete this wine from your cellar?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#7C2D3C',
                  border: '1px solid #7C2D3C',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#8B3A3A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar: Bottle count + Add Wine button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          marginBottom: '16px',
          backgroundColor: '#282f20',
        }}
      >
        {wines.length > 0 ? (
          <h2
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '700',
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'left',
            }}
          >
            {filteredAndSortedWines.length !== wines.length
              ? `Showing ${filteredAndSortedWines.length} of ${wines.length} ${wines.length === 1 ? 'Bottle' : 'Bottles'}`
              : `${wines.length} ${wines.length === 1 ? 'Bottle' : 'Bottles'} in Collection`}
          </h2>
        ) : (
          <div />
        )}
        <button
          onClick={() => setModalMode('add')}
          style={{
            padding: '10px 28px',
            backgroundColor: '#3d010b',
            color: 'rgba(255, 255, 255, 0.7)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '700',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#5a0210';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#3d010b';
          }}
        >
          + Add Wine
        </button>
      </div>

      {/* Main Content: Sidebar + Table Layout */}
      <div style={{ display: 'flex', gap: '26px', alignItems: 'flex-start' }}>
        {/* Left Sidebar - Filters (25%) */}
        {wines.length > 0 && (
          <div style={{ flex: '0 0 25%' }}>
            {/* Filters */}
            <WineFilters
              searchText={searchText}
              onSearchChange={setSearchText}
              selectedColors={selectedColors}
              onColorsChange={setSelectedColors}
              selectedGrapeVariety={selectedGrapeVariety}
              onGrapeVarietyChange={setSelectedGrapeVariety}
              grapeVarieties={grapeVarieties}
              selectedCountry={selectedCountry}
              onCountryChange={setSelectedCountry}
              countries={countries}
              showOnlyInCellar={showOnlyInCellar}
              onShowOnlyInCellarChange={setShowOnlyInCellar}
              showOnlyFavorites={showOnlyFavorites}
              onShowOnlyFavoritesChange={setShowOnlyFavorites}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              priceMin={priceMin}
              priceMax={priceMax}
              onClearAll={handleClearFilters}
            />
          </div>
        )}

        {/* Right Content - Table */}
        <div
          style={{
            flex: wines.length > 0 ? '1' : '1 1 100%',
          }}
        >
          {/* Wine Table */}
          <WineTable
            wines={filteredAndSortedWines}
            onRowClick={(wine) => {
              setSelectedWine(wine);
              setModalMode('view');
            }}
            onToggleFavorite={handleToggleFavorite}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={(column) => {
              if (sortBy === column) {
                // Toggle direction if clicking the same column
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
              } else {
                // Set new column with ascending as default
                setSortBy(column);
                setSortDirection('asc');
              }
            }}
            maxHeight="calc(100vh - 200px)"
          />
        </div>
      </div>

      {/* Wine Detail Modal */}
      {modalMode === 'view' && (
        <WineDetailModal
          wine={selectedWine}
          mode="view"
          onClose={() => {
            setSelectedWine(null);
            setModalMode(null);
          }}
          onUpdate={handleUpdateWine}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Add Wine Modal */}
      {modalMode === 'add' && (
        <WineDetailModal
          wine={null}
          mode="add"
          onClose={() => {
            setModalMode(null);
            setSelectedWine(null);
          }}
          onUpdate={handleUpdateWine}
          onCreate={handleCreateWine}
        />
      )}
    </div>
  );
}
