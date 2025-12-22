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
    } catch (error) {
      console.error('Error adding wine:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this wine?')) return;
    try {
      await fetch(`/api/wines/${id}`, { method: 'DELETE' });
      fetchWines();
    } catch (error) {
      console.error('Error deleting wine:', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          cursor: 'pointer',
        }}
      >
        {showForm ? 'Cancel' : 'Add Wine'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label>Name: <input name="name" required style={{ marginLeft: '10px' }} /></label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Vintage: <input name="vintage" type="number" required style={{ marginLeft: '10px' }} /></label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Producer: <input name="producer" required style={{ marginLeft: '10px' }} /></label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Country: <input name="country" required style={{ marginLeft: '10px' }} /></label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Color:
              <select name="color" required style={{ marginLeft: '10px' }}>
                <option value="RED">Red</option>
                <option value="WHITE">White</option>
                <option value="ROSE">Rose</option>
                <option value="SPARKLING">Sparkling</option>
                <option value="DESSERT">Dessert</option>
                <option value="FORTIFIED">Fortified</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Quantity: <input name="quantity" type="number" defaultValue={1} style={{ marginLeft: '10px' }} /></label>
          </div>
          <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Save</button>
        </form>
      )}

      {wines.length === 0 ? (
        <p>No wines in your cellar yet. Add your first bottle!</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#333', color: 'white' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Vintage</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Producer</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Country</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Color</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Qty</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {wines.map((wine) => (
              <tr key={wine.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{wine.name}</td>
                <td style={{ padding: '10px' }}>{wine.vintage}</td>
                <td style={{ padding: '10px' }}>{wine.producer}</td>
                <td style={{ padding: '10px' }}>{wine.country}</td>
                <td style={{ padding: '10px' }}>{wine.color}</td>
                <td style={{ padding: '10px' }}>{wine.quantity}</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleDelete(wine.id)} style={{ cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
