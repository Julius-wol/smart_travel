const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

function checkout(responses) {
  const state = [], calls = [], navigations = [];
  let cursor = 0;
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState: initial => {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
    },
  };
  const native = new Proxy({ StyleSheet: { create: styles => Object.fromEntries(
    Object.entries(styles).map(([key, value]) => [key, { ...value, testStyle: key }])
  ) } }, { get: (object, key) => object[key] || key });
  const exports = {};
  const code = babel.transformSync(fs.readFileSync(path.join(__dirname, '../src/screens/CheckoutScreen.js'), 'utf8'), {
    configFile: false, babelrc: false,
    plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'],
  }).code;
  vm.runInNewContext(code, {
    exports, console: { log() {}, error() {} },
    require: name => name === 'react' ? react : name === 'react-native' ? native : name === '../utils/config'
      ? { API_URL: 'http://local.test/api', resolveMediaUrl: value => value }
      : new Proxy({}, { get: (_, key) => key }),
    fetch: async (url, options) => {
      calls.push({ url, options });
      assert.ok(responses.length, 'Unexpected request after a conflicting booking');
      const response = responses.shift();
      return { ok: response.status === 200, status: response.status, json: async () => response.data };
    },
  });
  const render = () => {
    cursor = 0;
    return exports.default({
      route: { params: {
        user: { _id: 'current-user', firstName: 'Guest', phone: '0901234567', email: 'guest@example.com' },
        token: 'current-token', homestay: { _id: 'new-room', pricePerNight: 1000000 },
        hasCustomDates: true, checkIn: '2026-11-10T14:00:00', nights: 2,
      } },
      navigation: { replace: (...args) => navigations.push(args) },
    });
  };
  return { render, calls, navigations };
}

const flatten = node => !node || typeof node !== 'object' ? [] : Array.isArray(node)
  ? node.flatMap(flatten) : [node, ...flatten(node.children)];

for (const stage of ['preflight', 'submit']) {
  test(`guest overlap at ${stage} stops checkout and offers a date change`, async () => {
    const conflict = { status: 409, data: { code: 'GUEST_BOOKING_CONFLICT', conflict: true, available: false, message: 'Overlapping booking' } };
    const screen = checkout(stage === 'preflight' ? [conflict] : [
      { status: 200, data: { success: true, available: true } }, conflict,
    ]);
    const submit = flatten(screen.render()).find(node => node.props.onPress?.name === 'handleConfirmPayment');
    assert.ok(submit);
    await submit.props.onPress();
    assert.equal(screen.calls.length, stage === 'preflight' ? 1 : 2);
    assert.ok(screen.calls[0].url.includes('userId=current-user'));
    assert.equal(screen.calls[0].options.headers.Authorization, 'Bearer current-token');
    assert.equal(screen.navigations.length, 0);
    const tree = flatten(screen.render());
    assert.ok(tree.some(node => node.type === 'Modal' && node.props.visible === true));
    assert.equal(tree.find(node => node.props.style?.testStyle === 'conflictDesc').children[0], 'Overlapping booking');
    assert.ok(tree.some(node => node.props.style?.testStyle === 'conflictBtnSecondary'));
    assert.ok(!tree.some(node => node.props.style?.testStyle === 'conflictBtnPrimary'));
  });
}
