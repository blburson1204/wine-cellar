import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WineCard from '../../components/WineCard';

const mockWine = {
  id: '1',
  name: 'Chateau Margaux',
  vintage: 2019,
  producer: 'Chateau Margaux',
  region: 'Bordeaux',
  country: 'France',
  grapeVariety: 'Cabernet Sauvignon',
  blendDetail: null,
  color: 'RED',
  quantity: 6,
  purchasePrice: 350,
  purchaseDate: '2021-06-15',
  drinkByDate: '2035-12-31',
  rating: 95,
  notes: 'Exceptional vintage',
  expertRatings: null,
  wherePurchased: null,
  wineLink: null,
  favorite: false,
  imageUrl: null,
};

describe('WineCard', () => {
  const defaultProps = {
    wine: mockWine,
    onClick: vi.fn(),
    onToggleFavorite: vi.fn(),
  };

  describe('Rendering - 4-Line Layout (FR-001, FR-002)', () => {
    it('renders all wine fields', () => {
      render(<WineCard {...defaultProps} />);
      expect(screen.getAllByText('Chateau Margaux').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('button', { name: /favorite/i })).toBeInTheDocument();
      expect(screen.getByText('2019')).toBeInTheDocument();
      expect(screen.getByText('Red')).toBeInTheDocument();
      expect(screen.getByText('Cabernet Sauvignon')).toBeInTheDocument();
      expect(screen.getByText('Bordeaux')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
    });
  });

  describe('Rating, In Cellar, Price fields', () => {
    it('renders rating when present', () => {
      render(<WineCard {...defaultProps} />);
      expect(screen.getByText('95')).toBeInTheDocument();
    });

    it('renders In Cellar when quantity > 0', () => {
      render(<WineCard {...defaultProps} />);
      expect(screen.getByText('In Cellar')).toBeInTheDocument();
    });

    it('renders Not in Cellar when quantity is 0', () => {
      const outOfStockWine = { ...mockWine, quantity: 0 };
      render(<WineCard {...defaultProps} wine={outOfStockWine} />);
      expect(screen.getByText('Not in Cellar')).toBeInTheDocument();
    });

    it('renders price when present', () => {
      render(<WineCard {...defaultProps} />);
      expect(screen.getByText('$350.00')).toBeInTheDocument();
    });

    it('omits rating when null', () => {
      const noRatingWine = { ...mockWine, rating: null };
      render(<WineCard {...defaultProps} wine={noRatingWine} />);
      expect(screen.queryByText('95')).not.toBeInTheDocument();
      // Other fields still present
      expect(screen.getByText('In Cellar')).toBeInTheDocument();
      expect(screen.getByText('$350.00')).toBeInTheDocument();
    });

    it('omits price when null', () => {
      const noPriceWine = { ...mockWine, purchasePrice: null };
      render(<WineCard {...defaultProps} wine={noPriceWine} />);
      expect(screen.queryByText('$350.00')).not.toBeInTheDocument();
      // Other fields still present
      expect(screen.getByText('95')).toBeInTheDocument();
      expect(screen.getByText('In Cellar')).toBeInTheDocument();
    });
  });

  describe('Null Field Handling', () => {
    it('handles null region gracefully', () => {
      const wineWithNullRegion = { ...mockWine, region: null };
      render(<WineCard {...defaultProps} wine={wineWithNullRegion} />);
      // Should not crash, and country should still be visible
      expect(screen.getByText('France')).toBeInTheDocument();
    });

    it('handles null grape variety gracefully', () => {
      const wineWithNullGrape = { ...mockWine, grapeVariety: null };
      render(<WineCard {...defaultProps} wine={wineWithNullGrape} />);
      // Should not crash, and type should still be visible
      expect(screen.getByText('Red')).toBeInTheDocument();
    });
  });

  describe('Color Display', () => {
    it.each([
      ['RED', 'Red'],
      ['WHITE', 'White'],
      ['ROSE', 'Rosé'],
      ['SPARKLING', 'Sparkling'],
    ])('displays %s as "%s"', (color, label) => {
      const wine = { ...mockWine, color };
      render(<WineCard {...defaultProps} wine={wine} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  describe('Favorite State Display', () => {
    it('shows filled heart when wine is favorite', () => {
      const favoriteWine = { ...mockWine, favorite: true };
      render(<WineCard {...defaultProps} wine={favoriteWine} />);
      const button = screen.getByRole('button', { name: /favorite/i });
      // Check for filled heart indicator (aria-pressed or specific class)
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows outline heart when wine is not favorite', () => {
      render(<WineCard {...defaultProps} />);
      const button = screen.getByRole('button', { name: /favorite/i });
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Text Truncation', () => {
    it('truncates long wine names with ellipsis', () => {
      const longNameWine = {
        ...mockWine,
        name: 'This is a very long wine name that should definitely be truncated on a mobile card view',
      };
      render(<WineCard {...defaultProps} wine={longNameWine} />);
      // Name element should have truncate class
      const nameElement = screen.getByText(longNameWine.name);
      expect(nameElement).toHaveClass('truncate');
    });
  });

  describe('Accessibility', () => {
    it('includes wine name in accessible label', () => {
      render(<WineCard {...defaultProps} />);
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('Chateau Margaux'));
    });
  });
});
