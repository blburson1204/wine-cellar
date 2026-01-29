interface LoadingSpinnerProps {
  size?: 'sm' | 'md';
  className?: string;
}

export default function LoadingSpinner({
  size = 'sm',
  className = '',
}: LoadingSpinnerProps): React.JSX.Element {
  const sizeClasses = {
    sm: 'w-4 h-4', // 16px
    md: 'w-6 h-6', // 24px
  };

  return (
    <span
      className={`inline-block rounded-full border-2 border-wine-burgundy border-t-transparent animate-spin ${sizeClasses[size]} ${className}`.trim()}
      role="status"
      aria-label="Loading"
    />
  );
}
