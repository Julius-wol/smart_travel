import React from 'react';
import renderer, { act } from 'react-test-renderer';
import CheckoutScreen from '../src/screens/CheckoutScreen';
import { DatePickerModal } from '../src/components/DatePickerModal';
import { loadBookingCalendar } from '../src/services/bookingCalendar';

jest.mock('../src/services/bookingCalendar', () => ({
  ...jest.requireActual('../src/services/bookingCalendar'),
  loadBookingCalendar: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('../src/components/ToastNotification', () => () => null);
jest.mock('../src/components/LoadingOverlay', () => () => null);

describe('RUN-S88-001 / TC-S88-001: change checkout dates', () => {
  let screen;
  let networkSpy;
  let previousFetch;

  const amount = (testID) => screen.root.findByProps({ testID }).props.children;
  const press = async (testID) => act(async () => {
    screen.root.findByProps({ testID }).props.onPress();
  });
  const enterRange = async (checkIn, checkOut) => {
    await press('checkIn-date-selector');
    await press(`calendar-day-${checkIn}`);
    await press(`calendar-day-${checkOut}`);
  };

  beforeEach(async () => {
    loadBookingCalendar.mockResolvedValue([]);
    previousFetch = global.fetch;
    networkSpy = jest.fn(() => { throw new Error('No live booking or payment allowed'); });
    global.fetch = networkSpy;
    await act(async () => {
      screen = renderer.create(
        <CheckoutScreen
          navigation={{ navigate: jest.fn(), replace: jest.fn(), popTo: jest.fn() }}
          route={{ params: {
            homestay: { _id: 'P-A', name: 'P-A / R-A', pricePerNight: 1850000 },
            user: { _id: 'U-A', firstName: 'Test', lastName: 'User', phone: '0901234567', email: 'test@example.com' },
            checkIn: '2026-11-10T14:00:00',
            checkOut: '2026-11-12T12:00:00',
            nights: 2,
          } }}
        />
      );
    });
  });

  afterEach(async () => {
    await act(async () => screen.unmount());
    global.fetch = previousFetch;
  });

  it('changes 10–12/11 to 11–14/11 and replaces every old amount with 5.550.000đ', async () => {
    expect(amount('checkout-room-total')).toBe('3.700.000đ');
    expect(amount('checkout-total-amount')).toBe('3.700.000đ');
    await press('checkout-edit-dates-btn');
    expect(screen.root.findByType(DatePickerModal).props.visible).toBe(true);
    await enterRange('2026-11-11', '2026-11-14');
    await press('apply-date-modal-btn');

    expect(screen.root.findByType(DatePickerModal).props.visible).toBe(false);
    expect(screen.root.findByType(DatePickerModal).props.initialCheckIn).toBe('2026-11-11');
    expect(screen.root.findByType(DatePickerModal).props.initialCheckOut).toBe('2026-11-14');
    for (const testID of ['checkout-room-total', 'checkout-total-amount', 'checkout-bottom-total']) {
      expect(amount(testID)).toBe('5.550.000đ');
    }
    const rendered = JSON.stringify(screen.toJSON());
    expect(rendered).toContain('11/11/2026');
    expect(rendered).toContain('14/11/2026');
    expect(amount('checkout-nights')).toEqual([3, ' đêm']);
    expect(rendered).not.toContain('3.700.000');
    expect(rendered).not.toContain('SMART2026');
    expect(networkSpy).not.toHaveBeenCalled();
  });

  it('prevents checkout before check-in and discards unconfirmed changes on close', async () => {
    await press('checkout-edit-dates-btn');
    await press('calendar-day-2026-11-14');
    expect(screen.root.findByProps({ testID: 'calendar-day-2026-11-11' }).props.disabled).toBe(true);
    expect(screen.root.findByProps({ testID: 'apply-date-modal-btn' }).props.disabled).toBe(true);
    expect(screen.root.findByType(DatePickerModal).props.visible).toBe(true);
    expect(amount('checkout-total-amount')).toBe('3.700.000đ');
    await press('close-date-modal-btn');
    await press('checkout-edit-dates-btn');
    expect(screen.root.findByProps({ testID: 'checkIn-date-selector' }).props.accessibilityLabel).toContain('10/11/26');
    expect(screen.root.findByProps({ testID: 'checkOut-date-selector' }).props.accessibilityLabel).toContain('12/11/26');
    expect(networkSpy).not.toHaveBeenCalled();
  });

});
