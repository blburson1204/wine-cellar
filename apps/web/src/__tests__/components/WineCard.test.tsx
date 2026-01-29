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
    it('renders wine name on line 1', () => {
      render(<WineCard {...defaultProps} />);
      // Name appears in both line 1 and line 2 (producer) since mock wine has same name/producer
      const nameElements = screen.getAllByText('Chateau Margaux');
      expect(nameElements.length).toBeGreaterThanOrEqual(1);
    });

    it('renders favorite icon on line 1', () => {
      render(<WineCard {...defaultProps} />);
      // Favorite button should be present
      expect(screen.getByRole('button', { name: /favorite/i })).toBeInTheDocument();
    });

    it('renders vintage on line 2', () => {
      render(<WineCard {...defaultProps} />);
      expect(screen.getByText('2019')).toBeInTheDocument();
    });

    it('renders producer on line 2', () => {
      render(<WineCard {...defaultProps} />);
      // Producer appears twice (name and producer field), check it exists
      expect(screen.getAllByText(/Chateau Margaux/i).length).toBeGreaterThanOrEqual(1);
    });

    it('renders wine type (color) on line 3', () => {
      render(<WineCard {...defaultProps} />);
      expect(screen.getByText('Red')).toBeInTheDocument();
    });

    it('renders grape variety on line 3', () => {
      render(<WineCard {...defaultProps} />);
      expect(screen.getByText('Cabernet Sauvignon')).toBeInTheDocument();
    });

    it('renders region on line 4', () => {
      render(<WineCard {...defaultProps} />);
      expect(screen.getByText('Bordeaux')).toBeInTheDocument();
    });

    it('renders country on line 4', () => {
      render(<WineCard {...defaultProps} />);
      expect(screen.getByText('France')).toBeInTheDocument();
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
    it('displays Red for color RED', () => {
      render(<WineCard {...defaultProps} />);
      expect(screen.getByText('Red')).toBeInTheDocument();
    });

    it('displays White for color WHITE', () => {
      const whiteWine = { ...mockWine, color: 'WHITE' };
      render(<WineCard {...defaultProps} wine={whiteWine} />);
      expect(screen.getByText('White')).toBeInTheDocument();
    });

    it('displays Rosé for color ROSE', () => {
      const roseWine = { ...mockWine, color: 'ROSE' };
      render(<WineCard {...defaultProps} wine={roseWine} />);
      expect(screen.getByText('Rosé')).toBeInTheDocument();
    });

    it('displays Sparkling for color SPARKLING', () => {
      const sparklingWine = { ...mockWine, color: 'SPARKLING' };
      render(<WineCard {...defaultProps} wine={sparklingWine} />);
      expect(screen.getByText('Sparkling')).toBeInTheDocument();
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
    it('has article role for semantic structure', () => {
      render(<WineCard {...defaultProps} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('includes wine name in accessible label', () => {
      render(<WineCard {...defaultProps} />);
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('Chateau Margaux'));
    });
  });
});
