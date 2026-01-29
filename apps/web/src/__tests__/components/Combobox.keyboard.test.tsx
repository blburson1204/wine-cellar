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

  describe('Arrow Key Navigation (FR-012)', () => {
    it('navigates down through options with ArrowDown', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{ArrowDown}');

      // First option should be highlighted
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute(
        'data-headlessui-state',
        expect.stringContaining('active')
      );
    });

    it('navigates up through options with ArrowUp', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}');

      // First option should be highlighted after going down twice and up once
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute(
        'data-headlessui-state',
        expect.stringContaining('active')
      );
    });

    it('allows navigation through all options', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} options={['A', 'B']} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      // Navigate through all options
      await user.keyboard('{ArrowDown}{ArrowDown}');

      // Second option (B) should be highlighted
      const options = screen.getAllByRole('option');
      expect(options[1]).toHaveAttribute(
        'data-headlessui-state',
        expect.stringContaining('active')
      );
    });
  });

  describe('Enter Key Selection (FR-012)', () => {
    it('selects highlighted option with Enter', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} onChange={onChange} />);

      // Open dropdown via combobox, ArrowDown highlights first option, Enter selects
      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{ArrowDown}{Enter}');

      expect(onChange).toHaveBeenCalledWith('Apple');
    });

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
    it('closes dropdown with Escape', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} />);

      // Open dropdown via button
      const button = screen.getByRole('button');
      await user.click(button);

      // Dropdown should be open
      expect(screen.getByText('Apple')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      // Dropdown should be closed
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });

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

  describe('Tab Key', () => {
    it('closes dropdown and moves focus on Tab', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Combobox {...defaultProps} />
          <button>Next Button</button>
        </div>
      );

      // Open dropdown by clicking input and pressing ArrowDown
      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{ArrowDown}');

      // Dropdown should be open
      expect(screen.getByText('Apple')).toBeInTheDocument();

      await user.tab();

      // Dropdown should be closed and focus moved
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByText('Next Button')).toHaveFocus();
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
    it('opens dropdown when pressing ArrowDown', async () => {
      const user = userEvent.setup();
      render(<Combobox {...defaultProps} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

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
