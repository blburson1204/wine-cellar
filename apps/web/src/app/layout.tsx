import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wine Cellar',
  description: 'Manage your wine collection',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: '20px' }}>
        <header style={{ marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>Wine Cellar</h1>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
