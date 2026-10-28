import roomReducer, { setFilters, resetFilters, clearError } from '../src/store/slices/roomSlice';

describe('Room Redux Slice', () => {
  const defaultFilters = {
    city: 'Đà Nẵng, Sơn Trà',
    checkIn: null,
    checkOut: null,
    nights: 3,
    guests: 2,
    roomsCount: 1,
    minPrice: null,
    maxPrice: null,
    minRating: null,
    amenities: [],
  };

  const expectedInitialState = {
    rooms: [],
    totalCount: 0,
    page: 1,
    limit: 10,
    hasMore: false,
    isLoading: false,
    isLoadingMore: false,
    isRefreshing: false,
    error: null,
    filters: defaultFilters,
    activeFilterCount: 0,
  };

  it('should return initial state when passed empty action', () => {
    expect(roomReducer(undefined, { type: undefined })).toEqual(expectedInitialState);
  });

  it('should update filters and activeFilterCount correctly with setFilters', () => {
    const action = setFilters({ city: 'Hà Nội', minPrice: 500000, minRating: 4 });
    const state = roomReducer(expectedInitialState, action);

    expect(state.filters.city).toBe('Hà Nội');
    expect(state.filters.minPrice).toBe(500000);
    expect(state.filters.minRating).toBe(4);
    // minPrice counts as 1 filter, minRating counts as 1 filter -> activeFilterCount = 2
    expect(state.activeFilterCount).toBe(2);
    expect(state.page).toBe(1);
  });

  it('should reset filters to default with resetFilters', () => {
    const modifiedState = {
      ...expectedInitialState,
      filters: {
        ...defaultFilters,
        city: 'TP Hồ Chí Minh',
        minPrice: 1000000,
      },
      activeFilterCount: 1,
    };

    const state = roomReducer(modifiedState, resetFilters());
    expect(state.filters.city).toBe('Đà Nẵng, Sơn Trà');
    expect(state.filters.minPrice).toBeNull();
    expect(state.activeFilterCount).toBe(0);
  });

  it('should clear error with clearError', () => {
    const errorState = {
      ...expectedInitialState,
      error: 'Lỗi tải danh sách',
    };

    const state = roomReducer(errorState, clearError());
    expect(state.error).toBeNull();
  });

  it('should increment activeFilterCount when roomsCount > 1', () => {
    const action = setFilters({ roomsCount: 2 });
    const state = roomReducer(expectedInitialState, action);
    expect(state.filters.roomsCount).toBe(2);
    expect(state.activeFilterCount).toBe(1);
  });
});
