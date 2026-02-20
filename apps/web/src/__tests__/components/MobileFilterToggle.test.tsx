import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MobileFilterToggle from '../../components/MobileFilterToggle';

describe('MobileFilterToggle', () => {
  it('renders filter/funnel icon', () => {
    render(<MobileFilterToggle onClick={vi.fn()} />);

    // Check for SVG element (filter icon)
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const { container } = render(<MobileFilterToggle onClick={handleClick} />);
    const button = container.firstChild as HTMLElement;

    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has minimum 44x44px touch target', () => {
    const { container } = render(<MobileFilterToggle onClick={vi.fn()} />);
    const button = container.firstChild as HTMLElement;

    const styles = window.getComputedStyle(button);
    const width = parseInt(styles.width);
    const height = parseInt(styles.height);

    expect(width).toBeGreaterThanOrEqual(44);
    expect(height).toBeGreaterThanOrEqual(44);
  });

  it('has accessible label', () => {
    render(<MobileFilterToggle onClick={vi.fn()} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName(/filter/i);
  });

  it('displays active filter count badge when provided', () => {
    render(<MobileFilterToggle onClick={vi.fn()} activeFilterCount={3} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not display badge when activeFilterCount is 0', () => {
    render(<MobileFilterToggle onClick={vi.fn()} activeFilterCount={0} />);

    // Badge should not be present
    const badge = screen.queryByText('0');
    expect(badge).not.toBeInTheDocument();
  });
});
