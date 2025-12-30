import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import WineFilters from '../src/components/WineFilters';

describe('WineFilters', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnColorsChange = vi.fn();
  const mockOnCountryChange = vi.fn();
  const mockOnVintageRangeChange = vi.fn();
  const mockOnPriceRangeChange = vi.fn();
  const mockOnClearAll = vi.fn();

  const defaultProps = {
    searchText: '',
    onSearchChange: mockOnSearchChange,
    selectedColors: [],
    onColorsChange: mockOnColorsChange,
    selectedCountry: null,
    onCountryChange: mockOnCountryChange,
    countries: ['France', 'Italy', 'Spain', 'USA'],
    vintageRange: null,
    onVintageRangeChange: mockOnVintageRangeChange,
    vintageMin: 2000,
    vintageMax: 2024,
    priceRange: null,
    onPriceRangeChange: mockOnPriceRangeChange,
    priceMin: 0,
    priceMax: 500,
    onClearAll: mockOnClearAll,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all filter sections', () => {
      render(<WineFilters {...defaultProps} />);

      expect(screen.getByLabelText('Filter Criteria')).toBeInTheDocument();
      expect(screen.getByText('Wine Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Country')).toBeInTheDocument();
      expect(screen.getByText('Vintage')).toBeInTheDocument();
      expect(screen.getByText('Price ($)')).toBeInTheDocument();
    });

    it('renders all wine type checkboxes', () => {
      render(<WineFilters {...defaultProps} />);

      expect(screen.getByRole('checkbox', { name: /Red/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /White/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /Rosé/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /Sparkling/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /Dessert/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /Fortified/i })).toBeInTheDocument();
    });

    it('renders country options', () => {
      render(<WineFilters {...defaultProps} />);

      expect(screen.getByRole('option', { name: 'All Countries' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'France' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Italy' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Spain' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'USA' })).toBeInTheDocument();
    });

    it('does not show clear button when no filters active', () => {
      render(<WineFilters {...defaultProps} />);

      expect(screen.queryByRole('button', { name: 'Clear All Filters' })).not.toBeInTheDocument();
    });

    it('shows clear button when search text is active', () => {
      render(<WineFilters {...defaultProps} searchText="test" />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });

    it('shows clear button when colors are selected', () => {
      render(<WineFilters {...defaultProps} selectedColors={['RED']} />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });

    it('shows clear button when country is selected', () => {
      render(<WineFilters {...defaultProps} selectedCountry="France" />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });

    it('shows clear button when vintage range is set', () => {
      render(<WineFilters {...defaultProps} vintageRange={[2010, 2020]} />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });

    it('shows clear button when price range is set', () => {
      render(<WineFilters {...defaultProps} priceRange={[10, 100]} />);

      expect(screen.getByRole('button', { name: 'Clear All Filters' })).toBeInTheDocument();
    });
  });

  describe('Search Filter', () => {
    it('displays current search text', () => {
      render(<WineFilters {...defaultProps} searchText="Bordeaux" />);

      const searchInput = screen.getByLabelText('Filter Criteria');
      expect(searchInput).toHaveValue('Bordeaux');
    });

    it('calls onSearchChange when typing', async () => {
      const user = userEvent.setup();
      render(<WineFilters {...defaultProps} />);

      const searchInput = screen.getByLabelText('Filter Criteria');
      await user.type(searchInput, 'Margaux');

      expect(mockOnSearchChange).toHaveBeenCalled();
      // User.type calls onChange for each character
      expect(mockOnSearchChange).toHaveBeenCalledTimes(7); // M-a-r-g-a-u-x
    });
  });

  describe('Wine Type Filter', () => {
    it('shows selected wine types as checked', () => {
      render(<WineFilters {...defaultProps} selectedColors={['RED', 'WHITE']} />);

      expect(screen.getByRole('checkbox', { name: /Red/i })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /White/i })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Rosé/i })).not.toBeChecked();
    });

    it('calls onColorsChange when selecting a color', async () => {
      const user = userEvent.setup();
      render(<WineFilters {...defaultProps} />);

      await user.click(screen.getByRole('checkbox', { name: /Red/i }));

      expect(mockOnColorsChange).toHaveBeenCalledWith(['RED']);
    });

    it('calls onColorsChange when deselecting a color', async () => {
      const user = userEvent.setup();
      render(<WineFilters {...defaultProps} selectedColors={['RED', 'WHITE']} />);

      await user.click(screen.getByRole('checkbox', { name: /Red/i }));

      expect(mockOnColorsChange).toHaveBeenCalledWith(['WHITE']);
    });

    it('allows multiple wine types to be selected', async () => {
      const user = userEvent.setup();
      render(<WineFilters {...defaultProps} />);

      await user.click(screen.getByRole('checkbox', { name: /Red/i }));
      await user.click(screen.getByRole('checkbox', { name: /White/i }));

      expect(mockOnColorsChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Country Filter', () => {
    it('displays selected country', () => {
      render(<WineFilters {...defaultProps} selectedCountry="France" />);

      const countrySelect = screen.getByLabelText('Country');
      expect(countrySelect).toHaveValue('France');
    });

    it('calls onCountryChange when selecting a country', async () => {
      const user = userEvent.setup();
      render(<WineFilters {...defaultProps} />);

      const countrySelect = screen.getByLabelText('Country');
      await user.selectOptions(countrySelect, 'Italy');

      expect(mockOnCountryChange).toHaveBeenCalledWith('Italy');
    });

    it('calls onCountryChange with null when selecting All Countries', async () => {
      const user = userEvent.setup();
      render(<WineFilters {...defaultProps} selectedCountry="France" />);

      const countrySelect = screen.getByLabelText('Country');
      await user.selectOptions(countrySelect, '');

      expect(mockOnCountryChange).toHaveBeenCalledWith(null);
    });
  });

  describe('Vintage Range Filter', () => {
    it('displays vintage range values', () => {
      render(<WineFilters {...defaultProps} vintageRange={[2010, 2020]} />);

      // Use IDs directly since there are multiple "From" and "To" labels
      const vintageFrom = document.getElementById('vintage-from') as HTMLInputElement;
      const vintageTo = document.getElementById('vintage-to') as HTMLInputElement;
      expect(vintageFrom).toHaveValue(2010);
      expect(vintageTo).toHaveValue(2020);
    });

    it('displays default min/max when no range set', () => {
      render(<WineFilters {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      // First two spinbuttons are vintage range
      expect(inputs[0]).toHaveValue(2000);
      expect(inputs[1]).toHaveValue(2024);
    });

    it('calls onVintageRangeChange when changing min vintage', async () => {
      const user = userEvent.setup();
      render(<WineFilters {...defaultProps} />);

      const vintageFromInput = document.getElementById('vintage-from') as HTMLInputElement;
      await user.type(vintageFromInput, '{Backspace}{Backspace}{Backspace}{Backspace}2010');

      // Should be called when value changes
      expect(mockOnVintageRangeChange).toHaveBeenCalled();
      expect(mockOnVintageRangeChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('calls onVintageRangeChange when changing max vintage', async () => {
      const user = userEvent.setup();
      render(<WineFilters {...defaultProps} vintageRange={[2010, 2024]} />);

      const vintageToInput = document.getElementById('vintage-to') as HTMLInputElement;
      await user.type(vintageToInput, '{Backspace}{Backspace}{Backspace}{Backspace}2020');

      expect(mockOnVintageRangeChange).toHaveBeenCalled();
      expect(mockOnVintageRangeChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('disables vintage inputs when min equals max', () => {
      render(<WineFilters {...defaultProps} vintageMin={2020} vintageMax={2020} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[0]).toBeDisabled();
      expect(inputs[1]).toBeDisabled();
    });
  });

  describe('Price Range Filter', () => {
    it('displays price range values', () => {
      render(<WineFilters {...defaultProps} priceRange={[50, 200]} />);

      const inputs = screen.getAllByRole('spinbutton');
      // Last two spinbuttons are price range
      expect(inputs[2]).toHaveValue(50);
      expect(inputs[3]).toHaveValue(200);
    });

    it('displays default min/max when no range set', () => {
      render(<WineFilters {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      // Last two spinbuttons are price range
      expect(inputs[2]).toHaveValue(0);
      expect(inputs[3]).toHaveValue(500);
    });

    it('calls onPriceRangeChange when changing min price', async () => {
      const user = userEvent.setup();
      render(<WineFilters {...defaultProps} />);

      const priceFromInput = document.getElementById('price-from') as HTMLInputElement;
      await user.type(priceFromInput, '25');

      expect(mockOnPriceRangeChange).toHaveBeenCalled();
      expect(mockOnPriceRangeChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('calls onPriceRangeChange when changing max price', async () => {
      const user = userEvent.setup();
      render(<WineFilters {...defaultProps} priceRange={[25, 500]} />);

      const priceToInput = document.getElementById('price-to') as HTMLInputElement;
      await user.type(priceToInput, '300');

      expect(mockOnPriceRangeChange).toHaveBeenCalled();
      expect(mockOnPriceRangeChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('disables price inputs when min equals max', () => {
      render(<WineFilters {...defaultProps} priceMin={100} priceMax={100} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[2]).toBeDisabled();
      expect(inputs[3]).toBeDisabled();
    });
  });

  describe('Clear All Filters', () => {
    it('calls onClearAll when clear button clicked', async () => {
      const user = userEvent.setup();
      render(<WineFilters {...defaultProps} searchText="test" />);

      await user.click(screen.getByRole('button', { name: 'Clear All Filters' }));

      expect(mockOnClearAll).toHaveBeenCalledTimes(1);
    });
  });
});
