import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HomeDetailsScreen from '../src/screens/HomeDetailsScreen';
import { DatePickerModal } from '../src/components/DatePickerModal';
import { loadBookingCalendar } from '../src/services/bookingCalendar';

jest.mock('../src/services/bookingCalendar', () => ({
  ...jest.requireActual('../src/services/bookingCalendar'),
  loadBookingCalendar: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('../src/components/ToastNotification', () => () => null);

describe('HomeDetails stay dates', () => {
  let screen;
  let navigation;
  let originalFetch;

  beforeEach(() => {
    loadBookingCalendar.mockResolvedValue([]);
    navigation = { navigate: jest.fn(), addListener: jest.fn(() => jest.fn()) };
    originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    });
  });

  afterEach(async () => {
    if (screen) await act(async () => screen.unmount());
    global.fetch = originalFetch;
  });

  it('opens date editing and sends the changed range and price to checkout', async () => {
    await act(async () => {
      screen = renderer.create(
        <HomeDetailsScreen
          navigation={navigation}
          route={{ params: {
            selectedDates: { checkIn: '2027-01-30', checkOut: '2027-02-01', nights: 2 },
          } }}
        />
      );
    });
    await act(async () => {
      screen.root.findByProps({ testID: 'edit-stay-dates-btn' }).props.onPress();
    });
    expect(screen.root.findByType(DatePickerModal).props.visible).toBe(true);
    expect(screen.root.findByType(DatePickerModal).props.initialCheckIn).toBe('2027-01-30');

    for (const testID of ['calendar-next-month', 'calendar-day-2027-02-10', 'calendar-day-2027-02-15']) {
      await act(async () => screen.root.findByProps({ testID }).props.onPress());
    }
    await act(async () => {
      screen.root.findByProps({ testID: 'apply-date-modal-btn' }).props.onPress();
    });
    expect(screen.root.findByType(DatePickerModal).props.visible).toBe(false);
    expect(JSON.stringify(screen.toJSON())).toContain('7.250.000');

    const bookingButton = screen.root.findAll((node) =>
      typeof node.props.onPress === 'function' &&
      node.findAll((child) => child.props.children === 'Đặt phòng ngay').length > 0
    )[0];
    await act(async () => bookingButton.props.onPress());
    expect(navigation.navigate).toHaveBeenCalledWith('Checkout', expect.objectContaining({
      checkIn: new Date('2027-02-10').toISOString(),
      checkOut: new Date('2027-02-15').toISOString(),
      nights: 5,
    }));
  });
});
