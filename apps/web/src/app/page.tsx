'use client';

import { useEffect, useState } from 'react';

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
  rating: number | null;
  notes: string | null;
}

const WINE_COLORS: Record<string, string> = {
  RED: '#7C2D3C',
  WHITE: '#F5F1E8',
  ROSE: '#D4A5A5',
  SPARKLING: '#FFD700',
  DESSERT: '#8B4513',
  FORTIFIED: '#4A1C26'
};

export default function Home() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchWines();
  }, []);

  const fetchWines = async () => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      fetchWines();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error adding wine:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this wine from your cellar?')) return;
    try {
      await fetch(`/api/wines/${id}`, { method: 'DELETE' });
      fetchWines();
    } catch (error) {
      console.error('Error deleting wine:', error);
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
      {/* Action Bar */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              transition: 'all 0.2s'
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
              boxShadow: '0 2px 4px rgba(124, 45, 60, 0.2)'
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
            marginBottom: '32px',
            padding: '24px',
            backgroundColor: '#F5F1E8',
            borderRadius: '8px',
            border: '1px solid #E5DFD0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#4A1C26', fontSize: '18px' }}>Add New Wine</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#4A1C26' }}>
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
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#4A1C26' }}>
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
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#4A1C26' }}>
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
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#4A1C26' }}>
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
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#4A1C26' }}>
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
                  boxSizing: 'border-box'
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
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#4A1C26' }}>
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
                  boxSizing: 'border-box'
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
              transition: 'all 0.2s'
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

      {/* Wine List */}
      {wines.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '64px 24px',
          backgroundColor: '#F5F1E8',
          borderRadius: '8px',
          border: '1px solid #E5DFD0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🍷</div>
          <h3 style={{ color: '#4A1C26', fontSize: '20px', marginBottom: '8px' }}>Your cellar is empty</h3>
          <p style={{ color: '#7C2D3C', fontSize: '16px', marginBottom: '24px' }}>Add your first bottle to start building your collection!</p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#7C2D3C',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            + Add Your First Wine
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <thead>
              <tr style={{ backgroundColor: '#4A1C26', color: 'white' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Wine</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Vintage</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Producer</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Country</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Qty</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wines.map((wine, index) => (
                <tr
                  key={wine.id}
                  style={{
                    borderBottom: index < wines.length - 1 ? '1px solid #E5DFD0' : 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F1E8';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: WINE_COLORS[wine.color] || '#7C2D3C',
                        border: wine.color === 'WHITE' ? '1px solid #D4A5A5' : 'none',
                        flexShrink: 0
                      }}
                    />
                    <span style={{ fontWeight: '500', color: '#4A1C26' }}>{wine.name}</span>
                  </td>
                  <td style={{ padding: '16px', color: '#4A1C26' }}>{wine.vintage}</td>
                  <td style={{ padding: '16px', color: '#4A1C26' }}>{wine.producer}</td>
                  <td style={{ padding: '16px', color: '#4A1C26' }}>{wine.country}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#F5F1E8',
                      color: '#7C2D3C',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {wine.color}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', color: '#4A1C26', fontWeight: '500' }}>
                    {wine.quantity}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(wine.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#C73E3A',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#a33330';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#C73E3A';
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
