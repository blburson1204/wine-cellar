import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import FilterDrawer from '../../components/FilterDrawer';
import WineFilters from '../../components/WineFilters';

describe('FilterDrawer Focus Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Focus trap', () => {
    it('should trap Tab key within drawer (cycles from last to first focusable)', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <FilterDrawer isOpen={true} onClose={onClose}>
          <WineFilters
            searchText=""
            onSearchChange={vi.fn()}
            selectedColors={[]}
            onColorsChange={vi.fn()}
            selectedGrapeVariety={null}
            onGrapeVarietyChange={vi.fn()}
            grapeVarieties={['Cabernet Sauvignon', 'Merlot']}
            selectedCountry={null}
            onCountryChange={vi.fn()}
            countries={['France', 'Italy']}
            showOnlyInCellar={false}
            onShowOnlyInCellarChange={vi.fn()}
            showOnlyFavorites={false}
            onShowOnlyFavoritesChange={vi.fn()}
            minRating={null}
            onMinRatingChange={vi.fn()}
            priceRange={null}
            onPriceRangeChange={vi.fn()}
            priceMin={0}
            priceMax={500}
            onClearAll={vi.fn()}
            showCloseButton={true}
            onClose={onClose}
          />
        </FilterDrawer>
      );

      // Wait for drawer to be fully rendered
      const drawer = screen.getByRole('dialog');
      expect(drawer).toBeInTheDocument();

      // Get all focusable elements within the drawer
      const focusableElements = drawer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(focusableElements.length).toBeGreaterThan(0);

      // Focus the last focusable element
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      lastElement.focus();
      expect(document.activeElement).toBe(lastElement);

      // Press Tab - should cycle back to first focusable element
      await user.tab();

      const firstElement = focusableElements[0] as HTMLElement;
      expect(document.activeElement).toBe(firstElement);
    });

    it('should trap Shift+Tab key within drawer (cycles from first to last focusable)', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <FilterDrawer isOpen={true} onClose={onClose}>
          <WineFilters
            searchText=""
            onSearchChange={vi.fn()}
            selectedColors={[]}
            onColorsChange={vi.fn()}
            selectedGrapeVariety={null}
            onGrapeVarietyChange={vi.fn()}
            grapeVarieties={['Cabernet Sauvignon', 'Merlot']}
            selectedCountry={null}
            onCountryChange={vi.fn()}
            countries={['France', 'Italy']}
            showOnlyInCellar={false}
            onShowOnlyInCellarChange={vi.fn()}
            showOnlyFavorites={false}
            onShowOnlyFavoritesChange={vi.fn()}
            minRating={null}
            onMinRatingChange={vi.fn()}
            priceRange={null}
            onPriceRangeChange={vi.fn()}
            priceMin={0}
            priceMax={500}
            onClearAll={vi.fn()}
            showCloseButton={true}
            onClose={onClose}
          />
        </FilterDrawer>
      );

      // Wait for drawer to be fully rendered
      const drawer = screen.getByRole('dialog');
      expect(drawer).toBeInTheDocument();

      // Get all focusable elements within the drawer
      const focusableElements = drawer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(focusableElements.length).toBeGreaterThan(0);

      // Focus the first focusable element
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement.focus();
      expect(document.activeElement).toBe(firstElement);

      // Press Shift+Tab - should cycle back to last focusable element
      await user.tab({ shift: true });

      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      expect(document.activeElement).toBe(lastElement);
    });

    it('should not allow focus to escape drawer when tabbing', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      // Render with an element outside the drawer
      render(
        <>
          <button data-testid="outside-button">Outside</button>
          <FilterDrawer isOpen={true} onClose={onClose}>
            <WineFilters
              searchText=""
              onSearchChange={vi.fn()}
              selectedColors={[]}
              onColorsChange={vi.fn()}
              selectedGrapeVariety={null}
              onGrapeVarietyChange={vi.fn()}
              grapeVarieties={['Cabernet Sauvignon', 'Merlot']}
              selectedCountry={null}
              onCountryChange={vi.fn()}
              countries={['France', 'Italy']}
              showOnlyInCellar={false}
              onShowOnlyInCellarChange={vi.fn()}
              showOnlyFavorites={false}
              onShowOnlyFavoritesChange={vi.fn()}
              minRating={null}
              onMinRatingChange={vi.fn()}
              priceRange={null}
              onPriceRangeChange={vi.fn()}
              priceMin={0}
              priceMax={500}
              onClearAll={vi.fn()}
              showCloseButton={true}
              onClose={onClose}
            />
          </FilterDrawer>
        </>
      );

      const drawer = screen.getByRole('dialog');
      const outsideButton = screen.getByTestId('outside-button');

      // Get all focusable elements within the drawer
      const focusableElements = drawer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      // Tab through all focusable elements multiple times
      for (let i = 0; i < focusableElements.length + 5; i++) {
        await user.tab();
        // Focus should never escape to the outside button
        expect(document.activeElement).not.toBe(outsideButton);
      }
    });
  });

  describe('Auto-focus on open', () => {
    it('should focus first focusable element when drawer opens', () => {
      const onClose = vi.fn();

      const { rerender } = render(
        <FilterDrawer isOpen={false} onClose={onClose}>
          <WineFilters
            searchText=""
            onSearchChange={vi.fn()}
            selectedColors={[]}
            onColorsChange={vi.fn()}
            selectedGrapeVariety={null}
            onGrapeVarietyChange={vi.fn()}
            grapeVarieties={['Cabernet Sauvignon', 'Merlot']}
            selectedCountry={null}
            onCountryChange={vi.fn()}
            countries={['France', 'Italy']}
            showOnlyInCellar={false}
            onShowOnlyInCellarChange={vi.fn()}
            showOnlyFavorites={false}
            onShowOnlyFavoritesChange={vi.fn()}
            minRating={null}
            onMinRatingChange={vi.fn()}
            priceRange={null}
            onPriceRangeChange={vi.fn()}
            priceMin={0}
            priceMax={500}
            onClearAll={vi.fn()}
            showCloseButton={true}
            onClose={onClose}
          />
        </FilterDrawer>
      );

      // Drawer is closed - nothing should be focused
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Open the drawer
      rerender(
        <FilterDrawer isOpen={true} onClose={onClose}>
          <WineFilters
            searchText=""
            onSearchChange={vi.fn()}
            selectedColors={[]}
            onColorsChange={vi.fn()}
            selectedGrapeVariety={null}
            onGrapeVarietyChange={vi.fn()}
            grapeVarieties={['Cabernet Sauvignon', 'Merlot']}
            selectedCountry={null}
            onCountryChange={vi.fn()}
            countries={['France', 'Italy']}
            showOnlyInCellar={false}
            onShowOnlyInCellarChange={vi.fn()}
            showOnlyFavorites={false}
            onShowOnlyFavoritesChange={vi.fn()}
            minRating={null}
            onMinRatingChange={vi.fn()}
            priceRange={null}
            onPriceRangeChange={vi.fn()}
            priceMin={0}
            priceMax={500}
            onClearAll={vi.fn()}
            showCloseButton={true}
            onClose={onClose}
          />
        </FilterDrawer>
      );

      // Get the drawer and first focusable element
      const drawer = screen.getByRole('dialog');
      const focusableElements = drawer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);
      const firstElement = focusableElements[0] as HTMLElement;

      // First focusable element should be focused
      expect(document.activeElement).toBe(firstElement);
    });
  });

  describe('Focus restoration on close', () => {
    it('should restore focus to trigger element when drawer closes', async () => {
      const user = userEvent.setup();

      // Create a component with a trigger button
      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <div>
            <button data-testid="trigger" onClick={() => setIsOpen(true)}>
              Open Filters
            </button>
            <FilterDrawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
              <WineFilters
                searchText=""
                onSearchChange={vi.fn()}
                selectedColors={[]}
                onColorsChange={vi.fn()}
                selectedGrapeVariety={null}
                onGrapeVarietyChange={vi.fn()}
                grapeVarieties={['Cabernet Sauvignon', 'Merlot']}
                selectedCountry={null}
                onCountryChange={vi.fn()}
                countries={['France', 'Italy']}
                showOnlyInCellar={false}
                onShowOnlyInCellarChange={vi.fn()}
                showOnlyFavorites={false}
                onShowOnlyFavoritesChange={vi.fn()}
                minRating={null}
                onMinRatingChange={vi.fn()}
                priceRange={null}
                onPriceRangeChange={vi.fn()}
                priceMin={0}
                priceMax={500}
                onClearAll={vi.fn()}
                showCloseButton={true}
                onClose={() => setIsOpen(false)}
              />
            </FilterDrawer>
          </div>
        );
      };

      render(<TestComponent />);

      const trigger = screen.getByTestId('trigger');

      // Click trigger to open drawer
      await user.click(trigger);

      // Drawer should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click close button in drawer
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Drawer should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Focus should be restored to trigger button
      expect(document.activeElement).toBe(trigger);
    });

    it('should restore focus when drawer is closed via Escape key', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <div>
            <button data-testid="trigger" onClick={() => setIsOpen(true)}>
              Open Filters
            </button>
            <FilterDrawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
              <WineFilters
                searchText=""
                onSearchChange={vi.fn()}
                selectedColors={[]}
                onColorsChange={vi.fn()}
                selectedGrapeVariety={null}
                onGrapeVarietyChange={vi.fn()}
                grapeVarieties={['Cabernet Sauvignon', 'Merlot']}
                selectedCountry={null}
                onCountryChange={vi.fn()}
                countries={['France', 'Italy']}
                showOnlyInCellar={false}
                onShowOnlyInCellarChange={vi.fn()}
                showOnlyFavorites={false}
                onShowOnlyFavoritesChange={vi.fn()}
                minRating={null}
                onMinRatingChange={vi.fn()}
                priceRange={null}
                onPriceRangeChange={vi.fn()}
                priceMin={0}
                priceMax={500}
                onClearAll={vi.fn()}
                showCloseButton={true}
                onClose={() => setIsOpen(false)}
              />
            </FilterDrawer>
          </div>
        );
      };

      render(<TestComponent />);

      const trigger = screen.getByTestId('trigger');

      // Click trigger to open drawer
      await user.click(trigger);

      // Drawer should be open
      const drawer = screen.getByRole('dialog');
      expect(drawer).toBeInTheDocument();

      // Press Escape to close drawer
      await user.keyboard('{Escape}');

      // Drawer should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Focus should be restored to trigger button
      expect(document.activeElement).toBe(trigger);
    });
  });
});
