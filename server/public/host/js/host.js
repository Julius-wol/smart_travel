/**
 * SMART TRAVEL - HOST PORTAL CORE JS
 * Handles navigation, filter events, modals, status toggles, deletion, and toasts.
 */

// ==========================================
// 1. TOAST NOTIFICATION SYSTEM
// ==========================================
window.showToast = function(type, code, message, duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <div class="toast-icon">${iconMap[type] || 'ℹ'}</div>
    <div class="toast-content">
      ${code ? `<div class="toast-code">[${code}]</div>` : ''}
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 250);
  }, duration);
};

// ==========================================
// 2. MODAL CONTROLS
// ==========================================
window.openModal = function(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
};

window.closeModal = function(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
};

// ==========================================
// 3. INITIALIZATION ON DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Check URL error param (e.g. ?error=AUTH-403)
  const urlParams = new URLSearchParams(window.location.search);
  const errorParam = urlParams.get('error');
  if (errorParam === 'AUTH-403') {
    showToast('error', 'AUTH-403', 'Tài khoản của bạn không có quyền thao tác trên cơ sở lưu trú này.');
  }

  // Profile menu toggle
  const profilePill = document.querySelector('.host-profile-pill');
  const profileDropdown = document.querySelector('.host-dropdown-menu');
  if (profilePill && profileDropdown) {
    profilePill.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('show');
    });
    document.addEventListener('click', () => {
      profileDropdown.classList.remove('show');
    });
  }

  // Language Switcher toggle
  const langBtns = document.querySelectorAll('.host-lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Search input: Trigger search on Enter key (Section 1.12)
  const searchInput = document.querySelector('.host-search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerFilterSubmit();
      }
    });

    const clearBtn = document.querySelector('.host-search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        triggerFilterSubmit();
      });
    }
  }

  // Select Dropdowns auto reload table on change (Section 1.13, 1.14, 1.15)
  const filterSelects = document.querySelectorAll('.host-filter-select');
  filterSelects.forEach(select => {
    select.addEventListener('change', () => {
      triggerFilterSubmit();
    });
  });

  function triggerFilterSubmit() {
    const searchVal = document.querySelector('.host-search-input')?.value || '';
    const typeVal = document.getElementById('filterType')?.value || '';
    const statusVal = document.getElementById('filterStatus')?.value || '';
    const sortVal = document.getElementById('filterSort')?.value || '';

    const params = new URLSearchParams();
    if (searchVal.trim()) params.set('search', searchVal.trim());
    if (typeVal && typeVal !== 'Tất cả loại phòng') params.set('type', typeVal);
    if (statusVal && statusVal !== 'Tất cả trạng thái') params.set('status', statusVal);
    if (sortVal && sortVal !== 'Mới nhất') params.set('sort', sortVal);

    window.location.href = `/host/rooms?${params.toString()}`;
  }

  // Excel Export Button (Section 1.6)
  const exportBtn = document.getElementById('btnExportExcel');
  if (exportBtn) {
    exportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('success', 'EXP-001', 'Đang xuất dữ liệu danh mục phòng ra file Excel, quá trình tải sẽ bắt đầu ngay.');
      
      const queryParams = window.location.search;
      setTimeout(() => {
        window.location.href = `/host/export-excel${queryParams}`;
      }, 600);
    });
  }
});

// ==========================================
// 4. ROOM STATUS CHANGE MODALS (SCR-HOST-01 1.19)
// ==========================================
let activeRoomIdForStatus = null;
let activeTargetStatus = null;

window.handleStatusPillClick = function(roomId, currentStatus) {
  if (currentStatus === 'Draft') {
    return; // Draft is disabled
  }

  activeRoomIdForStatus = roomId;
  if (currentStatus === 'Published' || currentStatus === 'ACTIVE') {
    activeTargetStatus = 'Archived';
    openModal('modalConfirmArchive');
  } else if (currentStatus === 'Archived' || currentStatus === 'HIDDEN') {
    activeTargetStatus = 'Published';
    openModal('modalConfirmPublish');
  }
};

window.confirmStatusChange = async function() {
  if (!activeRoomIdForStatus || !activeTargetStatus) return;

  try {
    const res = await fetch(`/host/rooms/${activeRoomIdForStatus}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStatus: activeTargetStatus })
    });
    const data = await res.json();

    closeModal('modalConfirmArchive');
    closeModal('modalConfirmPublish');

    if (data.success) {
      showToast('success', data.code, data.message);
      setTimeout(() => window.location.reload(), 1000);
    } else {
      showToast('error', data.code || 'ERROR', data.message);
    }
  } catch (err) {
    console.error(err);
    showToast('error', 'SERVER_ERROR', 'Không thể kết nối máy chủ');
  }
};

// ==========================================
// 5. DUPLICATE ROOM (Section 1.21)
// ==========================================
window.handleDuplicateRoom = async function(roomId) {
  try {
    const res = await fetch(`/host/rooms/${roomId}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();

    if (data.success) {
      showToast('success', 'ROOM-DUP-001', data.message);
      setTimeout(() => window.location.reload(), 1200);
    } else {
      showToast('error', data.code || 'ERROR', data.message);
    }
  } catch (err) {
    console.error(err);
    showToast('error', 'SERVER_ERROR', 'Lỗi kết nối khi nhân bản phòng');
  }
};

// ==========================================
// 6. DELETE ROOM (Section 1.21 & Acceptance Criteria 2.1, 2.2, 2.3)
// ==========================================
let activeDeleteRoomId = null;
let activeDeleteRoomStatus = null;

window.handleDeleteRoomClick = function(roomId, status) {
  activeDeleteRoomId = roomId;
  activeDeleteRoomStatus = status;

  const input = document.getElementById('deleteConfirmInput');
  const submitBtn = document.getElementById('btnSubmitDelete');
  const typeContainer = document.getElementById('deleteTypeVerificationContainer');

  if (status === 'Draft') {
    if (typeContainer) typeContainer.style.display = 'none';
    if (submitBtn) submitBtn.disabled = false;
  } else {
    if (typeContainer) typeContainer.style.display = 'block';
    if (input) {
      input.value = '';
      input.focus();
    }
    if (submitBtn) submitBtn.disabled = true;
  }

  openModal('modalConfirmDelete');
};

// Check input for "XÓA"
document.addEventListener('input', (e) => {
  if (e.target.id === 'deleteConfirmInput') {
    const submitBtn = document.getElementById('btnSubmitDelete');
    if (submitBtn) {
      submitBtn.disabled = e.target.value.trim().toUpperCase() !== 'XÓA';
    }
  }
});

window.confirmDeleteRoom = async function() {
  if (!activeDeleteRoomId) return;

  const confirmationText = document.getElementById('deleteConfirmInput')?.value.trim().toUpperCase() || '';

  try {
    const res = await fetch(`/host/rooms/${activeDeleteRoomId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmationText })
    });
    const data = await res.json();

    closeModal('modalConfirmDelete');

    if (data.success) {
      showToast('success', 'ROOM-DEL-002', data.message);
      setTimeout(() => window.location.reload(), 1200);
    } else {
      if (data.code === 'ROOM-DEL-001') {
        // Caution modal for future bookings
        document.getElementById('roomDel001Msg').innerText = data.message;
        openModal('modalRoomDel001');
      } else {
        showToast('error', data.code || 'ERROR', data.message);
      }
    }
  } catch (err) {
    console.error(err);
    showToast('error', 'SERVER_ERROR', 'Lỗi khi xóa phòng');
  }
};
