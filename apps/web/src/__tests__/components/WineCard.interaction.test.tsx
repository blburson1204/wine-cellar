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
});
