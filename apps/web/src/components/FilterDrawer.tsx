import { useEffect, useRef } from 'react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  children,
}: FilterDrawerProps): React.JSX.Element | null {
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
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
