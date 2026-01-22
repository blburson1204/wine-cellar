import { render, screen } from '@testing-library/react';
import RootLayout from '../src/app/layout';

// Mock the ErrorBoundary component
vi.mock('../src/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

describe('RootLayout', () => {
  it('renders children inside main content area', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders the Wine Cellar header', () => {
    render(
      <RootLayout>
        <div>Child</div>
      </RootLayout>
    );

    expect(screen.getByRole('heading', { name: 'Wine Cellar' })).toBeInTheDocument();
  });

  it('renders the wine emoji in header', () => {
    render(
      <RootLayout>
        <div>Child</div>
      </RootLayout>
    );

    expect(screen.getByText('🍷')).toBeInTheDocument();
  });

  it('wraps children in ErrorBoundary', () => {
    render(
      <RootLayout>
        <div>Child</div>
      </RootLayout>
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toContainElement(screen.getByText('Child'));
  });

  it('renders main element for content', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders header element', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders html element with lang attribute', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    // The layout renders an <html> element with lang="en"
    const html = document.querySelector('html[lang="en"]');
    expect(html).toBeInTheDocument();
  });

  it('includes Google Fonts preconnect links', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    // Check for preconnect links in the document
    const links = document.querySelectorAll('link[rel="preconnect"]');
    const hrefs = Array.from(links).map((link) => link.getAttribute('href'));

    expect(hrefs).toContain('https://fonts.googleapis.com');
    expect(hrefs).toContain('https://fonts.gstatic.com');
  });

  it('includes Inter font stylesheet link', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const fontLink = document.querySelector('link[href*="fonts.googleapis.com"][href*="Inter"]');
    expect(fontLink).toBeInTheDocument();
  });

  it('applies sticky positioning to header', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveStyle({ position: 'sticky' });
  });
});
