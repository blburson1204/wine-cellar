import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Combobox from '../../components/Combobox';

describe('Combobox Keyboard Navigation', () => {
  const defaultProps = {
    id: 'test-combobox',
    label: 'Test Label',
    value: '',
    onChange: vi.fn(),
    options: ['Apple', 'Banana', 'Cherry', 'Date'],
  };

  describe('Enter Key Selection (FR-012)', () => {
    it('submits free text with Enter when no options match', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} onChange={onChange} />);

      const input = screen.getByLabelText('Test Label');
      // Open dropdown and type something not in options
      const button = screen.getByRole('button');
      await user.click(button);
      await user.type(input, 'Custom');
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith('Custom');
    });
  });

  describe('Escape Key (FR-012)', () => {
    it('resets query on Escape when dropdown closes', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} value="Test" />);

      const input = screen.getByLabelText('Test Label');
      // Open and type to filter
      const button = screen.getByRole('button');
      await user.click(button);
      await user.type(input, 'xyz');
      await user.keyboard('{Escape}');

      // Value should remain but query should reset
      expect(input).toHaveValue('Test');
    });
  });

  describe('Home and End Keys', () => {
    it('moves to first option with Home key', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      // Open dropdown and navigate
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Home}');

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute(
        'data-headlessui-state',
        expect.stringContaining('active')
      );
    });

    it('moves to last option with End key', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      // Open dropdown with ArrowDown first
      await user.keyboard('{ArrowDown}{End}');

      const options = screen.getAllByRole('option');
      const lastOption = options[options.length - 1];
      expect(lastOption).toHaveAttribute(
        'data-headlessui-state',
        expect.stringContaining('active')
      );
    });
  });

  describe('Typing and Filtering', () => {
    it('filters options while typing', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{ArrowDown}'); // Open dropdown
      await user.type(input, 'Ba');

      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
      expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
    });

    it('shows all options when input is cleared', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{ArrowDown}'); // Open dropdown
      await user.type(input, 'Ba');
      await user.clear(input);

      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Cherry')).toBeInTheDocument();
    });
  });

  describe('Focus Behavior', () => {
    it('keeps dropdown open while typing', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{ArrowDown}'); // Open dropdown
      await user.type(input, 'test');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });
});
