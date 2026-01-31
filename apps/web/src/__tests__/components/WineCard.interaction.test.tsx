import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WineCard from '../../components/WineCard';

const mockWine = {
  id: '1',
  name: 'Chateau Margaux',
  vintage: 2019,
  producer: 'Chateau Margaux',
  region: 'Bordeaux',
  country: 'France',
  grapeVariety: 'Cabernet Sauvignon',
  blendDetail: null,
  color: 'RED',
  quantity: 6,
  purchasePrice: 350,
  purchaseDate: '2021-06-15',
  drinkByDate: '2035-12-31',
  rating: 95,
  notes: 'Exceptional vintage',
  expertRatings: null,
  wherePurchased: null,
  wineLink: null,
  favorite: false,
  imageUrl: null,
};

describe('WineCard Interactions', () => {
  const defaultProps = {
    wine: mockWine,
    onClick: vi.fn(),
    onToggleFavorite: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Card Click Handler (FR-003)', () => {
    it('calls onClick when card is clicked', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<WineCard {...defaultProps} onClick={onClick} />);

      const card = screen.getByRole('article');
      await user.click(card);

      expect(onClick).toHaveBeenCalledWith(mockWine);
    });

    it('does not call onClick when favorite button is clicked', async () => {
      const onClick = vi.fn();
      const onToggleFavorite = vi.fn();
      const user = userEvent.setup();
      render(<WineCard {...defaultProps} onClick={onClick} onToggleFavorite={onToggleFavorite} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      await user.click(favoriteButton);

      expect(onClick).not.toHaveBeenCalled();
      expect(onToggleFavorite).toHaveBeenCalled();
    });
  });

  describe('Favorite Toggle (FR-004)', () => {
    it('calls onToggleFavorite when favorite button is clicked', async () => {
      const onToggleFavorite = vi.fn();
      const user = userEvent.setup();
      render(<WineCard {...defaultProps} onToggleFavorite={onToggleFavorite} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      await user.click(favoriteButton);

      expect(onToggleFavorite).toHaveBeenCalledWith(mockWine);
    });

    it('calls onToggleFavorite with correct wine when toggling', async () => {
      const onToggleFavorite = vi.fn();
      const user = userEvent.setup();
      const favoriteWine = { ...mockWine, favorite: true };
      render(
        <WineCard {...defaultProps} wine={favoriteWine} onToggleFavorite={onToggleFavorite} />
      );

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      await user.click(favoriteButton);

      expect(onToggleFavorite).toHaveBeenCalledWith(favoriteWine);
    });
  });

  describe('Touch Targets (FR-010)', () => {
    it('has minimum 44px touch target for favorite button', () => {
      render(<WineCard {...defaultProps} />);
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      expect(favoriteButton).toHaveStyle({ minWidth: '44px', minHeight: '44px' });
    });

    it('has minimum 44px touch target for card click area', () => {
      render(<WineCard {...defaultProps} />);
      const card = screen.getByRole('article');
      expect(card).toHaveStyle({ minHeight: '44px' });
    });
  });

  describe('Keyboard Navigation (FR-005)', () => {
    it('card is focusable', () => {
      render(<WineCard {...defaultProps} />);
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('triggers onClick on Enter key press', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<WineCard {...defaultProps} onClick={onClick} />);

      const card = screen.getByRole('article');
      card.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledWith(mockWine);
    });

    it('triggers onClick on Space key press', async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(<WineCard {...defaultProps} onClick={onClick} />);

      const card = screen.getByRole('article');
      card.focus();
      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalledWith(mockWine);
    });

    it('favorite button is separately focusable', async () => {
      const user = userEvent.setup();
      render(<WineCard {...defaultProps} />);

      const card = screen.getByRole('article');
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });

      // Tab from card to favorite button
      card.focus();
      await user.tab();

      expect(favoriteButton).toHaveFocus();
    });
  });

  describe('Visual Feedback', () => {
    it('has hover styles (visible via class)', () => {
      render(<WineCard {...defaultProps} />);
      const card = screen.getByRole('article');
      // Card should have hover transition classes
      expect(card.className).toMatch(/hover:/);
    });

    it('has focus-visible styles for accessibility', () => {
      render(<WineCard {...defaultProps} />);
      const card = screen.getByRole('article');
      // Card should have focus-visible ring styles
      expect(card.className).toMatch(/focus-visible:/);
    });
  });

  describe('Favorite Button Keyboard Navigation', () => {
    it('triggers onToggleFavorite on favorite button Enter key', () => {
      const onToggleFavorite = vi.fn();
      render(<WineCard {...defaultProps} onToggleFavorite={onToggleFavorite} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      fireEvent.keyDown(favoriteButton, { key: 'Enter' });

      expect(onToggleFavorite).toHaveBeenCalledWith(mockWine);
    });

    it('triggers onToggleFavorite on favorite button Space key', () => {
      const onToggleFavorite = vi.fn();
      render(<WineCard {...defaultProps} onToggleFavorite={onToggleFavorite} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      fireEvent.keyDown(favoriteButton, { key: ' ' });

      expect(onToggleFavorite).toHaveBeenCalledWith(mockWine);
    });

    it('does not trigger onToggleFavorite on other keys', () => {
      const onToggleFavorite = vi.fn();
      render(<WineCard {...defaultProps} onToggleFavorite={onToggleFavorite} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      fireEvent.keyDown(favoriteButton, { key: 'Escape' });

      expect(onToggleFavorite).not.toHaveBeenCalled();
    });
  });

  describe('Event Propagation', () => {
    it('stops propagation on favorite button click', async () => {
      const onClick = vi.fn();
      const onToggleFavorite = vi.fn();
      const user = userEvent.setup();
      render(<WineCard {...defaultProps} onClick={onClick} onToggleFavorite={onToggleFavorite} />);

      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      await user.click(favoriteButton);

      // Favorite should be called but not card click
      expect(onToggleFavorite).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});
