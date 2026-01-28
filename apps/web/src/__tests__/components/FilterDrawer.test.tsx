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

  it('has 80% width (w-[80vw] class)', () => {
    const { container } = render(
      <FilterDrawer isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );

    const drawer = container.querySelector('[class*="w-\\[80vw\\]"]');
    expect(drawer).toBeInTheDocument();
  });

  it('has transform animation classes', () => {
    const { container } = render(
      <FilterDrawer isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );

    const drawer = container.querySelector('[class*="transition"]');
    expect(drawer).toBeInTheDocument();
  });

  it('is positioned fixed on the left', () => {
    const { container } = render(
      <FilterDrawer isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );

    const drawer = container.firstChild as HTMLElement;
    expect(drawer).toHaveClass('fixed');
    expect(drawer).toHaveClass('left-0');
  });

  it('has wine-background color', () => {
    const { container } = render(
      <FilterDrawer isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );

    const drawer = container.firstChild as HTMLElement;
    expect(drawer).toHaveClass('bg-wine-background');
  });

  it('is scrollable (overflow-y-auto)', () => {
    const { container } = render(
      <FilterDrawer isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );

    const drawer = container.firstChild as HTMLElement;
    expect(drawer).toHaveClass('overflow-y-auto');
  });

  it('has z-index of 950', () => {
    const { container } = render(
      <FilterDrawer isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );

    const drawer = container.firstChild as HTMLElement;
    expect(drawer).toHaveStyle({ zIndex: '950' });
  });

  it('has correct animation duration (300ms)', () => {
    const { container } = render(
      <FilterDrawer isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );

    const drawer = container.firstChild as HTMLElement;
    expect(drawer).toHaveClass('duration-300');
  });

  it('has ease-in-out timing function', () => {
    const { container } = render(
      <FilterDrawer isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );

    const drawer = container.firstChild as HTMLElement;
    expect(drawer).toHaveClass('ease-in-out');
  });
});
