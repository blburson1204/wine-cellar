import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Backdrop from '../../components/Backdrop';

describe('Backdrop', () => {
  it('renders when isOpen is true', () => {
    const { container } = render(<Backdrop isOpen={true} onClick={vi.fn()} />);
    const backdrop = container.firstChild as HTMLElement;

    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveStyle({
      position: 'fixed',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    });
  });

  it('is hidden when isOpen is false', () => {
    const { container } = render(<Backdrop isOpen={false} onClick={vi.fn()} />);
    const backdrop = container.firstChild as HTMLElement;

    // When closed, component should not render or have display: none
    expect(backdrop).toBeNull();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const { container } = render(<Backdrop isOpen={true} onClick={handleClick} />);
    const backdrop = container.firstChild as HTMLElement;

    await userEvent.click(backdrop);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has correct z-index for layering', () => {
    const { container } = render(<Backdrop isOpen={true} onClick={vi.fn()} />);
    const backdrop = container.firstChild as HTMLElement;

    expect(backdrop).toHaveStyle({ zIndex: '900' });
  });

  it('covers entire viewport', () => {
    const { container } = render(<Backdrop isOpen={true} onClick={vi.fn()} />);
    const backdrop = container.firstChild as HTMLElement;

    expect(backdrop).toHaveStyle({
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
    });
  });
});
