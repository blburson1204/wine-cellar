import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MobileSortSelector from '../../components/MobileSortSelector';

describe('MobileSortSelector', () => {
  const defaultProps = {
    sortBy: 'name' as const,
    sortDirection: 'asc' as const,
    onSort: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders sort dropdown', () => {
      render(<MobileSortSelector {...defaultProps} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('displays current sort column label', () => {
      render(<MobileSortSelector {...defaultProps} />);
      expect(screen.getByDisplayValue('Name')).toBeInTheDocument();
    });

    it('renders direction toggle button', () => {
      render(<MobileSortSelector {...defaultProps} />);
      expect(screen.getByRole('button', { name: /sort direction/i })).toBeInTheDocument();
    });

    it('shows ascending indicator when sortDirection is asc', () => {
      render(<MobileSortSelector {...defaultProps} sortDirection="asc" />);
      const button = screen.getByRole('button', { name: /sort direction/i });
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('ascending'));
    });

    it('shows descending indicator when sortDirection is desc', () => {
      render(<MobileSortSelector {...defaultProps} sortDirection="desc" />);
      const button = screen.getByRole('button', { name: /sort direction/i });
      expect(button).toHaveAttribute('aria-label', expect.stringContaining('descending'));
    });
  });

  describe('Sort Column Selection', () => {
    it('shows all sort options in dropdown', async () => {
      const user = userEvent.setup();
      render(<MobileSortSelector {...defaultProps} />);

      const select = screen.getByRole('combobox');
      await user.click(select);

      // Check for key sort options
      expect(screen.getByRole('option', { name: 'Name' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Vintage' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Producer' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Price' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Rating' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Type' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Region' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Grape' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Country' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Quantity' })).toBeInTheDocument();
    });

    it('calls onSort when different column is selected', async () => {
      const onSort = vi.fn();
      const user = userEvent.setup();
      render(<MobileSortSelector {...defaultProps} onSort={onSort} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'vintage');

      expect(onSort).toHaveBeenCalledWith('vintage');
    });

    it('displays correct label for each sort option', () => {
      render(<MobileSortSelector {...defaultProps} sortBy="grapeVariety" />);
      expect(screen.getByDisplayValue('Grape')).toBeInTheDocument();
    });
  });

  describe('Direction Toggle', () => {
    it('calls onSort with same column when direction toggle clicked', async () => {
      const onSort = vi.fn();
      const user = userEvent.setup();
      render(<MobileSortSelector {...defaultProps} onSort={onSort} />);

      const toggle = screen.getByRole('button', { name: /sort direction/i });
      await user.click(toggle);

      // Should call onSort with same column to toggle direction
      expect(onSort).toHaveBeenCalledWith('name');
    });
  });

  describe('Touch Targets (FR-010)', () => {
    it('has minimum 44px height for dropdown', () => {
      render(<MobileSortSelector {...defaultProps} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveStyle({ minHeight: '44px' });
    });

    it('has minimum 44px touch target for direction toggle', () => {
      render(<MobileSortSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /sort direction/i });
      expect(button).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    });
  });

  describe('Accessibility', () => {
    it('has accessible label for dropdown', () => {
      render(<MobileSortSelector {...defaultProps} />);
      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    });

    it('direction toggle has descriptive aria-label', () => {
      render(<MobileSortSelector {...defaultProps} sortDirection="asc" />);
      const button = screen.getByRole('button', { name: /sort direction/i });
      expect(button.getAttribute('aria-label')).toMatch(/ascending|descending/i);
    });
  });

  describe('Visual Styling', () => {
    it('has consistent styling with wine-* design tokens', () => {
      render(<MobileSortSelector {...defaultProps} />);
      const container = screen.getByRole('combobox').closest('div');
      // Should use consistent background styling
      expect(container?.className).toMatch(/bg-|white/);
    });
  });
});
