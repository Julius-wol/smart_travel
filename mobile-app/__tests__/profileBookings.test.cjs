const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

const transform = filename => babel.transformSync(fs.readFileSync(filename, 'utf8'), {
  configFile: false, babelrc: false,
  plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'],
}).code;

function profile(initialResponse) {
  let response = initialResponse, cursor = 0, focus;
  const values = [], effects = [], requests = [];
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState: initial => {
      const index = cursor++;
      if (!(index in values)) values[index] = initial;
      return [values[index], value => { values[index] = typeof value === 'function' ? value(values[index]) : value; }];
    },
    useRef: () => ({ current: null }), useEffect: effect => effects.push(effect),
  };
  const native = new Proxy({
    Platform: { OS: 'android' },
    StyleSheet: { create: styles => Object.fromEntries(Object.entries(styles).map(([key, value]) => [key, { ...value, testStyle: key }])) },
  }, { get: (object, key) => object[key] || key });
  const helper = {};
  vm.runInNewContext(transform(path.join(__dirname, '../src/utils/bookingHistory.js')), { exports: helper });
  const mocks = {
    react, 'react-native': native,
    'react-redux': { useDispatch: () => () => {}, useSelector: fn => fn({ wishlist: { savedRoomIds: {} } }) },
    '../utils/bookingHistory': helper,
    '../utils/config': { API_URL: 'http://local.test/api', BASE_URL: 'http://local.test', resolveMediaUrl: value => value },
  };
  const exports = {};
  vm.runInNewContext(transform(path.join(__dirname, '../src/screens/ProfileScreen.js')), {
    exports, console,
    require: name => mocks[name] || new Proxy({}, { get: (_, key) => key }),
    fetch: async (url, options) => {
      requests.push({ url, options });
      return { ok: response.ok, json: async () => response.body };
    },
  });
  const navigation = { getState: () => ({ type: 'tab' }), addListener: (_, listener) => { focus = listener; return () => {}; } };
  const render = () => {
    cursor = 0;
    return exports.default({ navigation, route: { params: { token: 'host-token', user: { _id: 'host-id', role: 'HOST', fullName: 'Le Hoang Host', email: 'host@example.com' } } } });
  };
  return { render, requests, load: async () => { effects[0](); await new Promise(resolve => setImmediate(resolve)); },
    refresh: async next => { response = next; await focus(); } };
}

const flatten = node => !node || typeof node !== 'object' ? [] : Array.isArray(node)
  ? node.flatMap(flatten) : [node, ...flatten(node.children)];
const cards = tree => flatten(tree).filter(node => node.props.style?.testStyle === 'bookedTravelCard');
const empty = { ok: true, body: { success: true, data: [] } };

test('host with no bookings sees zero cards and no fake upcoming trip', async () => {
  const screen = profile(empty);
  assert.equal(cards(screen.render()).length, 0);
  await screen.load();
  const tree = flatten(screen.render());
  assert.equal(cards(screen.render()).length, 0);
  assert.ok(tree.some(node => node.children?.includes('Bạn chưa đặt phòng nào')));
  assert.ok(!tree.some(node => node.props.style?.testStyle === 'tripHeroCard'));
  assert.equal(screen.requests[0].options.headers.Authorization, 'Bearer host-token');
  assert.equal(screen.requests[0].url, 'http://local.test/api/bookings/my-bookings');
});

test('returning from a booking refreshes real cards; empty response clears old cards', async () => {
  const screen = profile({ ok: true, body: { success: true, data: [{
    _id: 'booking-id', bookingCode: 'REAL-123', status: 'PENDING', paymentStatus: 'PAID',
    checkIn: '2099-11-01', checkOut: '2099-11-03', nights: 2, totalNights: 1, totalPrice: 0,
    roomId: { _id: 'room-id', title: 'Actual room', images: ['/uploads/rooms/real.jpg'] },
  }] } });
  screen.render(); await screen.load();
  const tree = screen.render();
  assert.equal(cards(tree).length, 1);
  assert.ok(flatten(cards(tree)[0]).some(node => node.children?.includes('CHỜ DUYỆT')));
  assert.ok(flatten(cards(tree)[0]).some(node => node.children?.includes('0đ')));
  await screen.refresh(empty);
  assert.equal(cards(screen.render()).length, 0);
  assert.ok(!flatten(screen.render()).some(node => node.props.style?.testStyle === 'tripHeroCard'));
});

test('API failure displays an error instead of sample bookings', async () => {
  const screen = profile({ ok: false, body: { message: 'Không thể tải dữ liệu' } });
  screen.render(); await screen.load();
  const tree = flatten(screen.render());
  assert.equal(cards(screen.render()).length, 0);
  assert.ok(tree.some(node => node.children?.includes('Không thể tải booking')));
  assert.ok(tree.some(node => node.children?.includes('Thử lại')));
});
