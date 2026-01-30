import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
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

const defaultProps = {
  wine: mockWine,
  onClose: vi.fn(),
  onUpdate: vi.fn().mockResolvedValue(undefined),
  onDelete: vi.fn(),
  onToggleFavorite: vi.fn(),
};

describe('WineDetailModal Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMediaQuery).mockReturnValue(false); // Desktop
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  describe('View mode', () => {
    it('has no accessibility violations in view mode (desktop)', async () => {
      const { container } = render(<WineDetailModal {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations in view mode (mobile)', async () => {
      vi.mocked(useMediaQuery).mockReturnValue(true);
      const { container } = render(<WineDetailModal {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when favorite', async () => {
      const { container } = render(
        <WineDetailModal {...defaultProps} wine={{ ...mockWine, favorite: true }} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Add mode', () => {
    it('has no accessibility violations in add mode (desktop)', async () => {
      const { container } = render(
        <WineDetailModal
          wine={null}
          onClose={vi.fn()}
          onUpdate={vi.fn()}
          onCreate={vi.fn()}
          mode="add"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations in add mode (mobile)', async () => {
      vi.mocked(useMediaQuery).mockReturnValue(true);
      const { container } = render(
        <WineDetailModal
          wine={null}
          onClose={vi.fn()}
          onUpdate={vi.fn()}
          onCreate={vi.fn()}
          mode="add"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
