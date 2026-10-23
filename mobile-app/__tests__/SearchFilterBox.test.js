import React from 'react';
import renderer from 'react-test-renderer';
import {
  SearchFilterBox,
  formatCleanDateRange,
  formatCleanNights,
} from '../src/components/SearchFilterBox';

describe('SearchFilterBox Component & Date Formatters (SMART-84)', () => {
  describe('formatCleanDateRange helper', () => {
    it('normalizes Vietnamese month format "15 Th05 – 18 Th05" to "15/05 – 18/05"', () => {
      expect(formatCleanDateRange('15 Th05 – 18 Th05')).toBe('15/05 – 18/05');
      expect(formatCleanDateRange('15 Th5 - 18 Th5')).toBe('15/05 – 18/05');
      expect(formatCleanDateRange('15 thg 5 – 18 thg 5')).toBe('15/05 – 18/05');
    });

    it('normalizes ISO date range "2026-10-25 – 2026-10-28" to "25/10 – 28/10"', () => {
      expect(formatCleanDateRange('2026-10-25 – 2026-10-28')).toBe('25/10 – 28/10');
    });

    it('returns default fallback when null or undefined', () => {
      expect(formatCleanDateRange(null)).toBe('15/05 – 18/05');
      expect(formatCleanDateRange('')).toBe('15/05 – 18/05');
    });

    it('preserves clean DD/MM – DD/MM format', () => {
      expect(formatCleanDateRange('15/05 – 18/05')).toBe('15/05 – 18/05');
    });
  });

  describe('formatCleanNights helper', () => {
    it('cleans overflow time suffixes like "3 đêm (14:00 - 12:00)" to "3 đêm"', () => {
      expect(formatCleanNights('3 đêm (14:00 - 12:00)')).toBe('3 đêm');
      expect(formatCleanNights('5 đêm')).toBe('5 đêm');
      expect(formatCleanNights(null)).toBe('3 đêm');
    });
  });

  describe('SearchFilterBox rendering', () => {
    it('renders clean formatted date and night texts without line break overflow', async () => {
      let component;
      await renderer.act(async () => {
        component = renderer.create(
          <SearchFilterBox
            dateRangeText="15 Th05 – 18 Th05"
            nightsText="3 đêm (14:00 - 12:00)"
            guestRoomText="2 khách • 1 phòng"
          />
        );
      });
      const str = JSON.stringify(component.toJSON());
      expect(str).toContain('15/05 – 18/05');
      expect(str).toContain('3 đêm');
      expect(str).toContain('2 khách • 1 phòng');
    });

    it('renders active filter badge when activeFilterCount > 0', async () => {
      let component;
      await renderer.act(async () => {
        component = renderer.create(
          <SearchFilterBox activeFilterCount={2} />
        );
      });
      const str = JSON.stringify(component.toJSON());
      expect(str).toContain('2');
    });
  });
});
