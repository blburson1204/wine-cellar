import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import WineDetailModal from '../../components/WineDetailModal';

// Mock useMediaQuery
vi.mock('../../hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(),
}));

import { useMediaQuery } from '../../hooks/useMediaQuery';

const mockWine = {
  id: '1',
  name: 'Test Wine',
  vintage: 2020,
  producer: 'Test Producer',
  region: 'Test Region',
  country: 'France',
  grapeVariety: 'Cabernet Sauvignon',
  blendDetail: null,
  color: 'RED',
  quantity: 6,
  purchasePrice: 50,
  purchaseDate: '2022-01-15',
  drinkByDate: '2030-12-31',
  rating: 4.5,
  notes: 'Great wine',
  expertRatings: null,
  wherePurchased: 'Wine Shop',
  wineLink: 'https://example.com/wine',
  favorite: false,
  imageUrl: null,
};

describe('WineDetailModal Focus Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMediaQuery).mockReturnValue(false); // Desktop
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  describe('Focus restoration on close', () => {
    it('should restore focus to trigger element when modal closes (view mode)', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <div>
            <button data-testid="trigger" onClick={() => setIsOpen(true)}>
              View Wine
            </button>
            {isOpen && (
              <WineDetailModal
                wine={mockWine}
                onClose={() => setIsOpen(false)}
                onUpdate={vi.fn()}
                onDelete={vi.fn()}
                onToggleFavorite={vi.fn()}
              />
            )}
          </div>
        );
      };

      render(<TestComponent />);

      const trigger = screen.getByTestId('trigger');

      // Click trigger to open modal
      await user.click(trigger);

      // Modal should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Close modal using close button
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Modal should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Focus should be restored to trigger button
      expect(document.activeElement).toBe(trigger);
    });

    it('should restore focus to trigger element when modal closes (add mode)', async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn().mockResolvedValue({
        ...mockWine,
        id: '2',
      });

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <div>
            <button data-testid="trigger" onClick={() => setIsOpen(true)}>
              Add Wine
            </button>
            {isOpen && (
              <WineDetailModal
                wine={null}
                onClose={() => setIsOpen(false)}
                onUpdate={vi.fn()}
                onCreate={onCreate}
                mode="add"
              />
            )}
          </div>
        );
      };

      render(<TestComponent />);

      const trigger = screen.getByTestId('trigger');

      // Click trigger to open modal
      await user.click(trigger);

      // Modal should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Close modal using cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Modal should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Focus should be restored to trigger button
      expect(document.activeElement).toBe(trigger);
    });

    it('should restore focus when modal is closed via Escape key (view mode)', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <div>
            <button data-testid="trigger" onClick={() => setIsOpen(true)}>
              View Wine
            </button>
            {isOpen && (
              <WineDetailModal
                wine={mockWine}
                onClose={() => setIsOpen(false)}
                onUpdate={vi.fn()}
                onDelete={vi.fn()}
                onToggleFavorite={vi.fn()}
              />
            )}
          </div>
        );
      };

      render(<TestComponent />);

      const trigger = screen.getByTestId('trigger');

      // Click trigger to open modal
      await user.click(trigger);

      // Modal should be open
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      // Press Escape to close modal
      await user.keyboard('{Escape}');

      // Modal should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Focus should be restored to trigger button
      expect(document.activeElement).toBe(trigger);
    });

    it('should restore focus when modal is closed via Escape key (add mode)', async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn().mockResolvedValue({
        ...mockWine,
        id: '2',
      });

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <div>
            <button data-testid="trigger" onClick={() => setIsOpen(true)}>
              Add Wine
            </button>
            {isOpen && (
              <WineDetailModal
                wine={null}
                onClose={() => setIsOpen(false)}
                onUpdate={vi.fn()}
                onCreate={onCreate}
                mode="add"
              />
            )}
          </div>
        );
      };

      render(<TestComponent />);

      const trigger = screen.getByTestId('trigger');

      // Click trigger to open modal
      await user.click(trigger);

      // Modal should be open
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      // Press Escape to close modal
      await user.keyboard('{Escape}');

      // Modal should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Focus should be restored to trigger button
      expect(document.activeElement).toBe(trigger);
    });

    it('should restore focus to different trigger element based on which one opened the modal', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        const [selectedWine, setSelectedWine] = React.useState<typeof mockWine | null>(null);

        return (
          <div>
            <button
              data-testid="trigger1"
              onClick={() => {
                setSelectedWine(mockWine);
                setIsOpen(true);
              }}
            >
              View Wine 1
            </button>
            <button
              data-testid="trigger2"
              onClick={() => {
                setSelectedWine({ ...mockWine, id: '2', name: 'Different Wine' });
                setIsOpen(true);
              }}
            >
              View Wine 2
            </button>
            {isOpen && selectedWine && (
              <WineDetailModal
                wine={selectedWine}
                onClose={() => setIsOpen(false)}
                onUpdate={vi.fn()}
                onDelete={vi.fn()}
                onToggleFavorite={vi.fn()}
              />
            )}
          </div>
        );
      };

      render(<TestComponent />);

      const trigger1 = screen.getByTestId('trigger1');
      const trigger2 = screen.getByTestId('trigger2');

      // Test with first trigger
      await user.click(trigger1);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(document.activeElement).toBe(trigger1);

      // Test with second trigger
      await user.click(trigger2);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const closeButton2 = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton2);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(document.activeElement).toBe(trigger2);
    });
  });

  describe('Focus restoration on close (mobile)', () => {
    beforeEach(() => {
      vi.mocked(useMediaQuery).mockReturnValue(true); // Mobile
    });

    it('should restore focus to trigger element when modal closes on mobile', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <div>
            <button data-testid="trigger" onClick={() => setIsOpen(true)}>
              View Wine
            </button>
            {isOpen && (
              <WineDetailModal
                wine={mockWine}
                onClose={() => setIsOpen(false)}
                onUpdate={vi.fn()}
                onDelete={vi.fn()}
                onToggleFavorite={vi.fn()}
              />
            )}
          </div>
        );
      };

      render(<TestComponent />);

      const trigger = screen.getByTestId('trigger');

      // Click trigger to open modal
      await user.click(trigger);

      // Modal should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Close modal using close button
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Modal should be closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Focus should be restored to trigger button
      expect(document.activeElement).toBe(trigger);
    });
  });
});
