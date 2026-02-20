import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  rating: 90,
  notes: 'Great wine',
  expertRatings: null,
  wherePurchased: 'Wine Shop',
  wineLink: null,
  favorite: false,
  imageUrl: null,
};

describe('WineDetailModal Mobile Layout', () => {
  const defaultProps = {
    wine: mockWine,
    onClose: vi.fn(),
    onUpdate: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn(),
    onToggleFavorite: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  describe('Mobile Full-Screen Layout (< 768px)', () => {
    beforeEach(() => {
      vi.mocked(useMediaQuery).mockReturnValue(true); // Is mobile
    });

    it('renders form in add mode on mobile', () => {
      render(<WineDetailModal {...defaultProps} mode="add" />);
      const saveButton = screen.getByRole('button', { name: /add wine/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('renders wine details in view mode on mobile', () => {
      render(<WineDetailModal {...defaultProps} />);
      expect(screen.getByText('Test Wine')).toBeInTheDocument();
    });

    it('has close button accessible on mobile', () => {
      render(<WineDetailModal {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Combobox Fields', () => {
    beforeEach(() => {
      vi.mocked(useMediaQuery).mockReturnValue(true); // Mobile
    });

    it('renders combobox inputs in add mode', async () => {
      render(<WineDetailModal {...defaultProps} mode="add" />);
      const comboboxInputs = screen.getAllByRole('combobox');
      expect(comboboxInputs.length).toBeGreaterThan(0);
    });
  });

  describe('Modal Behavior', () => {
    beforeEach(() => {
      vi.mocked(useMediaQuery).mockReturnValue(true);
    });

    it('closes on close button click', async () => {
      const onClose = vi.fn();
      render(<WineDetailModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      closeButton.click();

      expect(onClose).toHaveBeenCalled();
    });
  });
});
