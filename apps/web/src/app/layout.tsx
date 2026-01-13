import type { Metadata } from 'next';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Wine Cellar',
  description: 'Manage your wine collection',
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
          margin: 0,
          padding: 0,
          backgroundColor: '#282f20',
          color: '#4A1C26',
          position: 'relative',
          minHeight: '100vh',
        }}
      >
        <header
          style={{
            backgroundColor: '#09040a',
            padding: '16px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '28px' }} aria-hidden="true">
              🍷
            </span>
            <h1
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Wine Cellar
            </h1>
          </div>
        </header>
        <ErrorBoundary>
          <main
            style={{
              maxWidth: '1600px',
              margin: '0 auto',
              padding: '32px 24px',
            }}
          >
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
