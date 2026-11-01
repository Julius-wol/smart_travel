/**
 * SMART TRAVEL - CREATE / UPDATE ROOM FORM JS
 * Implements real-time profile health score, steppers, cascading address,
 * drag-and-drop photos, auto-save (60s), restore modal, validations and quick-auth.
 */

// ==========================================
// 1. VIETNAM PROVINCES & DISTRICTS DATA
// ==========================================
const VN_LOCATIONS = {
  'Lâm Đồng (Đà Lạt)': [
    'Phường 4 (Khu Hồ Tuyền Lâm)',
    'Phường 1 (Trung tâm chợ Đà Lạt)',
    'Phường 2',
    'Phường 3',
    'Phường 10 (Ga Đà Lạt)',
    'Xã Tà Nung',
    'Xã Xuân Thọ (Đồi chè Cầu Đất)',
    'Huyện Lạc Dương (Langbiang)'
  ],
  'Đà Nẵng': [
    'Sơn Trà (Bán đảo & Biển Mỹ Khê)',
    'Ngũ Hành Sơn (Phố Tây An Thượng)',
    'Hải Châu (Trung tâm & Cầu Rồng)',
    'Thanh Khê',
    'Liên Chiểu',
    'Hòa Vang (Bà Nà Hills)'
  ],
  'TP. Hồ Chí Minh': [
    'Quận 1 (Trung tâm)',
    'Quận 2 (Thảo Điền)',
    'Quận 3',
    'Quận 7 (Phú Mỹ Hưng)',
    'Quận Bình Thạnh',
    'Thành phố Thủ Đức'
  ],
  'Hà Nội': [
    'Hoàn Kiếm (Phố Cổ)',
    'Tây Hồ (Hồ Tây)',
    'Ba Đình',
    'Đống Đa',
    'Cầu Giấy',
    'Nam Từ Liêm'
  ],
  'Khánh Hòa (Nha Trang)': [
    'Phường Lộc Thọ (Trần Phú)',
    'Phường Vĩnh Nguyên (Cáp treo)',
    'Phường Vĩnh Hòa (Bắc Nha Trang)',
    'Bãi Dài Cam Ranh'
  ],
  'Kiên Giang (Phú Quốc)': [
    'Phường Dương Đông (Trung tâm)',
    'Phường An Thới (Nam đảo)',
    'Xã Gành Dầu (Bắc đảo)',
    'Xã Cửa Cạn'
  ],
  'Quảng Nam (Hội An)': [
    'Phường Minh An (Phố Cổ)',
    'Phường Cẩm An (Biển An Bàng)',
    'Phường Cẩm Châu',
    'Xã Cẩm Thanh (Rừng dừa)'
  ],
  'Lào Cai (Sa Pa)': [
    'Phường Sa Pa (Nhà thờ Đá)',
    'Bản Cát Cát',
    'Bản Tả Van',
    'Bản Tả Phìn'
  ]
};

// ==========================================
// 2. STATE MANAGEMENT
// ==========================================
let currentImages = [];
let isFormDirty = false;
let autoSaveInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  initSteppers();
  initLocations();
  initPriceFormatting();
  initDescriptionCounter();
  initAmenities();
  initPhotoGallery();
  initMapAndGeocoding();
  initRealtimeHealthScore();
  initAutoSave();
  initFormActions();

  // Mark form as dirty when any input changes
  document.getElementById('roomForm')?.addEventListener('input', () => {
    isFormDirty = true;
  });
});

// ==========================================
// 3. STEPPERS
// ==========================================
function initSteppers() {
  // Max Guests Stepper (Section 2.6)
  const guestDisplay = document.getElementById('guestDisplay');
  const guestInput = document.getElementById('inputMaxGuests');
  const btnGuestMinus = document.getElementById('btnGuestMinus');
  const btnGuestPlus = document.getElementById('btnGuestPlus');

  function updateGuestDisplay(val) {
    val = Math.max(1, Math.min(50, val));
    guestInput.value = val;
    guestDisplay.innerText = `${val} khách`;
    btnGuestMinus.disabled = val <= 1;
    btnGuestPlus.disabled = val >= 50;
    calcHealthScore();
  }

  btnGuestMinus?.addEventListener('click', () => {
    updateGuestDisplay(parseInt(guestInput.value || 2) - 1);
  });
  btnGuestPlus?.addEventListener('click', () => {
    updateGuestDisplay(parseInt(guestInput.value || 2) + 1);
  });

  // Bedrooms & Beds Dual Stepper (Section 2.7)
  const bedroomDisplay = document.getElementById('bedroomDisplay');
  const bedroomInput = document.getElementById('inputBedrooms');
  const btnBedroomMinus = document.getElementById('btnBedroomMinus');
  const btnBedroomPlus = document.getElementById('btnBedroomPlus');

  const bedDisplay = document.getElementById('bedDisplay');
  const bedInput = document.getElementById('inputBeds');
  const btnBedMinus = document.getElementById('btnBedMinus');
  const btnBedPlus = document.getElementById('btnBedPlus');

  function updateBedroomDisplay(val) {
    val = Math.max(1, Math.min(20, val));
    bedroomInput.value = val;
    bedroomDisplay.innerText = `${val} phòng`;
    btnBedroomMinus.disabled = val <= 1;
    calcHealthScore();
  }

  function updateBedDisplay(val) {
    val = Math.max(1, Math.min(30, val));
    bedInput.value = val;
    bedDisplay.innerText = `${val} giường`;
    btnBedMinus.disabled = val <= 1;
    calcHealthScore();
  }

  btnBedroomMinus?.addEventListener('click', () => updateBedroomDisplay(parseInt(bedroomInput.value || 1) - 1));
  btnBedroomPlus?.addEventListener('click', () => updateBedroomDisplay(parseInt(bedroomInput.value || 1) + 1));
  btnBedMinus?.addEventListener('click', () => updateBedDisplay(parseInt(bedInput.value || 1) - 1));
  btnBedPlus?.addEventListener('click', () => updateBedDisplay(parseInt(bedInput.value || 1) + 1));
}

// ==========================================
// 4. LOCATIONS (CASCADING DROPDOWNS)
// ==========================================
function initLocations() {
  const citySelect = document.getElementById('selectCity');
  const districtSelect = document.getElementById('selectDistrict');

  if (!citySelect || !districtSelect) return;

  function populateDistricts(cityName, selectedDistrict = '') {
    districtSelect.innerHTML = '<option value="">Chọn Quận/Huyện/Phường...</option>';
    const districts = VN_LOCATIONS[cityName] || [];
    districts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      if (d === selectedDistrict) opt.selected = true;
      districtSelect.appendChild(opt);
    });
  }

  // Initial load
  const initialCity = citySelect.value;
  const initialDistrict = districtSelect.dataset.selected || '';
  if (initialCity) {
    populateDistricts(initialCity, initialDistrict);
  }

  citySelect.addEventListener('change', () => {
    populateDistricts(citySelect.value);
    calcHealthScore();
  });

  districtSelect.addEventListener('change', () => {
    calcHealthScore();
  });
}

// ==========================================
// 4B. LEAFLET INTERACTIVE MAP & GEOCODING
// ==========================================
let roomMap = null;
let roomMarker = null;
let modalMap = null;
let modalMarker = null;
let tempModalCoords = null;
let geocodeTimeout = null;

const CITY_COORDS = {
  'Đà Nẵng': { lat: 16.0678, lng: 108.2208, zoom: 13 },
  'Lâm Đồng (Đà Lạt)': { lat: 11.9404, lng: 108.4583, zoom: 13 },
  'TP. Hồ Chí Minh': { lat: 10.7769, lng: 106.7009, zoom: 12 },
  'Hà Nội': { lat: 21.0285, lng: 105.8542, zoom: 12 },
  'Khánh Hòa (Nha Trang)': { lat: 12.2388, lng: 109.1967, zoom: 13 },
  'Kiên Giang (Phú Quốc)': { lat: 10.2899, lng: 103.9840, zoom: 11 },
  'Quảng Nam (Hội An)': { lat: 15.8801, lng: 108.3380, zoom: 14 },
  'Lào Cai (Sa Pa)': { lat: 22.3364, lng: 103.8438, zoom: 14 }
};

function initMapAndGeocoding() {
  const mapContainer = document.getElementById('hostRoomMap');
  if (!mapContainer || typeof L === 'undefined') return;

  const latInput = document.getElementById('inputLatitude');
  const lngInput = document.getElementById('inputLongitude');
  const coordDisplay = document.getElementById('displayCoordText');

  let initialLat = parseFloat(latInput?.value) || 16.0678;
  let initialLng = parseFloat(lngInput?.value) || 108.2208;

  // Initialize Leaflet Map
  roomMap = L.map('hostRoomMap', {
    scrollWheelZoom: false
  }).setView([initialLat, initialLng], 15);

  // OpenStreetMap standard tiles (free, reliable, no API key required)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19
  }).addTo(roomMap);

  setTimeout(() => {
    if (roomMap) roomMap.invalidateSize();
  }, 250);

  // Custom Red Pin Marker
  const customIcon = L.divIcon({
    className: 'custom-pin-marker',
    html: '<div style="font-size: 32px; line-height: 1; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.35)); cursor: grab;">📍</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 30]
  });

  roomMarker = L.marker([initialLat, initialLng], {
    draggable: true,
    icon: customIcon
  }).addTo(roomMap);

  function updateCoords(lat, lng, fly = false, zoom = 16) {
    if (latInput) latInput.value = lat;
    if (lngInput) lngInput.value = lng;
    if (coordDisplay) {
      coordDisplay.textContent = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
    }
    roomMarker.setLatLng([lat, lng]);
    if (fly && roomMap) {
      roomMap.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
    isFormDirty = true;
    calcHealthScore();
  }

  // Draggable marker updates
  roomMarker.on('dragend', (e) => {
    const pos = e.target.getLatLng();
    updateCoords(pos.lat, pos.lng, false);
    showToast('info', 'GPS', `Đã cập nhật tọa độ: ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`);
  });

  // Click on map to relocate marker
  roomMap.on('click', (e) => {
    updateCoords(e.latlng.lat, e.latlng.lng, false);
    showToast('info', 'GPS', `Đã di chuyển ghim đến vị trí mới.`);
  });

  // Geocode button & input events
  const btnGeocode = document.getElementById('btnGeocodeAddress');
  const inputAddress = document.getElementById('inputAddress');
  const citySelect = document.getElementById('selectCity');
  const districtSelect = document.getElementById('selectDistrict');

  btnGeocode?.addEventListener('click', (e) => {
    e.preventDefault();
    triggerGeocode();
  });

  inputAddress?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerGeocode();
    }
  });

  // Debounced geocoding on typing address
  inputAddress?.addEventListener('input', () => {
    clearTimeout(geocodeTimeout);
    geocodeTimeout = setTimeout(() => {
      if (inputAddress.value.trim().length >= 4) {
        triggerGeocode(false);
      }
    }, 1200);
  });

  // Geocode when changing city
  citySelect?.addEventListener('change', () => {
    const city = citySelect.value;
    if (CITY_COORDS[city]) {
      const c = CITY_COORDS[city];
      updateCoords(c.lat, c.lng, true, c.zoom);
    }
  });

  // Geocode when changing district
  districtSelect?.addEventListener('change', () => {
    if (districtSelect.value) {
      triggerGeocode(false);
    }
  });

  async function triggerGeocode(notify = true) {
    const city = citySelect?.value || 'Đà Nẵng';
    const district = districtSelect?.value || '';
    const address = inputAddress?.value.trim() || '';

    const spinner = document.getElementById('gpsGeoSpinner');
    if (spinner) spinner.style.display = 'inline-block';

    try {
      let cleanDistrict = district.replace(/\(.*\)/, '').trim();
      let cleanCity = city.replace(/\(.*\)/, '').trim();
      let query = '';

      if (address) {
        query = `${address}, ${cleanDistrict ? cleanDistrict + ', ' : ''}${cleanCity}, Vietnam`;
      } else if (cleanDistrict) {
        query = `${cleanDistrict}, ${cleanCity}, Vietnam`;
      } else {
        query = `${cleanCity}, Vietnam`;
      }

      console.log('Geocoding query:', query);
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.features && data.features.length > 0) {
        const feat = data.features[0];
        const [lng, lat] = feat.geometry.coordinates;
        updateCoords(lat, lng, true, 16);
        if (notify) {
          const placeName = feat.properties.name || feat.properties.street || cleanDistrict || cleanCity;
          showToast('success', 'GEO_OK', `Đã định vị thành công: ${placeName}`);
        }
      } else {
        // Fallback: search by district and city only
        const fallbackQuery = `${cleanDistrict ? cleanDistrict + ', ' : ''}${cleanCity}, Vietnam`;
        const fbRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(fallbackQuery)}&limit=1`);
        const fbData = await fbRes.json();
        if (fbData && fbData.features && fbData.features.length > 0) {
          const [lng, lat] = fbData.features[0].geometry.coordinates;
          updateCoords(lat, lng, true, 14);
          if (notify) {
            showToast('info', 'GEO_FALLBACK', `Đã định vị khu vực ${cleanDistrict || cleanCity}. Bạn có thể kéo thả ghim đến số nhà chính xác.`);
          }
        }
      }
    } catch (err) {
      console.warn('Geocoding error:', err);
      if (CITY_COORDS[city]) {
        const c = CITY_COORDS[city];
        updateCoords(c.lat, c.lng, true, c.zoom);
      }
    } finally {
      if (spinner) spinner.style.display = 'none';
    }
  }
}

window.openFullscreenMapModal = function() {
  const latInput = document.getElementById('inputLatitude');
  const lngInput = document.getElementById('inputLongitude');
  const currentLat = parseFloat(latInput?.value) || 16.0678;
  const currentLng = parseFloat(lngInput?.value) || 108.2208;

  tempModalCoords = { lat: currentLat, lng: currentLng };
  openModal('modalMapAdjust');

  setTimeout(() => {
    const modalMapContainer = document.getElementById('hostModalMap');
    if (!modalMapContainer || typeof L === 'undefined') return;

    if (!modalMap) {
      modalMap = L.map('hostModalMap').setView([currentLat, currentLng], 16);
      // OpenStreetMap standard tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19
      }).addTo(modalMap);

      const customIcon = L.divIcon({
        className: 'modal-pin-marker',
        html: '<div style="font-size: 36px; line-height: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); cursor: grab;">📍</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 34]
      });

      modalMarker = L.marker([currentLat, currentLng], {
        draggable: true,
        icon: customIcon
      }).addTo(modalMap);

      modalMarker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        tempModalCoords = { lat: pos.lat, lng: pos.lng };
        updateModalCoordDisplay(pos.lat, pos.lng);
      });

      modalMap.on('click', (e) => {
        modalMarker.setLatLng(e.latlng);
        tempModalCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
        updateModalCoordDisplay(e.latlng.lat, e.latlng.lng);
      });
    }
    if (modalMap) modalMap.invalidateSize();
    updateModalCoordDisplay(currentLat, currentLng);
  }, 250);
};

function updateModalCoordDisplay(lat, lng) {
  const el = document.getElementById('modalDisplayCoordText');
  if (el) el.textContent = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
}

window.confirmSaveModalCoords = function() {
  if (tempModalCoords) {
    const latInput = document.getElementById('inputLatitude');
    const lngInput = document.getElementById('inputLongitude');
    const coordDisplay = document.getElementById('displayCoordText');

    if (latInput) latInput.value = tempModalCoords.lat;
    if (lngInput) lngInput.value = tempModalCoords.lng;
    if (coordDisplay) {
      coordDisplay.textContent = `${tempModalCoords.lat.toFixed(4)}° N, ${tempModalCoords.lng.toFixed(4)}° E`;
    }
    if (roomMarker && roomMap) {
      roomMarker.setLatLng([tempModalCoords.lat, tempModalCoords.lng]);
      roomMap.setView([tempModalCoords.lat, tempModalCoords.lng], 16);
    }
    isFormDirty = true;
    calcHealthScore();
    showToast('success', 'GPS-OK', 'Đã lưu vị trí ghim bản đồ chính xác.');
  }
  closeModal('modalMapAdjust');
};

// ==========================================
// 5. PRICE FORMATTING (VND THOUSANDS FORMAT)
// ==========================================
function initPriceFormatting() {
  const priceInput = document.getElementById('inputPrice');
  const weekendPriceInput = document.getElementById('inputWeekendPrice');

  function formatCurrency(input) {
    let val = input.value.replace(/\D/g, '');
    if (!val) {
      input.value = '';
      return;
    }
    input.value = Number(val).toLocaleString('vi-VN');
    calcHealthScore();
  }

  priceInput?.addEventListener('input', () => formatCurrency(priceInput));
  weekendPriceInput?.addEventListener('input', () => formatCurrency(weekendPriceInput));
}

// ==========================================
// 6. DESCRIPTION & CHAR COUNTER
// ==========================================
function initDescriptionCounter() {
  const descTextarea = document.getElementById('inputDescription');
  const counter = document.getElementById('descCharCounter');
  const charLimitWarning = document.getElementById('charLimitWarning');

  if (!descTextarea || !counter) return;

  function updateCounter() {
    const len = descTextarea.value.length;
    counter.innerText = `${len} / 1.000 ký tự`;

    if (len > 1000) {
      counter.classList.add('limit-exceeded');
      if (charLimitWarning) {
        charLimitWarning.innerText = 'Mô tả phòng đã vượt quá giới hạn 1.000 ký tự cho phép. [ROOM-CHAR-LIMIT]';
        charLimitWarning.classList.add('show');
      }
    } else {
      counter.classList.remove('limit-exceeded');
      if (charLimitWarning) charLimitWarning.classList.remove('show');
    }
    calcHealthScore();
  }

  descTextarea.addEventListener('input', updateCounter);
  updateCounter();
}

// ==========================================
// 7. AMENITIES SELECTION
// ==========================================
function initAmenities() {
  const cards = document.querySelectorAll('.amenity-card');
  const counter = document.getElementById('amenitiesCounter');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const input = card.querySelector('input');
      input.checked = !input.checked;
      card.classList.toggle('selected', input.checked);
      updateAmenityCount();
      calcHealthScore();
    });
  });

  function updateAmenityCount() {
    const selectedCount = document.querySelectorAll('.amenity-card.selected').length;
    if (counter) counter.innerText = `${selectedCount}/12 đã chọn`;
  }
}

// Add Custom Amenity Modal
window.handleOpenAddAmenityModal = function() {
  openModal('modalAddAmenity');
  document.getElementById('customAmenityName').value = '';
};

window.confirmAddCustomAmenity = function() {
  const nameInput = document.getElementById('customAmenityName');
  const name = nameInput?.value.trim();
  if (!name) return;

  const grid = document.querySelector('.amenities-grid');
  const newCard = document.createElement('div');
  newCard.className = 'amenity-card selected';
  newCard.innerHTML = `
    <input type="checkbox" checked value="${name}" data-icon="sparkles" data-id="custom_${Date.now()}">
    <span class="amenity-icon">✨</span>
    <span class="amenity-label">${name}</span>
  `;

  newCard.addEventListener('click', () => {
    const input = newCard.querySelector('input');
    input.checked = !input.checked;
    newCard.classList.toggle('selected', input.checked);
    calcHealthScore();
  });

  grid.appendChild(newCard);
  closeModal('modalAddAmenity');
  showToast('info', 'ROOM-INFO', `Đã thêm tiện ích "${name}"`);
  calcHealthScore();
};

// ==========================================
// 8. PHOTO GALLERY & DRAG & DROP
// ==========================================
function initPhotoGallery() {
  const dropzone = document.getElementById('photoDropzone');
  const fileInput = document.getElementById('photoFileInput');

  // Load existing images from DOM
  const existingThumbs = document.querySelectorAll('.gallery-item[data-img]');
  existingThumbs.forEach(item => {
    currentImages.push(item.dataset.img);
  });
  renderGallery();

  dropzone?.addEventListener('click', () => fileInput?.click());

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files?.length) {
      handleFilesUpload(e.dataTransfer.files);
    }
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files?.length) {
      handleFilesUpload(e.target.files);
    }
  });
}

async function handleFilesUpload(fileList) {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const maxBytes = 5 * 1024 * 1024; // 5MB

  const validFiles = [];

  for (let file of fileList) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext) || file.size > maxBytes) {
      showToast('error', 'ROOM-IMG-002', 'Tệp tin vượt quá kích thước 5MB hoặc sai định dạng cho phép (chỉ nhận JPG, PNG, WEBP).');
      return;
    }
    validFiles.push(file);
  }

  if (currentImages.length + validFiles.length > 15) {
    showToast('warning', 'ROOM-IMG-LIMIT', 'Bạn chỉ có thể tải lên tối đa 15 hình ảnh.');
    return;
  }

  const formData = new FormData();
  validFiles.forEach(file => formData.append('images', file));

  try {
    const res = await fetch('/host/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error('Upload failed');
    }

    const data = await res.json();
    if (data.success && data.urls) {
      currentImages.push(...data.urls);
      renderGallery();
      calcHealthScore();
      showToast('success', 'UPLOAD-OK', `Đã tải lên ${data.urls.length} ảnh thành công`);
    }
  } catch (err) {
    console.error(err);
    showToast('error', 'ROOM-IMG-NETERR', 'Tải ảnh thất bại do lỗi kết nối mạng. Vui lòng bấm thử lại.');
  }
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  const counter = document.getElementById('photoCounter');
  if (!grid) return;

  grid.innerHTML = '';

  currentImages.forEach((imgUrl, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <img src="${imgUrl}" alt="Ảnh phòng ${index + 1}">
      ${index === 0 ? '<span class="gallery-primary-badge">⭐ Ảnh bìa chính</span>' : ''}
      <button type="button" class="gallery-del-btn" onclick="removePhoto(${index})">✕</button>
    `;
    grid.appendChild(item);
  });

  // Add slot if < 15
  if (currentImages.length < 15) {
    const addSlot = document.createElement('div');
    addSlot.className = 'gallery-add-slot';
    addSlot.innerHTML = `
      <span style="font-size: 20px;">+</span>
      <span>Thêm Ảnh</span>
    `;
    addSlot.onclick = () => document.getElementById('photoFileInput')?.click();
    grid.appendChild(addSlot);
  }

  if (counter) counter.innerText = `${currentImages.length}/15 ảnh đã tải`;
  calcHealthScore();
}

window.removePhoto = function(index) {
  currentImages.splice(index, 1);
  renderGallery();
};

// ==========================================
// 9. PROFILE HEALTH SCORE ALGORITHM (SECTION 4 ACCEPTANCE CRITERIA)
// ==========================================
function initRealtimeHealthScore() {
  calcHealthScore();
  // Listen to all inputs
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('change', calcHealthScore);
  });
}

function calcHealthScore() {
  const title = document.getElementById('inputTitle')?.value.trim();
  const city = document.getElementById('selectCity')?.value;
  const district = document.getElementById('selectDistrict')?.value;
  const address = document.getElementById('inputAddress')?.value.trim();

  const price = document.getElementById('inputPrice')?.value.replace(/\D/g, '');
  const weekendPrice = document.getElementById('inputWeekendPrice')?.value.replace(/\D/g, '');
  const freeCancel = document.getElementById('checkFreeCancel')?.checked;

  const selectedAmenities = document.querySelectorAll('.amenity-card.selected').length;
  const photoCount = currentImages.length;

  // Criteria 1: Tên và thông tin vị trí chính xác (100% when all present)
  let score1 = 0;
  if (title && city && district && address) {
    score1 = 100;
  } else if (title && (city || address)) {
    score1 = 60;
  } else {
    score1 = 20;
  }

  // Criteria 2: Định giá theo ngày & cuối tuần (100% when both standard & weekend & cancel set)
  let score2 = 0;
  if (price && Number(price) >= 50000 && weekendPrice && freeCancel) {
    score2 = 100;
  } else if (price && Number(price) >= 50000) {
    score2 = 75;
  } else {
    score2 = 0;
  }

  // Criteria 3: Danh mục tiện ích đầy đủ (>6 items: 100%, 1-5 items: 80%, 0: 0%)
  let score3 = 0;
  if (selectedAmenities >= 6) {
    score3 = 100;
  } else if (selectedAmenities >= 1) {
    score3 = 80;
  } else {
    score3 = 0;
  }

  // Criteria 4: Album ảnh (>=5 ảnh: 100%, 3-4 ảnh: 90%, <3: 30%)
  let score4 = 0;
  if (photoCount >= 5) {
    score4 = 100;
  } else if (photoCount >= 3) {
    score4 = 90;
  } else if (photoCount > 0) {
    score4 = 30;
  } else {
    score4 = 0;
  }

  // Total weighted average
  const totalScore = Math.round((score1 * 0.25) + (score2 * 0.25) + (score3 * 0.25) + (score4 * 0.25));

  // Update DOM elements
  const scoreNumEl = document.getElementById('healthScoreNum');
  const scoreBarEl = document.getElementById('healthProgressBar');
  const badgeEl = document.getElementById('healthScoreBadge');
  const subtextEl = document.getElementById('healthScoreSubtext');

  if (scoreNumEl) scoreNumEl.innerText = `${totalScore}%`;
  if (scoreBarEl) scoreBarEl.style.width = `${totalScore}%`;

  if (totalScore >= 90) {
    if (badgeEl) {
      badgeEl.className = 'health-badge superhost';
      badgeEl.innerText = 'Xuất sắc';
    }
    if (subtextEl) subtextEl.innerText = 'Đạt chuẩn Superhost';
  } else {
    if (badgeEl) {
      badgeEl.className = 'health-badge improve';
      badgeEl.innerText = 'Cần hoàn thiện';
    }
    if (subtextEl) subtextEl.innerText = 'Hoàn thiện thêm để đạt SuperHost';
  }

  // Checklist updates
  updateCheckItem('checkScoreLoc', score1);
  updateCheckItem('checkScorePrice', score2);
  updateCheckItem('checkScoreAmenity', score3);
  updateCheckItem('checkScorePhoto', score4);
}

function updateCheckItem(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = `${val}%`;
}

// ==========================================
// 10. AUTO-SAVE & RESTORE (SECTION 4 ACCEPTANCE CRITERIA)
// ==========================================
function initAutoSave() {
  const roomId = document.getElementById('roomId')?.value || 'new';
  const autoSaveKey = `smart_travel_draft_${roomId}`;

  // Check if uncommitted draft exists in localStorage
  const savedCache = localStorage.getItem(autoSaveKey);
  if (savedCache) {
    try {
      const parsed = JSON.parse(savedCache);
      if (parsed.timestamp && (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000)) {
        // Show restore modal [ROOM-RESTORE-001]
        openModal('modalRoomRestore');
      }
    } catch (e) {}
  }

  // Auto-save every 60 seconds (Section 2.24 & ROOM-AUTOSAVE-001)
  autoSaveInterval = setInterval(() => {
    if (isFormDirty) {
      saveFormDataToCache(autoSaveKey);
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const label = document.getElementById('autosaveLabel');
      if (label) {
        label.innerText = `Đã lưu bản nháp tự động ${timeStr}`;
      }
    }
  }, 60000);
}

function saveFormDataToCache(key) {
  const payload = getFormDataPayload('Draft');
  localStorage.setItem(key, JSON.stringify({
    timestamp: Date.now(),
    data: payload
  }));
}

window.confirmRestoreDraft = function() {
  const roomId = document.getElementById('roomId')?.value || 'new';
  const autoSaveKey = `smart_travel_draft_${roomId}`;
  const savedCache = localStorage.getItem(autoSaveKey);
  if (!savedCache) return closeModal('modalRoomRestore');

  try {
    const { data } = JSON.parse(savedCache);
    if (data.title) document.getElementById('inputTitle').value = data.title;
    if (data.city) document.getElementById('selectCity').value = data.city;
    if (data.district) {
      const districtSelect = document.getElementById('selectDistrict');
      districtSelect.dataset.selected = data.district;
      initLocations();
    }
    if (data.address) document.getElementById('inputAddress').value = data.address;
    if (data.pricePerNight) {
      document.getElementById('inputPrice').value = Number(data.pricePerNight).toLocaleString('vi-VN');
    }
    if (data.weekendPrice) {
      document.getElementById('inputWeekendPrice').value = Number(data.weekendPrice).toLocaleString('vi-VN');
    }
    if (data.description) document.getElementById('inputDescription').value = data.description;
    if (data.images && data.images.length) {
      currentImages = data.images;
      renderGallery();
    }
    calcHealthScore();
    showToast('success', 'RESTORE_OK', 'Đã khôi phục dữ liệu bản nháp trước đó thành công.');
  } catch (err) {
    console.error(err);
  }
  closeModal('modalRoomRestore');
};

window.discardRestoreDraft = function() {
  const roomId = document.getElementById('roomId')?.value || 'new';
  localStorage.removeItem(`smart_travel_draft_${roomId}`);
  closeModal('modalRoomRestore');
};

// ==========================================
// 11. FORM SUBMISSION (PUBLISH & DRAFT)
// ==========================================
function getFormDataPayload(targetStatus) {
  const title = document.getElementById('inputTitle')?.value.trim();
  const roomType = document.getElementById('selectRoomType')?.value;
  const maxGuests = document.getElementById('inputMaxGuests')?.value;
  const bedrooms = document.getElementById('inputBedrooms')?.value;
  const beds = document.getElementById('inputBeds')?.value;
  const area = document.getElementById('inputArea')?.value;

  const city = document.getElementById('selectCity')?.value;
  const district = document.getElementById('selectDistrict')?.value;
  const address = document.getElementById('inputAddress')?.value.trim();

  const pricePerNight = document.getElementById('inputPrice')?.value.replace(/\D/g, '');
  const weekendPrice = document.getElementById('inputWeekendPrice')?.value.replace(/\D/g, '');
  const description = document.getElementById('inputDescription')?.value;
  const freeCancel48h = document.getElementById('checkFreeCancel')?.checked;

  const amenities = [];
  document.querySelectorAll('.amenity-card.selected input').forEach(inp => {
    amenities.push({
      id: inp.dataset.id || 'amenity',
      name: inp.value,
      icon: inp.dataset.icon || 'star'
    });
  });

  return {
    title,
    roomType,
    maxGuests,
    bedrooms,
    beds,
    area,
    city,
    district,
    address,
    pricePerNight,
    weekendPrice: weekendPrice || pricePerNight,
    description,
    freeCancel48h,
    amenities: JSON.stringify(amenities),
    images: JSON.stringify(currentImages),
    status: targetStatus,
    lat: parseFloat(document.getElementById('inputLatitude')?.value) || 16.0678,
    lng: parseFloat(document.getElementById('inputLongitude')?.value) || 108.2208
  };
}

function initFormActions() {
  const roomId = document.getElementById('roomId')?.value;
  const btnSaveDraft = document.getElementById('btnSaveDraft');
  const btnPublish = document.getElementById('btnPublish');
  const btnCancel = document.getElementById('btnCancelChanges');

  btnSaveDraft?.addEventListener('click', (e) => {
    e.preventDefault();
    submitRoomForm('Draft');
  });

  btnPublish?.addEventListener('click', (e) => {
    e.preventDefault();
    submitRoomForm('Published');
  });

  btnCancel?.addEventListener('click', (e) => {
    e.preventDefault();
    if (isFormDirty) {
      openModal('modalConfirmCancel');
    } else {
      window.location.href = '/host/rooms';
    }
  });
}

async function submitRoomForm(targetStatus) {
  const payload = getFormDataPayload(targetStatus);
  const roomId = document.getElementById('roomId')?.value;
  const isPublishing = targetStatus === 'Published';

  // Client-side validations for Publishing
  if (isPublishing) {
    if (!payload.title || !payload.city || !payload.district || !payload.address || !payload.pricePerNight || !payload.description) {
      showToast('warning', 'ROOM-REQ-001', 'Vui lòng nhập đầy đủ các trường thông tin bắt buộc có dấu (*).');
      return;
    }
    if (payload.title.length < 10 || payload.title.length > 150) {
      showToast('warning', 'ROOM-REQ-001', 'Tên phòng nghỉ phải từ 10 đến 150 ký tự.');
      return;
    }
    if (payload.description.length < 50) {
      showToast('warning', 'ROOM-REQ-001', 'Mô tả chi tiết phòng nghỉ bắt buộc tối thiểu 50 ký tự.');
      return;
    }
    if (payload.description.length > 1000) {
      showToast('warning', 'ROOM-CHAR-LIMIT', 'Mô tả phòng đã vượt quá giới hạn 1.000 ký tự cho phép.');
      return;
    }
    if (currentImages.length < 3) {
      openModal('modalRoomImg001');
      return;
    }
  }

  const url = roomId ? `/host/rooms/${roomId}` : '/host/rooms';
  const method = roomId ? 'PUT' : 'POST';

  const activeBtn = isPublishing ? document.getElementById('btnPublish') : document.getElementById('btnSaveDraft');
  const originalHtml = activeBtn ? activeBtn.innerHTML : '';
  if (activeBtn) {
    activeBtn.disabled = true;
    activeBtn.style.opacity = '0.7';
    activeBtn.innerHTML = `<span>⏳ ${isPublishing ? 'Đang đăng bán...' : 'Đang lưu nháp...'}</span>`;
  }

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.status === 401 && data.code === 'AUTH-401-EXPIRED') {
      if (activeBtn) {
        activeBtn.disabled = false;
        activeBtn.style.opacity = '1';
        activeBtn.innerHTML = originalHtml;
      }
      // Token expired! Open Quick Auth Modal without losing data
      openModal('modalQuickAuth');
      return;
    }

    if (data.success) {
      isFormDirty = false;
      const autoSaveKey = `smart_travel_draft_${roomId || 'new'}`;
      localStorage.removeItem(autoSaveKey);

      showToast('success', data.code, data.message);
      setTimeout(() => {
        window.location.href = data.redirectUrl || '/host/rooms';
      }, 1200);
    } else {
      if (activeBtn) {
        activeBtn.disabled = false;
        activeBtn.style.opacity = '1';
        activeBtn.innerHTML = originalHtml;
      }
      showToast('warning', data.code || 'VALIDATION_ERROR', data.message);
    }
  } catch (err) {
    console.error(err);
    if (activeBtn) {
      activeBtn.disabled = false;
      activeBtn.style.opacity = '1';
      activeBtn.innerHTML = originalHtml;
    }
    showToast('error', 'SERVER_ERROR', 'Không thể lưu dữ liệu, vui lòng thử lại.');
  }
}

// Quick Auth Submit (AUTH-401-EXPIRED)
window.confirmQuickAuth = async function() {
  const email = document.getElementById('quickAuthEmail')?.value;
  const password = document.getElementById('quickAuthPassword')?.value;

  if (!email || !password) {
    showToast('warning', 'AUTH-REQ', 'Vui lòng nhập mật khẩu xác thực');
    return;
  }

  try {
    const res = await fetch('/host/api/quick-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      closeModal('modalQuickAuth');
      showToast('success', 'AUTH-OK', 'Phiên làm việc đã được gia hạn. Đang tiếp tục lưu...');
      // Retry publish
      submitRoomForm('Published');
    } else {
      showToast('error', 'AUTH-FAIL', data.message || 'Mật khẩu không chính xác');
    }
  } catch (err) {
    console.error(err);
    showToast('error', 'SERVER_ERROR', 'Lỗi xác thực');
  }
};
