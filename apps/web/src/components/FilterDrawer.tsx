interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function FilterDrawer({
  isOpen,
  onClose: _onClose, // Available for future enhancements (e.g., ESC key, swipe gestures)
  children,
}: FilterDrawerProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div
      className="fixed left-0 top-0 bottom-0 w-[80vw] bg-wine-background overflow-y-auto transition-transform duration-300 ease-in-out"
      style={{ zIndex: 950 }}
      role="dialog"
      aria-modal="true"
      aria-label="Filter options"
    >
      {children}
    </div>
  );
}
