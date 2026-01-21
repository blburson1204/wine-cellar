import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import WineTable from '../src/components/WineTable';

describe('WineTable', () => {
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
      imageUrl: null,
      wineLink: null,
      favorite: false,
    },
    {
      id: '2',
      name: 'Cloudy Bay Sauvignon Blanc',
      vintage: 2022,
      producer: 'Cloudy Bay',
      region: 'Marlborough',
      country: 'New Zealand',
      grapeVariety: 'Sauvignon Blanc',
      blendDetail: null,
      color: 'WHITE',
      quantity: 3,
      purchasePrice: 35.0,
      purchaseDate: '2023-05-10T00:00:00.000Z',
      drinkByDate: '2025-12-31T00:00:00.000Z',
      rating: 4.0,
      notes: 'Fresh and crisp',
      imageUrl: null,
      wineLink: null,
      favorite: true,
    },
    {
      id: '3',
      name: 'Dom Perignon',
      vintage: 2012,
      producer: 'Moet & Chandon',
      region: 'Champagne',
      country: 'France',
      grapeVariety: 'Chardonnay/Pinot Noir',
      blendDetail: null,
      color: 'SPARKLING',
      quantity: 1,
      purchasePrice: null,
      purchaseDate: null,
      drinkByDate: null,
      rating: null,
      notes: null,
      imageUrl: null,
      wineLink: null,
      favorite: false,
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

  describe('Empty State', () => {
    it('displays empty state when no wines provided', () => {
      render(<WineTable {...defaultProps} wines={[]} />);

      expect(screen.getByText('🍷')).toBeInTheDocument();
      expect(screen.getByText('No wines found')).toBeInTheDocument();
      expect(
        screen.getByText(/Try adjusting your filters or add your first wine/i)
      ).toBeInTheDocument();
    });

    it('does not render table when no wines', () => {
      render(<WineTable {...defaultProps} wines={[]} />);

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Table Rendering', () => {
    it('renders table with correct headers', () => {
      render(<WineTable {...defaultProps} />);

      expect(screen.getByText('Vintage')).toBeInTheDocument();
      expect(screen.getByText('Wine')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Region')).toBeInTheDocument();
      expect(screen.getByText('Grape')).toBeInTheDocument();
      expect(screen.getByText('Producer')).toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Rating')).toBeInTheDocument();
      expect(screen.getByText('In Cellar')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
    });

    it('renders all wine rows', () => {
      render(<WineTable {...defaultProps} />);

      expect(screen.getByText('Chateau Margaux')).toBeInTheDocument();
      expect(screen.getByText('Cloudy Bay Sauvignon Blanc')).toBeInTheDocument();
      expect(screen.getByText('Dom Perignon')).toBeInTheDocument();
    });

    it('displays wine details correctly', () => {
      render(<WineTable {...defaultProps} />);

      // Check first wine details
      expect(screen.getByText('Margaux Estate')).toBeInTheDocument();
      expect(screen.getAllByText('France')[0]).toBeInTheDocument();
      expect(screen.getByText('2015')).toBeInTheDocument();
      expect(screen.getAllByText('Yes')[0]).toBeInTheDocument(); // quantity > 0 shows "Yes"
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    it('displays wine types correctly', () => {
      render(<WineTable {...defaultProps} />);

      expect(screen.getByText('Red')).toBeInTheDocument();
      expect(screen.getByText('White')).toBeInTheDocument();
      expect(screen.getByText('Sparkling')).toBeInTheDocument();
    });

    it('displays em dash for null price', () => {
      render(<WineTable {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      // Last row (Dom Perignon) should have em dash for price
      const lastRow = rows[rows.length - 1];
      expect(lastRow).toHaveTextContent('—');
    });
  });

  describe('Row Click', () => {
    it('calls onRowClick when wine row clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const wineRow = screen.getByText('Chateau Margaux').closest('tr');
      expect(wineRow).toBeInTheDocument();

      await user.click(wineRow!);

      expect(mockOnRowClick).toHaveBeenCalledTimes(1);
      expect(mockOnRowClick).toHaveBeenCalledWith(mockWines[0]);
    });

    it('calls onRowClick with correct wine when different rows clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const wine1Row = screen.getByText('Chateau Margaux').closest('tr');
      const wine2Row = screen.getByText('Cloudy Bay Sauvignon Blanc').closest('tr');

      await user.click(wine1Row!);
      expect(mockOnRowClick).toHaveBeenCalledWith(mockWines[0]);

      await user.click(wine2Row!);
      expect(mockOnRowClick).toHaveBeenCalledWith(mockWines[1]);
    });
  });

  describe('Sorting', () => {
    it('displays ascending sort indicator for active column', () => {
      render(<WineTable {...defaultProps} sortBy="name" sortDirection="asc" />);

      const wineHeader = screen.getByText('Wine').parentElement;
      expect(wineHeader).toHaveTextContent('↑');
    });

    it('displays descending sort indicator for active column', () => {
      render(<WineTable {...defaultProps} sortBy="name" sortDirection="desc" />);

      const wineHeader = screen.getByText('Wine').parentElement;
      expect(wineHeader).toHaveTextContent('↓');
    });

    it('does not display sort indicator for inactive columns', () => {
      render(<WineTable {...defaultProps} sortBy="name" sortDirection="asc" />);

      const producerHeader = screen.getByText('Producer').parentElement;
      const vintageHeader = screen.getByText('Vintage').parentElement;
      const priceHeader = screen.getByText('Price').parentElement;

      expect(producerHeader).not.toHaveTextContent('↑');
      expect(producerHeader).not.toHaveTextContent('↓');
      expect(vintageHeader).not.toHaveTextContent('↑');
      expect(vintageHeader).not.toHaveTextContent('↓');
      expect(priceHeader).not.toHaveTextContent('↑');
      expect(priceHeader).not.toHaveTextContent('↓');
    });

    it('calls onSort when Wine header clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const wineHeader = screen.getByText('Wine').parentElement;
      await user.click(wineHeader!);

      expect(mockOnSort).toHaveBeenCalledTimes(1);
      expect(mockOnSort).toHaveBeenCalledWith('name');
    });

    it('calls onSort when Producer header clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const producerHeader = screen.getByText('Producer').parentElement;
      await user.click(producerHeader!);

      expect(mockOnSort).toHaveBeenCalledTimes(1);
      expect(mockOnSort).toHaveBeenCalledWith('producer');
    });

    it('calls onSort when Vintage header clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const vintageHeader = screen.getByText('Vintage').parentElement;
      await user.click(vintageHeader!);

      expect(mockOnSort).toHaveBeenCalledTimes(1);
      expect(mockOnSort).toHaveBeenCalledWith('vintage');
    });

    it('calls onSort when Price header clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const priceHeader = screen.getByText('Price').parentElement;
      await user.click(priceHeader!);

      expect(mockOnSort).toHaveBeenCalledTimes(1);
      expect(mockOnSort).toHaveBeenCalledWith('price');
    });

    it('calls onSort when Rating header clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const ratingHeader = screen.getByText('Rating').parentElement;
      await user.click(ratingHeader!);

      expect(mockOnSort).toHaveBeenCalledTimes(1);
      expect(mockOnSort).toHaveBeenCalledWith('rating');
    });

    it('does not call onSort when Type header clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const typeHeader = screen.getByText('Type').parentElement;
      await user.click(typeHeader!);

      expect(mockOnSort).not.toHaveBeenCalled();
    });

    it('does not call onSort when Country header clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const countryHeader = screen.getByText('Country').parentElement;
      await user.click(countryHeader!);

      expect(mockOnSort).not.toHaveBeenCalled();
    });

    it('does not call onSort when In Cellar header clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const inCellarHeader = screen.getByText('In Cellar').parentElement;
      await user.click(inCellarHeader!);

      expect(mockOnSort).not.toHaveBeenCalled();
    });
  });

  describe('Wine Colors', () => {
    it('displays wine type label for RED wine', () => {
      const redWine = [
        {
          ...mockWines[0],
          color: 'RED',
        },
      ];

      render(<WineTable {...defaultProps} wines={redWine} />);

      // Check that the wine type is displayed in the Type column with mixed case
      expect(screen.getByText('Red')).toBeInTheDocument();
    });

    it('displays wine type label for WHITE wine', () => {
      const whiteWine = [
        {
          ...mockWines[1],
          color: 'WHITE',
        },
      ];

      render(<WineTable {...defaultProps} wines={whiteWine} />);

      // Check that the wine type is displayed in the Type column with mixed case
      expect(screen.getByText('White')).toBeInTheDocument();
    });

    it('displays wine type label for SPARKLING wine', () => {
      const sparklingWine = [
        {
          ...mockWines[2],
          color: 'SPARKLING',
        },
      ];

      render(<WineTable {...defaultProps} wines={sparklingWine} />);

      // Check that the wine type is displayed in the Type column with mixed case
      expect(screen.getByText('Sparkling')).toBeInTheDocument();
    });
  });

  describe('Price Formatting', () => {
    it('formats price with two decimal places', () => {
      render(<WineTable {...defaultProps} />);

      expect(screen.getByText('$150.00')).toBeInTheDocument();
      expect(screen.getByText('$35.00')).toBeInTheDocument();
    });

    it('displays em dash when price is null', () => {
      const wineWithNullPrice = [
        {
          ...mockWines[0],
          purchasePrice: null,
        },
      ];

      render(<WineTable {...defaultProps} wines={wineWithNullPrice} />);

      const rows = screen.getAllByRole('row');
      const dataRow = rows[1]; // First data row (after header)
      expect(dataRow).toHaveTextContent('—');
    });

    it('displays em dash when price is undefined', () => {
      const wineWithUndefinedPrice = [
        {
          ...mockWines[0],
          purchasePrice: undefined as unknown as null,
        },
      ];

      render(<WineTable {...defaultProps} wines={wineWithUndefinedPrice} />);

      const rows = screen.getAllByRole('row');
      const dataRow = rows[1];
      expect(dataRow).toHaveTextContent('—');
    });
  });

  describe('Sort Direction Changes', () => {
    it('updates sort indicator when direction changes from asc to desc', () => {
      const { rerender } = render(
        <WineTable {...defaultProps} sortBy="vintage" sortDirection="asc" />
      );

      const vintageHeader = screen.getByText('Vintage').parentElement;
      expect(vintageHeader).toHaveTextContent('↑');

      rerender(<WineTable {...defaultProps} sortBy="vintage" sortDirection="desc" />);

      expect(vintageHeader).toHaveTextContent('↓');
    });

    it('updates sort indicator when active column changes', () => {
      const { rerender } = render(
        <WineTable {...defaultProps} sortBy="name" sortDirection="asc" />
      );

      const wineHeader = screen.getByText('Wine').parentElement;
      const priceHeader = screen.getByText('Price').parentElement;

      expect(wineHeader).toHaveTextContent('↑');
      expect(priceHeader).not.toHaveTextContent('↑');

      rerender(<WineTable {...defaultProps} sortBy="price" sortDirection="asc" />);

      expect(wineHeader).not.toHaveTextContent('↑');
      expect(priceHeader).toHaveTextContent('↑');
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates down with ArrowDown key', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      // First row should be focused initially
      const rows = screen.getAllByRole('row').slice(1); // Skip header row
      expect(rows[0]).toHaveAttribute('tabIndex', '0');
      expect(rows[1]).toHaveAttribute('tabIndex', '-1');

      // Press arrow down
      await user.keyboard('{ArrowDown}');

      // Second row should now be focused
      expect(rows[0]).toHaveAttribute('tabIndex', '-1');
      expect(rows[1]).toHaveAttribute('tabIndex', '0');
    });

    it('navigates up with ArrowUp key', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const rows = screen.getAllByRole('row').slice(1);

      // Navigate down first
      await user.keyboard('{ArrowDown}');
      expect(rows[1]).toHaveAttribute('tabIndex', '0');

      // Navigate back up
      await user.keyboard('{ArrowUp}');
      expect(rows[0]).toHaveAttribute('tabIndex', '0');
    });

    it('does not go below the last row', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const rows = screen.getAllByRole('row').slice(1);

      // Navigate to last row
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      expect(rows[2]).toHaveAttribute('tabIndex', '0');

      // Try to go past last row
      await user.keyboard('{ArrowDown}');
      expect(rows[2]).toHaveAttribute('tabIndex', '0'); // Should stay on last row
    });

    it('does not go above the first row', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const rows = screen.getAllByRole('row').slice(1);

      // Try to go above first row
      await user.keyboard('{ArrowUp}');
      expect(rows[0]).toHaveAttribute('tabIndex', '0'); // Should stay on first row
    });

    it('opens wine details with Enter key', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      // Press Enter to open first wine
      await user.keyboard('{Enter}');

      expect(mockOnRowClick).toHaveBeenCalledWith(mockWines[0]);
    });

    it('opens correct wine after navigation with Enter', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      // Navigate to second row and press Enter
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(mockOnRowClick).toHaveBeenCalledWith(mockWines[1]);
    });

    it('does not navigate when wines list is empty', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} wines={[]} />);

      // These should not throw errors
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      await user.keyboard('{Enter}');

      expect(mockOnRowClick).not.toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('resets focus index when wines list changes and focused index is out of bounds', () => {
      const { rerender } = render(<WineTable {...defaultProps} />);

      // Rerender with fewer wines - should reset focus to 0
      const fewerWines = [mockWines[0]];
      rerender(<WineTable {...defaultProps} wines={fewerWines} />);

      const rows = screen.getAllByRole('row').slice(1);
      expect(rows[0]).toHaveAttribute('tabIndex', '0');
    });

    it('updates focus when row is clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const rows = screen.getAllByRole('row').slice(1);

      // Click on second row
      await user.click(rows[1]);

      expect(rows[1]).toHaveAttribute('tabIndex', '0');
      expect(rows[0]).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Favorite Toggle', () => {
    it('calls onToggleFavorite when favorite star is clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      // Find the first unfavorited star (☆)
      const stars = screen.getAllByText('☆');
      await user.click(stars[0]);

      expect(mockOnToggleFavorite).toHaveBeenCalledWith(mockWines[0]);
    });

    it('calls onToggleFavorite when favorited star is clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      // Find the favorited star (★) - second wine is favorited
      const filledStar = screen.getByText('★');
      await user.click(filledStar);

      expect(mockOnToggleFavorite).toHaveBeenCalledWith(mockWines[1]);
    });

    it('does not trigger row click when favorite star is clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const stars = screen.getAllByText('☆');
      await user.click(stars[0]);

      // onToggleFavorite should be called, but not onRowClick
      expect(mockOnToggleFavorite).toHaveBeenCalled();
      expect(mockOnRowClick).not.toHaveBeenCalled();
    });

    it('displays filled star for favorited wines', () => {
      render(<WineTable {...defaultProps} />);

      // Second wine is favorited
      expect(screen.getByText('★')).toBeInTheDocument();
    });

    it('displays empty star for non-favorited wines', () => {
      render(<WineTable {...defaultProps} />);

      // First and third wines are not favorited
      expect(screen.getAllByText('☆')).toHaveLength(2);
    });
  });

  describe('Row Hover Effects', () => {
    it('changes row style on mouse over', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const row = screen.getByText('Chateau Margaux').closest('tr')!;

      await user.hover(row);

      expect(row.style.backgroundColor).toBe('rgb(122, 2, 21)');
      expect(row.style.fontWeight).toBe('700');
    });

    it('restores row style on mouse out for non-focused row', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      // Second row is not focused
      const row = screen.getByText('Cloudy Bay Sauvignon Blanc').closest('tr')!;

      await user.hover(row);
      await user.unhover(row);

      expect(row.style.backgroundColor).toBe('rgb(34, 26, 19)');
      expect(row.style.fontWeight).toBe('400');
    });

    it('maintains highlight style on mouse out for focused row', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      // First row is focused by default
      const row = screen.getByText('Chateau Margaux').closest('tr')!;

      await user.hover(row);
      await user.unhover(row);

      // Should maintain focused style
      expect(row.style.backgroundColor).toBe('rgb(122, 2, 21)');
      expect(row.style.fontWeight).toBe('700');
    });
  });

  describe('Null/Undefined Value Display', () => {
    it('displays em dash for null region', () => {
      const wineWithNullRegion = [
        {
          ...mockWines[0],
          region: null,
        },
      ];

      render(<WineTable {...defaultProps} wines={wineWithNullRegion} />);

      const rows = screen.getAllByRole('row');
      const dataRow = rows[1];
      // Region column should show em dash
      expect(dataRow).toHaveTextContent('—');
    });

    it('displays em dash for null grape variety', () => {
      const wineWithNullGrape = [
        {
          ...mockWines[0],
          grapeVariety: null,
        },
      ];

      render(<WineTable {...defaultProps} wines={wineWithNullGrape} />);

      const rows = screen.getAllByRole('row');
      const dataRow = rows[1];
      expect(dataRow).toHaveTextContent('—');
    });

    it('displays em dash for null rating', () => {
      const wineWithNullRating = [
        {
          ...mockWines[0],
          rating: null,
        },
      ];

      render(<WineTable {...defaultProps} wines={wineWithNullRating} />);

      const rows = screen.getAllByRole('row');
      const dataRow = rows[1];
      expect(dataRow).toHaveTextContent('—');
    });

    it('displays No for zero quantity', () => {
      const wineWithZeroQuantity = [
        {
          ...mockWines[0],
          quantity: 0,
        },
      ];

      render(<WineTable {...defaultProps} wines={wineWithZeroQuantity} />);

      expect(screen.getByText('No')).toBeInTheDocument();
    });
  });

  describe('Additional Wine Colors', () => {
    it('displays wine type label for ROSE wine', () => {
      const roseWine = [
        {
          ...mockWines[0],
          color: 'ROSE',
        },
      ];

      render(<WineTable {...defaultProps} wines={roseWine} />);

      expect(screen.getByText('Rosé')).toBeInTheDocument();
    });

    it('displays wine type label for DESSERT wine', () => {
      const dessertWine = [
        {
          ...mockWines[0],
          color: 'DESSERT',
        },
      ];

      render(<WineTable {...defaultProps} wines={dessertWine} />);

      expect(screen.getByText('Dessert')).toBeInTheDocument();
    });

    it('displays wine type label for FORTIFIED wine', () => {
      const fortifiedWine = [
        {
          ...mockWines[0],
          color: 'FORTIFIED',
        },
      ];

      render(<WineTable {...defaultProps} wines={fortifiedWine} />);

      expect(screen.getByText('Fortified')).toBeInTheDocument();
    });

    it('displays raw color value for unknown color types', () => {
      const unknownColorWine = [
        {
          ...mockWines[0],
          color: 'ORANGE',
        },
      ];

      render(<WineTable {...defaultProps} wines={unknownColorWine} />);

      expect(screen.getByText('ORANGE')).toBeInTheDocument();
    });
  });

  describe('MaxHeight Prop', () => {
    it('applies maxHeight when provided', () => {
      render(<WineTable {...defaultProps} maxHeight="500px" />);

      const tableContainer = screen.getByRole('table').parentElement;
      expect(tableContainer).toHaveStyle({ maxHeight: '500px' });
    });

    it('does not apply maxHeight when not provided', () => {
      render(<WineTable {...defaultProps} />);

      const tableContainer = screen.getByRole('table').parentElement;
      expect(tableContainer).toHaveStyle({ maxHeight: '' });
    });
  });
});
