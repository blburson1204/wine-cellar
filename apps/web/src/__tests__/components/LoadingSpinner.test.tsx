import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoadingSpinner from '../../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('supports size variants', () => {
    const { container: smContainer } = render(<LoadingSpinner size="sm" />);
    const sm = smContainer.firstChild as HTMLElement;
    expect(sm.className).toMatch(/w-4/);

    const { container: mdContainer } = render(<LoadingSpinner size="md" />);
    const md = mdContainer.firstChild as HTMLElement;
    expect(md.className).toMatch(/w-6/);
  });

  it('merges custom className with base classes', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const spinner = container.firstChild as HTMLElement;

    expect(spinner.className).toMatch(/animate-spin/);
    expect(spinner.className).toMatch(/custom-class/);
  });
});
