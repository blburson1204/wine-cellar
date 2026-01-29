import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterDrawer from '../../components/FilterDrawer';

describe('FilterDrawer Gestures', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('FR-008: ESC key closes drawer', () => {
    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(
        <FilterDrawer {...defaultProps} onClose={onClose}>
          <div>Filter Content</div>
        </FilterDrawer>
      );

      const drawer = screen.getByRole('dialog');
      fireEvent.keyDown(drawer, { key: 'Escape', code: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose for non-Escape keys', () => {
      const onClose = vi.fn();
      render(
        <FilterDrawer {...defaultProps} onClose={onClose}>
          <div>Filter Content</div>
        </FilterDrawer>
      );

      const drawer = screen.getByRole('dialog');
      fireEvent.keyDown(drawer, { key: 'Enter', code: 'Enter' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not respond to ESC when drawer is closed', () => {
      const onClose = vi.fn();
      render(
        <FilterDrawer isOpen={false} onClose={onClose}>
          <div>Filter Content</div>
        </FilterDrawer>
      );

      // Drawer should not be in the DOM when closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('FR-009: Swipe left closes drawer', () => {
    it('calls onClose when swiped left beyond 50px threshold', () => {
      const onClose = vi.fn();
      render(
        <FilterDrawer {...defaultProps} onClose={onClose}>
          <div>Filter Content</div>
        </FilterDrawer>
      );

      const drawer = screen.getByRole('dialog');

      // Simulate swipe left: start at x=200, move to x=100 (deltaX = -100, exceeds -50 threshold)
      fireEvent.touchStart(drawer, {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      fireEvent.touchMove(drawer, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      fireEvent.touchEnd(drawer);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose for swipe exactly at threshold boundary (51px)', () => {
      const onClose = vi.fn();
      render(
        <FilterDrawer {...defaultProps} onClose={onClose}>
          <div>Filter Content</div>
        </FilterDrawer>
      );

      const drawer = screen.getByRole('dialog');

      // Swipe left exactly 51px (just past threshold)
      fireEvent.touchStart(drawer, {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      fireEvent.touchMove(drawer, {
        touches: [{ clientX: 149, clientY: 100 }],
      });
      fireEvent.touchEnd(drawer);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('FR-010: Partial swipe snaps back', () => {
    it('does not close on swipe less than 50px threshold', () => {
      const onClose = vi.fn();
      render(
        <FilterDrawer {...defaultProps} onClose={onClose}>
          <div>Filter Content</div>
        </FilterDrawer>
      );

      const drawer = screen.getByRole('dialog');

      // Swipe left only 30px (below 50px threshold)
      fireEvent.touchStart(drawer, {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      fireEvent.touchMove(drawer, {
        touches: [{ clientX: 170, clientY: 100 }],
      });
      fireEvent.touchEnd(drawer);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not close on swipe exactly at 50px (boundary)', () => {
      const onClose = vi.fn();
      render(
        <FilterDrawer {...defaultProps} onClose={onClose}>
          <div>Filter Content</div>
        </FilterDrawer>
      );

      const drawer = screen.getByRole('dialog');

      // Swipe left exactly 50px (at boundary, should NOT close per spec: "exceeding 50px")
      fireEvent.touchStart(drawer, {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      fireEvent.touchMove(drawer, {
        touches: [{ clientX: 150, clientY: 100 }],
      });
      fireEvent.touchEnd(drawer);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not close on swipe right (opposite direction)', () => {
      const onClose = vi.fn();
      render(
        <FilterDrawer {...defaultProps} onClose={onClose}>
          <div>Filter Content</div>
        </FilterDrawer>
      );

      const drawer = screen.getByRole('dialog');

      // Swipe right (positive deltaX)
      fireEvent.touchStart(drawer, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      fireEvent.touchMove(drawer, {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      fireEvent.touchEnd(drawer);

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
