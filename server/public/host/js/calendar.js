(() => {
  const dataElement = document.getElementById('calendarData');
  if (!dataElement) return;
  const calendar = JSON.parse(dataElement.textContent);
  const byId = id => document.getElementById(id);
  const blockDialog = byId('calendarBlockDialog');
  const unblockDialog = byId('calendarUnblockDialog');
  const bookingDialog = byId('calendarBookingDialog');
  const rejectDialog = byId('calendarRejectDialog');
  const toast = byId('calendarToast');
  let selectedDate = null;
  let selectedBooking = null;
  let toastTimer = null;
  let dragStart = null;
  let suppressClick = false;

  const today = () => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date());
    const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${value.year}-${value.month}-${value.day}`;
  };

  const notify = (message, error = false) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('error', error);
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
  };

  const request = async (url, body) => {
    const response = await fetch(url, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    if (response.redirected) {
      window.location.assign('/host/login');
      throw new Error('Phiên đăng nhập đã hết hạn.');
    }
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Thao tác không thành công.');
    return result;
  };

  const openBlock = date => {
    const start = byId('calendarBlockStart');
    const end = byId('calendarBlockEnd');
    start.min = today();
    end.min = today();
    start.value = date || '';
    end.value = date || '';
    byId('calendarBlockReason').value = '';
    byId('calendarBlockNote').value = '';
    blockDialog.showModal();
  };

  const detailRow = (label, value) => {
    const row = document.createElement('p');
    const name = document.createElement('strong');
    const content = document.createElement('span');
    name.textContent = label;
    content.textContent = value == null ? '' : String(value);
    row.append(name, content);
    return row;
  };

  const openBooking = day => {
    selectedBooking = day.booking;
    if (!selectedBooking) {
      notify('Không tìm thấy thông tin đơn. Vui lòng tải lại lịch.', true);
      return;
    }
    byId('calendarBookingTitle').textContent = day.status === 'PENDING' ? 'Đơn chờ duyệt' : 'Đơn đã đặt';
    const details = byId('calendarBookingDetails');
    details.replaceChildren(
      detailRow('Mã đơn', selectedBooking.bookingCode),
      detailRow('Khách', selectedBooking.customerName),
      detailRow('Số điện thoại', selectedBooking.phoneNumber),
      detailRow('Nhận / trả', `${selectedBooking.checkIn} → ${selectedBooking.checkOut}`),
      detailRow('Số đêm / khách', `${selectedBooking.nights} đêm · ${selectedBooking.guestCount} khách`),
      detailRow('Tổng tiền', `${new Intl.NumberFormat('vi-VN').format(selectedBooking.totalAmount || 0)} đ`),
      detailRow('Ghi chú', selectedBooking.guestNote || 'Không có'),
    );
    byId('calendarBookingLink').href = `/host/bookings?tab=${day.status === 'PENDING' ? 'pending' : 'confirmed'}&search=${encodeURIComponent(selectedBooking.bookingCode || '')}`;
    byId('calendarApproveBooking').hidden = day.status !== 'PENDING';
    byId('calendarRejectBooking').hidden = day.status !== 'PENDING';
    bookingDialog.showModal();
  };

  byId('calendarRoom')?.addEventListener('change', event => {
    const params = new URLSearchParams({ roomId: event.target.value, month: calendar.month, year: calendar.year });
    window.location.assign(`/host/calendar?${params}`);
  });
  byId('calendarBlockRange')?.addEventListener('click', () => openBlock(''));
  document.querySelectorAll('[data-close-dialog]').forEach(button => {
    button.addEventListener('click', () => button.closest('dialog').close());
  });
  document.querySelectorAll('.calendar-day').forEach(button => {
    button.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (button.dataset.status === 'AVAILABLE' && button.dataset.date >= today()) dragStart = button.dataset.date;
    });
    button.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return; }
      const day = calendar.days.find(item => item.date === button.dataset.date);
      if (!day) return;
      if (day.status === 'AVAILABLE' || day.status === 'BLOCKED') {
        if (day.isPast) return notify('Không thể thực hiện thao tác khóa hoặc mở ngày cho các mốc thời gian trong quá khứ.', true);
        selectedDate = day.date;
        if (day.status === 'AVAILABLE') openBlock(day.date);
        else {
          byId('calendarUnblockText').textContent = `Mở bán lại ngày ${day.date}?`;
          unblockDialog.showModal();
        }
      } else openBooking(day);
    });
  });
  document.addEventListener('pointerup', event => {
    if (!dragStart) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.calendar-day');
    const end = target?.dataset.date;
    const start = dragStart;
    dragStart = null;
    if (!end || end === start) return;
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    const first = start < end ? start : end;
    const last = start < end ? end : start;
    const range = calendar.days.filter(day => day.date >= first && day.date <= last);
    if (range.some(day => day.status !== 'AVAILABLE' || day.isPast)) {
      notify('Dải ngày có đơn đặt phòng hoặc ngày đã khóa. Vui lòng chọn dải ngày trống.', true);
      return;
    }
    openBlock(first);
    byId('calendarBlockEnd').value = last;
  });

  byId('calendarBlockForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const startDate = byId('calendarBlockStart').value;
    const endDate = byId('calendarBlockEnd').value;
    if (!startDate || !endDate || startDate > endDate) return notify('Khoảng ngày khóa không hợp lệ.', true);
    if (!byId('calendarBlockReason').value) return notify('Vui lòng chọn lý do khóa lịch phòng trước khi tiếp tục.', true);
    const submit = event.submitter;
    if (submit) submit.disabled = true;
    try {
      const result = await request('/host/calendar/block', {
        roomId: calendar.roomId, startDate, endDate,
        reason: byId('calendarBlockReason').value,
        internalNote: byId('calendarBlockNote').value,
      });
      notify(result.message);
      window.location.reload();
    } catch (error) {
      notify(error.message, true);
    } finally {
      if (submit) submit.disabled = false;
    }
  });

  byId('calendarConfirmUnblock')?.addEventListener('click', async event => {
    event.currentTarget.disabled = true;
    try {
      const result = await request('/host/calendar/unblock', { roomId: calendar.roomId, targetDate: selectedDate });
      notify(result.message);
      window.location.reload();
    } catch (error) {
      notify(error.message, true);
    } finally {
      event.currentTarget.disabled = false;
    }
  });

  byId('calendarApproveBooking')?.addEventListener('click', async event => {
    event.currentTarget.disabled = true;
    try {
      const result = await request('/host/calendar/approve', { bookingId: selectedBooking.id });
      notify(result.message);
      window.location.reload();
    } catch (error) {
      notify(error.message, true);
    } finally {
      event.currentTarget.disabled = false;
    }
  });

  byId('calendarRejectBooking')?.addEventListener('click', () => {
    bookingDialog.close();
    byId('calendarRejectReason').value = '';
    rejectDialog.showModal();
  });

  byId('calendarRejectForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const rejectReason = byId('calendarRejectReason').value.trim();
    if (!rejectReason) return notify('Vui lòng nhập lý do từ chối.', true);
    const submit = event.submitter;
    if (submit) submit.disabled = true;
    try {
      const result = await request('/host/calendar/reject', { bookingId: selectedBooking.id, rejectReason });
      notify(result.message);
      window.location.reload();
    } catch (error) {
      notify(error.message, true);
    } finally {
      if (submit) submit.disabled = false;
    }
  });

  // Push updates for this Host and room; polling remains a fallback after a dropped connection.
  if (calendar.roomId) {
    if (typeof EventSource !== 'undefined') {
      const stream = new EventSource(`/api/host/calendar/events?roomId=${encodeURIComponent(calendar.roomId)}`);
      stream.addEventListener('calendar', () => {
        if (document.visibilityState === 'visible' && !document.querySelector('dialog[open]')) window.location.reload();
      });
      window.addEventListener('beforeunload', () => stream.close());
    }
    let snapshot = JSON.stringify(calendar.days);
    setInterval(async () => {
      if (document.visibilityState !== 'visible' || document.querySelector('dialog[open]')) return;
      try {
        const params = new URLSearchParams({ roomId: calendar.roomId, month: calendar.month, year: calendar.year });
        const response = await fetch(`/api/host/calendar?${params}`, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        if (!response.ok) return;
        const result = await response.json();
        if (result.success && JSON.stringify(result.data.days) !== snapshot) {
          snapshot = JSON.stringify(result.data.days);
          window.location.reload();
        }
      } catch (_) { /* Keep the displayed calendar until the next check. */ }
    }, 15000);
  }
})();
