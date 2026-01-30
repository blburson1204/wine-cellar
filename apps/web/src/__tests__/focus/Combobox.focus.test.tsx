import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Combobox from '../../components/Combobox';

describe('Combobox Focus Management', () => {
  const options = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

  /**
   * Helper: opens the combobox via the toggle button, which reliably
   * opens the listbox in jsdom (unlike clicking the input directly).
   */
  async function openCombobox(user: ReturnType<typeof userEvent.setup>) {
    const toggleButton = screen.getByLabelText('Toggle options');
    await user.click(toggleButton);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  }

  describe('Arrow key navigation', () => {
    it('should navigate through options with ArrowDown', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Combobox id="test" label="Test" value="" onChange={onChange} options={options} />);

      await openCombobox(user);

      const optionElements = screen.getAllByRole('option');
      expect(optionElements.length).toBe(4);

      // Headless UI pre-activates first option on open
      expect(optionElements[0].getAttribute('data-headlessui-state')?.includes('active')).toBe(
        true
      );

      // ArrowDown moves from first to second option
      await user.keyboard('{ArrowDown}');

      expect(optionElements[1].getAttribute('data-headlessui-state')?.includes('active')).toBe(
        true
      );

      // ArrowDown moves from second to third option
      await user.keyboard('{ArrowDown}');

      expect(optionElements[2].getAttribute('data-headlessui-state')?.includes('active')).toBe(
        true
      );
    });

    it('should navigate through options with ArrowUp', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Combobox id="test" label="Test" value="" onChange={onChange} options={options} />);

      await openCombobox(user);

      const optionElements = screen.getAllByRole('option');

      // First option is active on open; ArrowDown to second
      await user.keyboard('{ArrowDown}');

      expect(optionElements[1].getAttribute('data-headlessui-state')?.includes('active')).toBe(
        true
      );

      // ArrowUp navigates back to first option
      await user.keyboard('{ArrowUp}');

      expect(optionElements[0].getAttribute('data-headlessui-state')?.includes('active')).toBe(
        true
      );
    });

    it('should select option with Enter and close listbox', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Combobox id="test" label="Test" value="" onChange={onChange} options={options} />);

      await openCombobox(user);

      // First option is pre-activated; Enter selects it
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith('Option 1');

      // Listbox should be closed
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Escape key behavior', () => {
    it('should close listbox and return focus to input when Escape is pressed', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Combobox id="test" label="Test" value="" onChange={onChange} options={options} />);

      const input = screen.getByRole('combobox');
      await openCombobox(user);

      // Press Escape
      await user.keyboard('{Escape}');

      // Listbox should be closed
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      // Focus should be on the input
      expect(document.activeElement).toBe(input);
    });

    it('should not call onChange when Escape is pressed', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Combobox id="test" label="Test" value="" onChange={onChange} options={options} />);

      await openCombobox(user);

      // Navigate to first option
      await user.keyboard('{ArrowDown}');

      // Press Escape
      await user.keyboard('{Escape}');

      // onChange should not be called
      expect(onChange).not.toHaveBeenCalled();

      // Listbox should be closed
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Focus management with button toggle', () => {
    it('should open listbox when toggle button is clicked and maintain focus', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Combobox id="test" label="Test" value="" onChange={onChange} options={options} />);

      // Find the toggle button (has aria-label="Toggle options")
      const toggleButton = screen.getByLabelText('Toggle options');

      // Click the toggle button
      await user.click(toggleButton);

      // Listbox should be open
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Input should be focused (Headless UI behavior)
      const input = screen.getByRole('combobox');
      expect(document.activeElement).toBe(input);
    });

    it('should close listbox when toggle button is clicked again', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Combobox id="test" label="Test" value="" onChange={onChange} options={options} />);

      const toggleButton = screen.getByLabelText('Toggle options');

      // Click to open
      await user.click(toggleButton);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Click to close
      await user.click(toggleButton);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Tab behavior with open combobox', () => {
    it('should close listbox when Tab is pressed (standard ARIA combobox behavior)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(
        <>
          <button data-testid="before">Before</button>
          <Combobox id="test" label="Test" value="" onChange={onChange} options={options} />
          <button data-testid="after">After</button>
        </>
      );

      await openCombobox(user);

      // Tab should close the listbox (per ARIA combobox pattern, Tab exits the widget)
      await user.tab();

      // Listbox should be closed after Tab
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});
