interface WineListSkeletonProps {
  isMobile: boolean;
}

export default function WineListSkeleton({ isMobile }: WineListSkeletonProps): React.JSX.Element {
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            data-testid="skeleton-card"
            className="animate-pulse rounded-lg"
            style={{
              backgroundColor: '#3d010b',
              padding: '16px',
            }}
          >
            <div
              data-testid="skeleton-line"
              className="rounded"
              style={{
                height: '20px',
                width: '70%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                marginBottom: '12px',
              }}
            />
            <div
              data-testid="skeleton-line"
              className="rounded"
              style={{
                height: '14px',
                width: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                marginBottom: '8px',
              }}
            />
            <div
              data-testid="skeleton-line"
              className="rounded"
              style={{
                height: '14px',
                width: '40%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                marginBottom: '8px',
              }}
            />
            <div
              data-testid="skeleton-line"
              className="rounded"
              style={{
                height: '14px',
                width: '30%',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          data-testid="skeleton-row"
          className="animate-pulse rounded"
          style={{
            backgroundColor: '#3d010b',
            padding: '12px 16px',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <div
            data-testid="skeleton-bar"
            className="rounded"
            style={{
              height: '16px',
              flex: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <div
            data-testid="skeleton-bar"
            className="rounded"
            style={{
              height: '16px',
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }}
          />
          <div
            data-testid="skeleton-bar"
            className="rounded"
            style={{
              height: '16px',
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
            }}
          />
        </div>
      ))}
    </div>
  );
}
