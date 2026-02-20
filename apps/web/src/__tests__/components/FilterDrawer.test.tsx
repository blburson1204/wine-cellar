import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FilterDrawer from '../../components/FilterDrawer';

describe('FilterDrawer', () => {
  it('renders children when isOpen is true', () => {
    render(
      <FilterDrawer isOpen={true} onClose={vi.fn()}>
        <div>Filter Content</div>
      </FilterDrawer>
    );

    expect(screen.getByText('Filter Content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <FilterDrawer isOpen={false} onClose={vi.fn()}>
        <div>Filter Content</div>
      </FilterDrawer>
    );

    expect(screen.queryByText('Filter Content')).not.toBeInTheDocument();
  });
});
