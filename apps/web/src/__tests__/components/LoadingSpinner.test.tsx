import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoadingSpinner from '../../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner).toBeInTheDocument();
    });

    it('renders as a span element', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.firstChild as HTMLElement;
      expect(spinner.tagName).toBe('SPAN');
    });
  });

  describe('Size variants', () => {
    it('renders with sm size by default (w-4 h-4 classes)', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.firstChild as HTMLElement;

      expect(spinner.className).toMatch(/w-4/);
      expect(spinner.className).toMatch(/h-4/);
    });

    it('renders with md size when specified (w-6 h-6 classes)', () => {
      const { container } = render(<LoadingSpinner size="md" />);
      const spinner = container.firstChild as HTMLElement;

      expect(spinner.className).toMatch(/w-6/);
      expect(spinner.className).toMatch(/h-6/);
    });

    it('renders with sm size when explicitly specified (w-4 h-4 classes)', () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const spinner = container.firstChild as HTMLElement;

      expect(spinner.className).toMatch(/w-4/);
      expect(spinner.className).toMatch(/h-4/);
    });
  });

  describe('Animation', () => {
    it('has animate-spin class for rotation', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.firstChild as HTMLElement;

      expect(spinner.className).toMatch(/animate-spin/);
    });

    it('has border classes for visible spinner', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.firstChild as HTMLElement;

      expect(spinner.className).toMatch(/border-2/);
      expect(spinner.className).toMatch(/border-wine-burgundy/);
      expect(spinner.className).toMatch(/border-t-transparent/);
    });
  });

  describe('Custom className', () => {
    it('merges custom className with base classes', () => {
      const { container } = render(<LoadingSpinner className="custom-class" />);
      const spinner = container.firstChild as HTMLElement;

      expect(spinner.className).toMatch(/animate-spin/);
      expect(spinner.className).toMatch(/custom-class/);
    });

    it('preserves animation class when custom className provided', () => {
      const { container } = render(<LoadingSpinner className="ml-2" />);
      const spinner = container.firstChild as HTMLElement;

      expect(spinner.className).toMatch(/animate-spin/);
      expect(spinner.className).toMatch(/ml-2/);
    });
  });

  describe('Styling', () => {
    it('has rounded-full class for circular shape', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.firstChild as HTMLElement;

      expect(spinner.className).toMatch(/rounded-full/);
    });

    it('has inline-block display class', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.firstChild as HTMLElement;

      expect(spinner.className).toMatch(/inline-block/);
    });
  });
});
