import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMediaQuery } from '../useMediaQuery';

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false initially on SSR (no matches)', () => {
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));

    expect(result.current).toBe(false);
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('should return true when query matches', () => {
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));

    expect(result.current).toBe(true);
  });

  it('should update when media query changes', async () => {
    let capturedListener: (() => void) | undefined;
    let currentMatches = false;

    const addEventListenerMock = vi.fn((event: string, handler: () => void) => {
      if (event === 'change') {
        capturedListener = handler;
      }
    });

    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      get matches() {
        return currentMatches;
      },
      media: query,
      onchange: null,
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));

    expect(result.current).toBe(false);

    // Simulate media query change - update the mock's return value and trigger listener
    currentMatches = true;
    if (capturedListener) {
      capturedListener();
    }

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should remove event listener on unmount', () => {
    const addEventListenerMock = vi.fn();
    const removeEventListenerMock = vi.fn();

    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = mockMatchMedia;

    const { unmount } = renderHook(() => useMediaQuery('(max-width: 767px)'));

    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
