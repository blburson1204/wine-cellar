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
  color: string;
  quantity: number;
  purchasePrice: number | null;
  purchaseDate: string | null;
  drinkByDate: string | null;
  rating: number | null;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function Home(): React.JSX.Element {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);

  // Filter and sort state
  const [searchText, setSearchText] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [vintageRange, setVintageRange] = useState<[number, number] | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'vintage' | 'rating' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Derived state for filters
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(wines.map((w) => w.country))];
    return uniqueCountries.sort();
  }, [wines]);

  const vintageMin = useMemo(() => {
    if (wines.length === 0) return new Date().getFullYear();
    return Math.min(...wines.map((w) => w.vintage));
  }, [wines]);

  const vintageMax = useMemo(() => {
    if (wines.length === 0) return new Date().getFullYear();
    return Math.max(...wines.map((w) => w.vintage));
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

    // Stage 3: Country filter
    if (selectedCountry) {
      result = result.filter((wine) => wine.country === selectedCountry);
    }

    // Stage 4: Vintage range filter
    if (vintageRange) {
      result = result.filter(
        (wine) => wine.vintage >= vintageRange[0] && wine.vintage <= vintageRange[1]
      );
    }

    // Stage 5: Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'vintage':
          comparison = a.vintage - b.vintage;
          break;
        case 'rating':
          comparison = (a.rating ?? 0) - (b.rating ?? 0);
          break;
        case 'createdAt':
          // Keep original order for createdAt (already sorted by DB)
          comparison = 0;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [wines, searchText, selectedColors, selectedCountry, vintageRange, sortBy, sortDirection]);

  const handleClearFilters = (): void => {
    setSearchText('');
    setSelectedColors([]);
    setSelectedCountry(null);
    setVintageRange(null);
    setSortBy('createdAt');
    setSortDirection('desc');
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const wine = {
      name: formData.get('name'),
      vintage: parseInt(formData.get('vintage') as string),
      producer: formData.get('producer'),
      country: formData.get('country'),
      color: formData.get('color'),
      quantity: parseInt(formData.get('quantity') as string) || 1,
    };

    try {
      await fetch('/api/wines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wine),
      });
      setShowForm(false);
      void fetchWines();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error adding wine:', error);
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
                  backgroundColor: '#C73E3A',
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

      {/* Action Bar */}
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#4A1C26' }}>
          {wines.length} {wines.length === 1 ? 'Bottle' : 'Bottles'} in Collection
        </h2>
        {showForm ? (
          <button
            onClick={() => setShowForm(false)}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#7C2D3C',
              border: '1px solid #7C2D3C',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#F5F1E8';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#7C2D3C',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(124, 45, 60, 0.2)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#5f2330';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#7C2D3C';
            }}
          >
            + Add Wine
          </button>
        )}
      </div>

      {/* Add Wine Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: '24px',
            padding: '24px',
            backgroundColor: '#F5F1E8',
            borderRadius: '8px',
            border: '1px solid #E5DFD0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#4A1C26', fontSize: '18px' }}>
            Add New Wine
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#4A1C26',
                }}
              >
                Wine Name *
              </label>
              <input
                name="name"
                required
                placeholder="e.g., Chateau Margaux"
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

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#4A1C26',
                }}
              >
                Vintage *
              </label>
              <input
                name="vintage"
                type="number"
                required
                placeholder="2015"
                min="1900"
                max={new Date().getFullYear()}
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
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#4A1C26',
                }}
              >
                Producer *
              </label>
              <input
                name="producer"
                required
                placeholder="e.g., Opus One"
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

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#4A1C26',
                }}
              >
                Country *
              </label>
              <input
                name="country"
                required
                placeholder="e.g., France"
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
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#4A1C26',
                }}
              >
                Wine Color *
              </label>
              <select
                name="color"
                required
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
                <option value="RED">Red</option>
                <option value="WHITE">White</option>
                <option value="ROSE">Rosé</option>
                <option value="SPARKLING">Sparkling</option>
                <option value="DESSERT">Dessert</option>
                <option value="FORTIFIED">Fortified</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#4A1C26',
                }}
              >
                Quantity
              </label>
              <input
                name="quantity"
                type="number"
                defaultValue={1}
                min="1"
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
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              backgroundColor: '#7C2D3C',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#5f2330';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#7C2D3C';
            }}
          >
            Save Wine
          </button>
        </form>
      )}

      {/* Filters */}
      {wines.length > 0 && (
        <WineFilters
          searchText={searchText}
          onSearchChange={setSearchText}
          selectedColors={selectedColors}
          onColorsChange={setSelectedColors}
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          countries={countries}
          vintageRange={vintageRange}
          onVintageRangeChange={setVintageRange}
          vintageMin={vintageMin}
          vintageMax={vintageMax}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={(newSortBy, newDirection) => {
            setSortBy(newSortBy as 'name' | 'vintage' | 'rating' | 'createdAt');
            setSortDirection(newDirection);
          }}
          onClearAll={handleClearFilters}
          totalCount={wines.length}
          filteredCount={filteredAndSortedWines.length}
        />
      )}

      {/* Wine List */}
      <WineTable
        wines={filteredAndSortedWines}
        onDelete={handleDelete}
        onRowClick={setSelectedWine}
      />

      {/* Wine Detail Modal */}
      <WineDetailModal
        wine={selectedWine}
        onClose={() => setSelectedWine(null)}
        onUpdate={handleUpdateWine}
      />
    </div>
  );
}
