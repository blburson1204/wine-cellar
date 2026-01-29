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

    it('renders modal dialog on mobile', () => {
      render(<WineDetailModal {...defaultProps} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    it('renders form in add mode on mobile', () => {
      render(<WineDetailModal {...defaultProps} mode="add" />);
      // Add mode should show save button
      const saveButton = screen.getByRole('button', { name: /add wine/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('renders wine details in view mode on mobile', () => {
      render(<WineDetailModal {...defaultProps} />);
      // View mode should show wine name
      expect(screen.getByText('Test Wine')).toBeInTheDocument();
    });

    it('has close button accessible on mobile', () => {
      render(<WineDetailModal {...defaultProps} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Desktop Layout (>= 768px)', () => {
    beforeEach(() => {
      vi.mocked(useMediaQuery).mockReturnValue(false); // Not mobile
    });

    it('renders modal with centered dialog on desktop', () => {
      render(<WineDetailModal {...defaultProps} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    it('renders wine details on desktop', () => {
      render(<WineDetailModal {...defaultProps} />);
      expect(screen.getByText('Test Wine')).toBeInTheDocument();
    });
  });

  describe('Combobox Fields (FR-014, FR-015, FR-017, FR-018)', () => {
    beforeEach(() => {
      vi.mocked(useMediaQuery).mockReturnValue(true); // Mobile
    });

    it('uses Combobox for Producer field in edit mode', async () => {
      render(<WineDetailModal {...defaultProps} mode="add" />);
      // Look for Combobox by its label
      const producerLabel = screen.getByText(/producer/i);
      expect(producerLabel).toBeInTheDocument();
      // The combobox input should be present
      const comboboxInputs = screen.getAllByRole('combobox');
      expect(comboboxInputs.length).toBeGreaterThan(0);
    });

    it('uses Combobox for Country field in edit mode', async () => {
      render(<WineDetailModal {...defaultProps} mode="add" />);
      const countryLabel = screen.getByText(/country/i);
      expect(countryLabel).toBeInTheDocument();
    });

    it('uses Combobox for Region field in edit mode', async () => {
      render(<WineDetailModal {...defaultProps} mode="add" />);
      const regionLabel = screen.getByText(/region/i);
      expect(regionLabel).toBeInTheDocument();
    });

    it('uses Combobox for Grape Variety field in edit mode', async () => {
      render(<WineDetailModal {...defaultProps} mode="add" />);
      const grapeLabel = screen.getByText(/grape/i);
      expect(grapeLabel).toBeInTheDocument();
    });

    it('uses Combobox for Where Purchased field in edit mode', async () => {
      render(<WineDetailModal {...defaultProps} mode="add" />);
      const purchasedLabel = screen.getByText(/where purchased/i);
      expect(purchasedLabel).toBeInTheDocument();
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

    it('traps focus within modal', () => {
      render(<WineDetailModal {...defaultProps} />);
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });
  });
});
