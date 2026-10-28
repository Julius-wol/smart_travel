import wishlistReducer, { clearToast } from '../src/store/slices/wishlistSlice';

describe('Wishlist Redux Slice', () => {
  const initialState = {
    savedRoomIds: {},
    toastMessage: null,
  };

  it('should return initial state when passed undefined', () => {
    expect(wishlistReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should clear toast message with clearToast', () => {
    const stateWithToast = {
      savedRoomIds: { 'room-123': true },
      toastMessage: {
        id: 'CR_BOOK_01',
        text: 'Đã thêm phòng vào danh sách yêu thích',
        type: 'success',
      },
    };

    const nextState = wishlistReducer(stateWithToast, clearToast());
    expect(nextState.toastMessage).toBeNull();
    expect(nextState.savedRoomIds['room-123']).toBe(true);
  });
});
