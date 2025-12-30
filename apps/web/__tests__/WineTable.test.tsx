import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import WineTable from '../src/components/WineTable';

describe('WineTable', () => {
  const mockOnRowClick = vi.fn();
  const mockOnSort = vi.fn();

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
    },
  ];

  const defaultProps = {
    wines: mockWines,
    onRowClick: mockOnRowClick,
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

      expect(screen.getByText('Wine')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Producer')).toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Vintage')).toBeInTheDocument();
      expect(screen.getByText('Qty')).toBeInTheDocument();
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
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    it('displays wine types correctly', () => {
      render(<WineTable {...defaultProps} />);

      expect(screen.getByText('RED')).toBeInTheDocument();
      expect(screen.getByText('WHITE')).toBeInTheDocument();
      expect(screen.getByText('SPARKLING')).toBeInTheDocument();
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

    it('does not call onSort when Qty header clicked', async () => {
      const user = userEvent.setup();
      render(<WineTable {...defaultProps} />);

      const qtyHeader = screen.getByText('Qty').parentElement;
      await user.click(qtyHeader!);

      expect(mockOnSort).not.toHaveBeenCalled();
    });
  });

  describe('Wine Colors', () => {
    it('displays color indicator for RED wine', () => {
      const redWine = [
        {
          ...mockWines[0],
          color: 'RED',
        },
      ];

      const { container } = render(<WineTable {...defaultProps} wines={redWine} />);

      // Check for color dot with RED color
      const colorDot = container.querySelector('[style*="background-color: rgb(124, 45, 60)"]');
      expect(colorDot).toBeInTheDocument();
    });

    it('displays color indicator for WHITE wine with border', () => {
      const whiteWine = [
        {
          ...mockWines[1],
          color: 'WHITE',
        },
      ];

      const { container } = render(<WineTable {...defaultProps} wines={whiteWine} />);

      // Check for color dot with WHITE color
      const colorDot = container.querySelector('[style*="background-color: rgb(245, 241, 232)"]');
      expect(colorDot).toBeInTheDocument();
    });

    it('displays color indicator for SPARKLING wine', () => {
      const sparklingWine = [
        {
          ...mockWines[2],
          color: 'SPARKLING',
        },
      ];

      const { container } = render(<WineTable {...defaultProps} wines={sparklingWine} />);

      // Check for color dot with SPARKLING color
      const colorDot = container.querySelector('[style*="background-color: rgb(255, 215, 0)"]');
      expect(colorDot).toBeInTheDocument();
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
});
