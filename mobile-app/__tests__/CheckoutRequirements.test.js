import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import CheckoutScreen from '../src/screens/CheckoutScreen';
import LoadingOverlay from '../src/components/LoadingOverlay';
import ToastNotification from '../src/components/ToastNotification';
import { DatePickerModal } from '../src/components/DatePickerModal';
import { checkCheckoutAvailability, createCheckoutBooking } from '../src/services/checkoutBooking';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
jest.mock('../src/components/ToastNotification', () => () => null);
jest.mock('../src/components/LoadingOverlay', () => () => null);
jest.mock('../src/services/checkoutBooking', () => ({
  checkCheckoutAvailability: jest.fn(), createCheckoutBooking: jest.fn(),
}));

const user = { _id: 'U-A', lastName: 'Nguyễn Văn', firstName: 'An', phone: '0901234567', email: 'an@example.com' };
const homestay = { _id: 'P-A', pricePerNight: 1850000 };
const unavailable = 'Hiện tại, phòng của bạn đã được đặt trong thời gian bạn chọn. Vui lòng chọn thời điểm khác';
const contactMessage = 'Vui lòng điền đầy đủ và chính xác thông tin liên hệ.';

describe('SMART-88 checkout requirements 014–025 with readonly contact fields', () => {
  let screen;
  let navigation;
  let pending;
  const input = (testID) => screen.root.findByProps({ testID });
  const press = async (testID) => act(async () => { input(testID).props.onPress(); });
  const submit = async () => act(async () => { pending = input('checkout-submit').props.onPress(); });
  const finishSimulation = async () => {
    await act(async () => { jest.advanceTimersByTime(1500); });
    await pending;
  };
  const renderScreen = async (account = user) => act(async () => {
    const props = { navigation, route: { params: {
      user: account, homestay, token: 'test-only', checkIn: '2026-11-10T14:00:00', nights: 2,
    } } };
    if (screen) screen.update(<CheckoutScreen {...props} />);
    else screen = renderer.create(<CheckoutScreen {...props} />);
  });

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    navigation = { replace: jest.fn(), popTo: jest.fn() };
    checkCheckoutAvailability.mockResolvedValue({ ok: true, body: { success: true, available: true } });
    createCheckoutBooking.mockResolvedValue({ ok: true, status: 201, body: {
      success: true, bookingCode: 'ST-1234', data: { totalPrice: 3700000 },
    } });
    await renderScreen();
  });
  afterEach(async () => {
    await act(async () => screen.unmount());
    screen = null;
    jest.useRealTimers();
  });

  it('keeps all three account fields readonly', () => {
    for (const id of ['checkout-full-name', 'checkout-phone', 'checkout-email']) {
      expect(input(id).props.editable).toBe(false);
      expect(input(id).props.onChangeText).toBeUndefined();
    }
  });

  it.each(['', 'invalid-email', 'name@@example.com', 'name@example', 'a..b@example.com', 'name@-example.com', 'name @example.com'])
  ('014: blocks invalid account email %j before any request and highlights it red', async (email) => {
    await renderScreen({ ...user, email });
    await submit();
    expect(checkCheckoutAvailability).not.toHaveBeenCalled();
    expect(createCheckoutBooking).not.toHaveBeenCalled();
    expect(StyleSheet.flatten(input('checkout-email').props.style).borderColor).toBe('#E53E3E');
    expect(screen.root.findByType(ToastNotification).props.message).toBe(contactMessage);
  });

  it('015 adapted: accepts corrected account data when Checkout receives the updated profile', async () => {
    await renderScreen({ ...user, email: 'invalid' });
    await submit();
    await renderScreen({ ...user, email: 'fixed@example.com' });
    await submit();
    await finishSimulation();
    expect(createCheckoutBooking.mock.calls[0][0].email).toBe('fixed@example.com');
    expect(navigation.replace).toHaveBeenCalledWith('BookingSuccess', expect.any(Object));
  });

  it('016/022: submits without a note and uses the new booking code for SMART-90', async () => {
    await submit();
    await finishSimulation();
    expect(createCheckoutBooking).toHaveBeenCalledWith(expect.objectContaining({
      roomId: 'P-A', userId: 'U-A', specialNote: '', nights: 2, totalPrice: 3700000,
      paymentMethod: 'NAPAS_QR', email: user.email,
    }), 'test-only');
    expect(navigation.replace).toHaveBeenCalledWith('BookingSuccess', expect.objectContaining({ bookingCode: 'ST-1234' }));
  });

  it('017/018: accepts exactly 200 note characters and blocks character 201', async () => {
    await act(async () => input('checkout-special-note').props.onChangeText('A'.repeat(201)));
    expect(input('checkout-special-note').props.value).toHaveLength(200);
    await submit();
    await finishSimulation();
    expect(createCheckoutBooking.mock.calls[0][0].specialNote).toBe('A'.repeat(200));
  });

  it('does not submit a hidden note when the checkbox is cleared', async () => {
    await act(async () => input('checkout-special-note').props.onChangeText('Private note'));
    await press('checkout-note-toggle');
    await submit();
    await finishSimulation();
    expect(createCheckoutBooking.mock.calls[0][0].specialNote).toBe('');
  });

  it('019/020: defaults to Napas QR and selects exactly one of three methods', async () => {
    const ids = ['checkout-method-qr', 'checkout-method-wallet', 'checkout-method-device'];
    expect(input(ids[0]).props.accessibilityState.checked).toBe(true);
    for (const selected of ids) {
      await press(selected);
      expect(ids.map((id) => input(id).props.accessibilityState.checked)).toEqual(ids.map((id) => id === selected));
    }
  });

  it('023: submits the newly selected dates, three nights and 5.550.000đ', async () => {
    createCheckoutBooking.mockResolvedValue({ ok: true, status: 201, body: {
      success: true, bookingCode: 'ST-5678', data: { totalPrice: 5550000 },
    } });
    await act(async () => screen.root.findByType(DatePickerModal).props.onApply({ checkIn: '2026-11-11', nights: 3 }));
    await submit();
    await finishSimulation();
    const payload = createCheckoutBooking.mock.calls[0][0];
    expect(new Date(payload.checkIn).getDate()).toBe(11);
    expect(new Date(payload.checkOut).getDate()).toBe(14);
    expect(payload).toMatchObject({ nights: 3, totalPrice: 5550000 });
    expect(navigation.replace.mock.calls[0][1].bookingDetails).toMatchObject({ nights: 3, totalAmount: '5.550.000đ' });
  });

  it('024: simulates for exactly 1500ms, independently of the create request; blocks double submit', async () => {
    let finishRequest;
    createCheckoutBooking.mockImplementation(() => new Promise((resolve) => { finishRequest = resolve; }));
    await submit();
    expect(screen.root.findByType(LoadingOverlay).props.visible).toBe(true);
    await act(async () => { jest.advanceTimersByTime(1499); });
    expect(createCheckoutBooking).not.toHaveBeenCalled();
    await act(async () => { jest.advanceTimersByTime(1); });
    expect(screen.root.findByType(LoadingOverlay).props.visible).toBe(false);
    expect(input('checkout-submit').props.disabled).toBe(true);
    await press('checkout-submit');
    expect(checkCheckoutAvailability).toHaveBeenCalledTimes(1);
    await act(async () => { finishRequest({ ok: true, body: { success: true, bookingCode: 'ST-1234' } }); });
    await pending;
  });

  it('025: blocks an unavailable room at submit and displays CR_BOOK_09', async () => {
    checkCheckoutAvailability.mockResolvedValue({ ok: true, body: { success: true, available: false } });
    await submit();
    expect(createCheckoutBooking).not.toHaveBeenCalled();
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(screen.root.findByType(ToastNotification).props).toMatchObject({ visible: true, message: unavailable });
  });

  it('025: handles a booking conflict after the availability snapshot without navigating to success', async () => {
    createCheckoutBooking.mockResolvedValue({ ok: false, status: 409, body: { code: 'CR_BOOK_09' } });
    await submit();
    await finishSimulation();
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(screen.root.findByType(ToastNotification).props.message).toBe(unavailable);
  });

  it('does not create a booking if availability cannot be verified', async () => {
    checkCheckoutAvailability.mockRejectedValue(new Error('Network down'));
    await submit();
    expect(createCheckoutBooking).not.toHaveBeenCalled();
    expect(input('checkout-submit').props.disabled).toBe(false);
  });
});
