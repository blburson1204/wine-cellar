'use client';

interface Wine {
  id: string;
  name: string;
  vintage: number;
  producer: string;
  region: string | null;
  country: string;
  grapeVariety: string | null;
  blendDetail: string | null;
  color: string;
  quantity: number;
  purchasePrice: number | null;
  purchaseDate: string | null;
  drinkByDate: string | null;
  rating: number | null;
  notes: string | null;
  expertRatings: string | null;
  wherePurchased: string | null;
  wineLink: string | null;
  favorite: boolean;
  imageUrl: string | null;
}

interface WineCardProps {
  wine: Wine;
  onClick: (wine: Wine) => void;
  onToggleFavorite: (wine: Wine) => void;
}

const COLOR_LABELS: Record<string, string> = {
  RED: 'Red',
  WHITE: 'White',
  ROSE: 'Rosé',
  SPARKLING: 'Sparkling',
  DESSERT: 'Dessert',
  FORTIFIED: 'Fortified',
};

export default function WineCard({
  wine,
  onClick,
  onToggleFavorite,
}: WineCardProps): React.JSX.Element {
  const handleCardClick = () => {
    onClick(wine);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(wine);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(wine);
  };

  const handleFavoriteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onToggleFavorite(wine);
    }
  };

  return (
    <article
      role="article"
      aria-label={`Wine: ${wine.name}`}
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className="bg-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-burgundy transition-colors"
      style={{ minHeight: '44px' }}
    >
      {/* Line 1: Favorite + Name */}
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={handleFavoriteClick}
          onKeyDown={handleFavoriteKeyDown}
          aria-label="Toggle favorite"
          aria-pressed={wine.favorite}
          className="flex-shrink-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-burgundy rounded"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          {wine.favorite ? (
            <svg
              className="w-6 h-6 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          )}
        </button>
        <span className="text-lg font-semibold text-white truncate">{wine.name}</span>
      </div>

      {/* Line 2: Vintage + Producer */}
      <div className="flex items-center gap-2 mb-1 text-sm text-white/80">
        <span className="font-medium">{wine.vintage}</span>
        <span className="text-white/50">•</span>
        <span className="truncate">{wine.producer}</span>
      </div>

      {/* Line 3: Type + Grape Variety */}
      <div className="flex items-center gap-2 mb-1 text-sm text-white/70">
        <span>{COLOR_LABELS[wine.color] || wine.color}</span>
        {wine.grapeVariety && (
          <>
            <span className="text-white/50">•</span>
            <span className="truncate">{wine.grapeVariety}</span>
          </>
        )}
      </div>

      {/* Line 4: Region + Country */}
      <div className="flex items-center gap-2 text-sm text-white/60">
        {wine.region && (
          <>
            <span className="truncate">{wine.region}</span>
            <span className="text-white/50">•</span>
          </>
        )}
        <span>{wine.country}</span>
      </div>
    </article>
  );
}
