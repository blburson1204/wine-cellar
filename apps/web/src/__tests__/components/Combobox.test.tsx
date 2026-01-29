import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Combobox from '../../components/Combobox';

describe('Combobox', () => {
  const defaultProps = {
    id: 'test-combobox',
    label: 'Test Label',
    value: '',
    onChange: vi.fn(),
    options: ['Option 1', 'Option 2', 'Option 3'],
  };

  describe('Rendering', () => {
    it('renders with label', () => {
      render(<Combobox {...defaultProps} />);
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Combobox {...defaultProps} placeholder="Select an option" />);
      expect(screen.getByPlaceholderText('Select an option')).toBeInTheDocument();
    });

    it('renders with current value', () => {
      render(<Combobox {...defaultProps} value="Option 1" />);
      expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
    });

    it('renders error message when provided', () => {
      render(<Combobox {...defaultProps} error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('marks input as required when required prop is true', () => {
      render(<Combobox {...defaultProps} required />);
      // Use getByRole since label contains asterisk span
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('required');
    });
  });

  describe('Options Display', () => {
    it('shows all options when dropdown is opened (FR-018)', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} />);

      // Click the dropdown button to open options
      const button = screen.getByRole('button');
      await user.click(button);

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('shows "No matching options" when filter has no results', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} />);

      const input = screen.getByLabelText('Test Label');
      // Open dropdown first, then type to filter
      const button = screen.getByRole('button');
      await user.click(button);
      await user.type(input, 'xyz');

      expect(screen.getByText(/no matching options/i)).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters options as user types (FR-014)', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} />);

      const input = screen.getByLabelText('Test Label');
      await user.click(input);
      await user.type(input, '1');

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
    });

    it('performs case-insensitive filtering', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} options={['Apple', 'Banana', 'Cherry']} />);

      const input = screen.getByLabelText('Test Label');
      await user.click(input);
      await user.type(input, 'APPLE');

      expect(screen.getByText('Apple')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('calls onChange when option is selected', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} onChange={onChange} />);

      // Open dropdown via button first
      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(screen.getByText('Option 2'));

      expect(onChange).toHaveBeenCalledWith('Option 2');
    });

    it('allows free text entry not in options list (FR-015)', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} onChange={onChange} />);

      const input = screen.getByLabelText('Test Label');
      await user.click(input);
      await user.type(input, 'Custom Value');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith('Custom Value');
    });
  });

  describe('Touch Targets', () => {
    it('has minimum 44px height for input (FR-010)', () => {
      render(<Combobox {...defaultProps} />);
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveStyle({ minHeight: '44px' });
    });

    it('has minimum 44px height for dropdown options (FR-013)', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} />);

      // Open dropdown via button
      const button = screen.getByRole('button');
      await user.click(button);

      // Headless UI options have role="option"
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
      options.forEach((option) => {
        expect(option).toHaveStyle({ minHeight: '44px' });
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Combobox {...defaultProps} />);
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('role', 'combobox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('displays error message near input for screen readers', () => {
      render(<Combobox {...defaultProps} error="Error message" />);
      // Error message should be visible and associated with the input field
      const error = screen.getByText('Error message');
      expect(error).toBeInTheDocument();
      expect(error).toHaveClass('text-red-500');
    });
  });
});
