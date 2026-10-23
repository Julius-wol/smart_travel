import hostCalendarReducer, {
  setSelectedRoom,
  changeMonth,
  resetToCurrentMonth,
  openBlockModal,
  closeBlockModal,
  openUnblockModal,
  closeUnblockModal,
  setActivePopoverBooking,
} from '../src/store/slices/hostCalendarSlice';

describe('hostCalendarSlice reducer', () => {
  const initialState = {
    rooms: [],
    selectedRoom: null,
    currentMonth: 11,
    currentYear: 2026,
    kpi: {
      occupancyRate: 0,
      soldNights: 0,
      availableNights: 0,
      estimatedRevenue: 0,
    },
    calendarDays: [],
    selectedRange: { start: null, end: null },
    blockModalVisible: false,
    unblockModalVisible: false,
    targetUnblockDate: null,
    activePopoverBooking: null,
    loading: false,
    error: null,
  };

  test('should return initial state with default month 11 and year 2026', () => {
    const state = hostCalendarReducer(undefined, { type: 'unknown' });
    expect(state.currentMonth).toBe(11);
    expect(state.currentYear).toBe(2026);
  });

  test('should change month forward and backward', () => {
    let state = hostCalendarReducer(initialState, changeMonth(1));
    expect(state.currentMonth).toBe(12);
    expect(state.currentYear).toBe(2026);

    state = hostCalendarReducer(state, changeMonth(1));
    expect(state.currentMonth).toBe(1);
    expect(state.currentYear).toBe(2027);

    state = hostCalendarReducer(state, changeMonth(-1));
    expect(state.currentMonth).toBe(12);
    expect(state.currentYear).toBe(2026);
  });

  test('should reset to current month', () => {
    let state = hostCalendarReducer({ ...initialState, currentMonth: 3, currentYear: 2027 }, resetToCurrentMonth());
    expect(state.currentMonth).toBe(11);
    expect(state.currentYear).toBe(2026);
  });

  test('should toggle block and unblock modals', () => {
    let state = hostCalendarReducer(initialState, openBlockModal({ start: '2026-11-05', end: '2026-11-07' }));
    expect(state.blockModalVisible).toBe(true);
    expect(state.selectedRange.start).toBe('2026-11-05');

    state = hostCalendarReducer(state, closeBlockModal());
    expect(state.blockModalVisible).toBe(false);

    state = hostCalendarReducer(state, openUnblockModal('2026-11-08'));
    expect(state.unblockModalVisible).toBe(true);
    expect(state.targetUnblockDate).toBe('2026-11-08');

    state = hostCalendarReducer(state, closeUnblockModal());
    expect(state.unblockModalVisible).toBe(false);
    expect(state.targetUnblockDate).toBeNull();
  });

  test('should set active popover booking', () => {
    const booking = { id: 'bk-1', bookingCode: '#BK-9821', customerName: 'Nguyễn Văn An' };
    const state = hostCalendarReducer(initialState, setActivePopoverBooking(booking));
    expect(state.activePopoverBooking).toEqual(booking);
  });
});
