interface MobileFilterToggleProps {
  onClick: () => void;
  activeFilterCount?: number;
}

export default function MobileFilterToggle({
  onClick,
  activeFilterCount = 0,
}: MobileFilterToggleProps): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      aria-label="Open filters"
      className="bg-wine-dark relative flex items-center justify-center rounded-md transition-colors hover:bg-wine-hover"
      style={{
        width: '44px',
        height: '44px',
      }}
    >
      {/* Filter/Funnel Icon SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        aria-hidden="true"
      >
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>

      {/* Active filter count badge */}
      {activeFilterCount > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
          aria-label={`${activeFilterCount} active filters`}
        >
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}
