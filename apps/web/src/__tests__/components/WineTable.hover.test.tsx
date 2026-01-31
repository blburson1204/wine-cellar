import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WineTable from '../../components/WineTable';

describe('WineTable - Header and Star Hover Effects', () => {
  const mockOnRowClick = vi.fn();
  const mockOnSort = vi.fn();
  const mockOnToggleFavorite = vi.fn();

  const mockWines = [
    {
      id: '1',
      name: 'Chateau Margaux',
      vintage: 2015,
      producer: 'Margaux Estate',
      region: 'Bordeaux',
      country: 'France',
      grapeVariety: 'Cabernet Sauvignon',
      blendDetail: null,
      color: 'RED',
      quantity: 2,
      purchasePrice: 150.0,
      purchaseDate: '2020-01-15T00:00:00.000Z',
      drinkByDate: '2030-12-31T00:00:00.000Z',
      rating: 4.5,
      notes: 'Excellent wine',
      expertRatings: null,
      wherePurchased: null,
      imageUrl: null,
      wineLink: null,
      favorite: false,
    },
    {
      id: '2',
      name: 'Cloudy Bay',
      vintage: 2022,
      producer: 'Cloudy Bay',
      region: 'Marlborough',
      country: 'New Zealand',
      grapeVariety: 'Sauvignon Blanc',
      blendDetail: null,
      color: 'WHITE',
      quantity: 3,
      purchasePrice: 35.0,
      purchaseDate: null,
      drinkByDate: null,
      rating: 4.0,
      notes: null,
      expertRatings: null,
      wherePurchased: null,
      imageUrl: null,
      wineLink: null,
      favorite: true,
    },
  ];

  const defaultProps = {
    wines: mockWines,
    onRowClick: mockOnRowClick,
    onToggleFavorite: mockOnToggleFavorite,
    sortBy: 'name' as const,
    sortDirection: 'asc' as const,
    onSort: mockOnSort,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Column Header Hover Effects', () => {
    it('changes Vintage header background on hover', () => {
      render(<WineTable {...defaultProps} />);
      const header = screen.getByText('Vintage').closest('th')!;

      fireEvent.mouseOver(header);
      expect(header.style.backgroundColor).toBe('rgb(90, 2, 16)');

      fireEvent.mouseOut(header);
      expect(header.style.backgroundColor).toBe('transparent');
    });

    it('changes Wine header background on hover', () => {
      render(<WineTable {...defaultProps} />);
      const header = screen.getByText('Wine').closest('th')!;

      fireEvent.mouseOver(header);
      expect(header.style.backgroundColor).toBe('rgb(90, 2, 16)');

      fireEvent.mouseOut(header);
      expect(header.style.backgroundColor).toBe('transparent');
    });

    it('changes Type header background on hover', () => {
      render(<WineTable {...defaultProps} />);
      const header = screen.getByText('Type').closest('th')!;

      fireEvent.mouseOver(header);
      expect(header.style.backgroundColor).toBe('rgb(90, 2, 16)');

      fireEvent.mouseOut(header);
      expect(header.style.backgroundColor).toBe('transparent');
    });

    it('changes Region header background on hover', () => {
      render(<WineTable {...defaultProps} />);
      const header = screen.getByText('Region').closest('th')!;

      fireEvent.mouseOver(header);
      expect(header.style.backgroundColor).toBe('rgb(90, 2, 16)');

      fireEvent.mouseOut(header);
      expect(header.style.backgroundColor).toBe('transparent');
    });

    it('changes Grape header background on hover', () => {
      render(<WineTable {...defaultProps} />);
      const header = screen.getByText('Grape').closest('th')!;

      fireEvent.mouseOver(header);
      expect(header.style.backgroundColor).toBe('rgb(90, 2, 16)');

      fireEvent.mouseOut(header);
      expect(header.style.backgroundColor).toBe('transparent');
    });

    it('changes Producer header background on hover', () => {
      render(<WineTable {...defaultProps} />);
      const header = screen.getByText('Producer').closest('th')!;

      fireEvent.mouseOver(header);
      expect(header.style.backgroundColor).toBe('rgb(90, 2, 16)');

      fireEvent.mouseOut(header);
      expect(header.style.backgroundColor).toBe('transparent');
    });

    it('changes Country header background on hover', () => {
      render(<WineTable {...defaultProps} />);
      const header = screen.getByText('Country').closest('th')!;

      fireEvent.mouseOver(header);
      expect(header.style.backgroundColor).toBe('rgb(90, 2, 16)');

      fireEvent.mouseOut(header);
      expect(header.style.backgroundColor).toBe('transparent');
    });

    it('changes Rating header background on hover', () => {
      render(<WineTable {...defaultProps} />);
      const header = screen.getByText('Rating').closest('th')!;

      fireEvent.mouseOver(header);
      expect(header.style.backgroundColor).toBe('rgb(90, 2, 16)');

      fireEvent.mouseOut(header);
      expect(header.style.backgroundColor).toBe('transparent');
    });

    it('changes In Cellar header background on hover', () => {
      render(<WineTable {...defaultProps} />);
      const header = screen.getByText('In Cellar').closest('th')!;

      fireEvent.mouseOver(header);
      expect(header.style.backgroundColor).toBe('rgb(90, 2, 16)');

      fireEvent.mouseOut(header);
      expect(header.style.backgroundColor).toBe('transparent');
    });

    it('changes Price header background on hover', () => {
      render(<WineTable {...defaultProps} />);
      const header = screen.getByText('Price').closest('th')!;

      fireEvent.mouseOver(header);
      expect(header.style.backgroundColor).toBe('rgb(90, 2, 16)');

      fireEvent.mouseOut(header);
      expect(header.style.backgroundColor).toBe('transparent');
    });
  });

  describe('Favorite Star Hover Effects', () => {
    it('shows hover color on unfavorited star mouse over', () => {
      render(<WineTable {...defaultProps} />);

      // Find the unfavorited star (☆)
      const stars = screen.getAllByText('☆');
      const starSpan = stars[0];

      fireEvent.mouseOver(starSpan);
      expect(starSpan.style.color).toBe('rgba(230, 57, 70, 0.6)');
    });

    it('restores color on unfavorited star mouse out', () => {
      render(<WineTable {...defaultProps} />);

      const stars = screen.getAllByText('☆');
      const starSpan = stars[0];

      fireEvent.mouseOver(starSpan);
      fireEvent.mouseOut(starSpan);

      expect(starSpan.style.color).toBe('rgba(255, 255, 255, 0.3)');
    });

    it('does not change color on favorited star mouse over', () => {
      render(<WineTable {...defaultProps} />);

      // Find the favorited star (★)
      const filledStar = screen.getByText('★');

      fireEvent.mouseOver(filledStar);
      // Favorited stars keep their color - the onMouseOver only changes unfavorited
      expect(filledStar.style.color).not.toBe('rgba(230, 57, 70, 0.6)');
    });

    it('restores favorite star color on mouse out', () => {
      render(<WineTable {...defaultProps} />);

      const filledStar = screen.getByText('★');

      fireEvent.mouseOver(filledStar);
      fireEvent.mouseOut(filledStar);

      expect(filledStar.style.color).toBe('rgb(230, 57, 70)');
    });
  });
});
