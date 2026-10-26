import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import DatePickerModal from '../src/components/DatePickerModal';
import { loadBookingCalendar } from '../src/services/bookingCalendar';

jest.mock('../src/services/bookingCalendar', () => ({
  ...jest.requireActual('../src/services/bookingCalendar'),
  loadBookingCalendar: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));

describe('calendar date range picker', () => {
  let screen;
  let onApply;
  const press = async (testID) => act(async () => {
    screen.root.findByProps({ testID }).props.onPress();
  });
  const open = async (checkIn = '2026-10-26', checkOut = '2026-10-28', roomId) => act(async () => {
    screen = renderer.create(<DatePickerModal roomId={roomId} visible initialCheckIn={checkIn} initialCheckOut={checkOut} onClose={jest.fn()} onApply={onApply} />);
  });

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 9, 25, 12), doNotFake: ['setImmediate', 'setTimeout', 'clearTimeout', 'nextTick', 'queueMicrotask', 'performance'] });
    onApply = jest.fn();
    loadBookingCalendar.mockReset().mockResolvedValue([]);
  });
  afterEach(async () => {
    if (screen) await act(async () => screen.unmount());
    jest.useRealTimers();
  });

  it('has no keyboard input and disables past dates and incomplete ranges', async () => {
    await open();
    expect(screen.root.findAllByType(TextInput)).toHaveLength(0);
    expect(screen.root.findByProps({ testID: 'calendar-day-2026-10-24' }).props.disabled).toBe(true);
    expect(screen.root.findByProps({ testID: 'calendar-prev-month' }).props.disabled).toBe(true);
    await press('calendar-day-2026-10-28');
    expect(screen.root.findByProps({ testID: 'calendar-day-2026-10-28' }).props.disabled).toBe(true);
    expect(screen.root.findByProps({ testID: 'apply-date-modal-btn' }).props.disabled).toBe(true);
    await press('apply-date-modal-btn');
    expect(onApply).not.toHaveBeenCalled();
  });

  it('selects a cross-month range, highlights it, and sends ISO dates', async () => {
    await open();
    await press('calendar-day-2026-10-30');
    await press('calendar-next-month');
    await press('calendar-day-2026-11-03');
    expect(screen.root.findByProps({ testID: 'calendar-day-2026-11-03' }).props.accessibilityState.selected).toBe(true);
    expect(screen.root.findByProps({ testID: 'calendar-day-2026-11-01' }).props.style.some((style) => style?.backgroundColor === '#DFF6F1')).toBe(true);
    await press('apply-date-modal-btn');
    expect(onApply).toHaveBeenCalledWith({ checkIn: '2026-10-30', checkOut: '2026-11-03', nights: 4 });
  });

  it('handles leap day and year boundaries', async () => {
    await open('2028-02-28', '2028-03-01');
    await press('calendar-day-2028-02-29');
    await press('calendar-next-month');
    await press('calendar-day-2028-03-02');
    await press('apply-date-modal-btn');
    expect(onApply).toHaveBeenCalledWith({ checkIn: '2028-02-29', checkOut: '2028-03-02', nights: 2 });
  });

  it('keeps the chosen check-in when selecting a quick duration across the year boundary', async () => {
    await open('2026-12-30', '2027-01-01');
    await press('calendar-preset-4');
    await press('apply-date-modal-btn');
    expect(onApply).toHaveBeenCalledWith({ checkIn: '2026-12-30', checkOut: '2027-01-03', nights: 4 });
  });

  it('locks occupied nights and ranges crossing a booking, while allowing checkout at its start', async () => {
    loadBookingCalendar.mockResolvedValue([{ checkIn: '2026-11-12', checkOut: '2026-11-14' }]);
    await open('2026-11-10', '2026-11-11', 'room-a');
    expect(screen.root.findByProps({ testID: 'calendar-day-2026-11-12' }).props.disabled).toBe(true);
    expect(screen.root.findByProps({ testID: 'calendar-day-2026-11-14' }).props.disabled).toBe(false);
    await press('calendar-day-2026-11-10');
    expect(screen.root.findByProps({ testID: 'calendar-day-2026-11-12' }).props.disabled).toBe(false);
    expect(screen.root.findByProps({ testID: 'calendar-day-2026-11-14' }).props.disabled).toBe(true);
    expect(screen.root.findByProps({ testID: 'calendar-preset-4' }).props.disabled).toBe(true);
    await press('calendar-day-2026-11-12');
    await press('apply-date-modal-btn');
    expect(onApply).toHaveBeenCalledWith({ checkIn: '2026-11-10', checkOut: '2026-11-12', nights: 2 });
  });

  it('disables apply for an initially selected range which is now occupied', async () => {
    loadBookingCalendar.mockResolvedValue([{ checkIn: '2026-11-12', checkOut: '2026-11-14' }]);
    await open('2026-11-11', '2026-11-15', 'room-a');
    expect(screen.root.findByProps({ testID: 'apply-date-modal-btn' }).props.disabled).toBe(true);
    expect(JSON.stringify(screen.toJSON())).toContain('có đêm đã được đặt');
  });

  it('does not show a failed request as free availability, and allows retry', async () => {
    loadBookingCalendar.mockRejectedValueOnce(new Error('Offline')).mockResolvedValue([]);
    await open('2026-11-10', '2026-11-12', 'room-a');
    expect(screen.root.findByProps({ testID: 'apply-date-modal-btn' }).props.disabled).toBe(true);
    expect(screen.root.findByProps({ testID: 'calendar-day-2026-11-11' }).props.disabled).toBe(true);
    await press('calendar-retry');
    expect(screen.root.findByProps({ testID: 'apply-date-modal-btn' }).props.disabled).toBe(false);
  });

  it('ignores a late response after switching to a different room', async () => {
    let resolveRoomA;
    loadBookingCalendar.mockImplementationOnce(() => new Promise((resolve) => { resolveRoomA = resolve; })).mockResolvedValue([]);
    await open('2026-11-10', '2026-11-12', 'room-a');
    await act(async () => screen.update(<DatePickerModal visible roomId="room-b" initialCheckIn="2026-11-10" initialCheckOut="2026-11-12" onClose={jest.fn()} onApply={onApply} />));
    await act(async () => resolveRoomA([{ checkIn: '2026-11-10', checkOut: '2026-11-20' }]));
    expect(screen.root.findByProps({ testID: 'calendar-day-2026-11-11' }).props.disabled).toBe(false);
    expect(screen.root.findByProps({ testID: 'apply-date-modal-btn' }).props.disabled).toBe(false);
  });
});
