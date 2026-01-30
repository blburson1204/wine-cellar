import { useEffect, useRef } from 'react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function FilterDrawer({
  isOpen,
  onClose,
  children,
}: FilterDrawerProps): React.JSX.Element | null {
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<Element | null>(null);

  // Store previously focused element when opening, restore when closing
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement;
    } else if (previouslyFocusedRef.current) {
      (previouslyFocusedRef.current as HTMLElement).focus();
      previouslyFocusedRef.current = null;
    }
  }, [isOpen]);

  // Auto-focus first focusable element, focus trap, and Escape handling
  useEffect(() => {
    if (!isOpen) return;

    const drawer = drawerRef.current;
    if (drawer) {
      const focusableElements = drawer.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawer) {
        const focusableElements = Array.from(drawer.querySelectorAll(FOCUSABLE_SELECTOR));
        if (focusableElements.length === 0) return;

        e.preventDefault();

        const currentIndex = focusableElements.indexOf(document.activeElement as Element);

        if (e.shiftKey) {
          const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
          (focusableElements[prevIndex] as HTMLElement).focus();
        } else {
          const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
          (focusableElements[nextIndex] as HTMLElement).focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchCurrentX.current !== null) {
      const deltaX = touchCurrentX.current - touchStartX.current;
      if (deltaX < -50) {
        onClose();
      }
    }
    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  return (
    <div
      ref={drawerRef}
      className="fixed left-0 top-0 bottom-0 w-[80vw] bg-wine-background overflow-y-auto transition-transform duration-300 ease-in-out"
      style={{ zIndex: 950 }}
      role="dialog"
      aria-modal="true"
      aria-label="Filter options"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}
