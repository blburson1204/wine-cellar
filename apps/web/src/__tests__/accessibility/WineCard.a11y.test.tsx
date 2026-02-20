import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import WineCard from '../../components/WineCard';

const mockWine = {
  id: '1',
  name: 'Chateau Test',
  vintage: 2020,
  producer: 'Test Producer',
  region: 'Bordeaux',
  country: 'France',
  grapeVariety: 'Cabernet Sauvignon',
  blendDetail: null,
  color: 'RED' as const,
  quantity: 6,
  purchasePrice: 50,
  purchaseDate: '2022-01-15',
  drinkByDate: '2030-12-31',
  rating: 90,
  notes: 'Test notes',
  expertRatings: null,
  wherePurchased: 'Wine Shop',
  wineLink: null,
  favorite: false,
  imageUrl: null,
};

describe('WineCard Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <WineCard wine={mockWine} onClick={vi.fn()} onToggleFavorite={vi.fn()} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations with null optional fields', async () => {
    const { container } = render(
      <WineCard
        wine={{
          ...mockWine,
          purchasePrice: null,
          rating: null,
          quantity: 0,
        }}
        onClick={vi.fn()}
        onToggleFavorite={vi.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
