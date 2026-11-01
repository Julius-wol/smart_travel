const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = typeof global.test === 'function' ? global.test : require('node:test').test;
globalThis.test = test;
const babel = require('@babel/core');

// Exercise the screen handlers with local React Native and network substitutes.
function renderScreen(name, values, responses, googleResponse = null) {
  const alerts = [];
  const navigations = [];
  const requests = [];
  const effects = [];
  const filename = path.join(__dirname, '../src/screens', `${name}.js`);
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    filename,
    presets: [[require.resolve('babel-preset-expo'), { jsxRuntime: 'classic' }]],
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
    babelrc: false,
    configFile: false,
  });
  let stateIndex = 0;
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState: (initial) => [stateIndex < values.length ? values[stateIndex++] : initial, () => {}],
    useEffect: (effect) => effects.push(effect),
  };
  const native = Object.fromEntries([
    'View', 'Text', 'TextInput', 'TouchableOpacity', 'SafeAreaView',
    'KeyboardAvoidingView', 'ScrollView', 'ActivityIndicator', 'Modal',
  ].map((name) => [name, name]));
  native.StyleSheet = { create: (styles) => styles };
  native.Platform = { OS: 'android' };
  native.Alert = { alert: (...args) => alerts.push(args) };
  const mocks = {
    react,
    'react-native': native,
    '@expo/vector-icons': { Ionicons: 'Ionicons' },
    'expo-web-browser': { maybeCompleteAuthSession() {} },
    'expo-auth-session/providers/google': {
      useAuthRequest: () => [null, googleResponse, () => {}],
    },
    '../utils/config': { API_URL: 'https://local.test/api' },
  };
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (id) => Object.hasOwn(mocks, id) ? mocks[id] : require(id),
    console,
    global: globalThis,
    globalThis,
    fetch: async (url, options) => {
      requests.push({ url, options });
      assert.ok(responses.length, `Unexpected request: ${url}`);
      const response = responses.shift();
      return { ok: response.ok, json: async () => response.data };
    },
  }, { filename });
  const tree = exports.default({ navigation: { replace: (...args) => navigations.push(args) } });
  function find(node, predicate) {
    if (!node || typeof node !== 'object') return null;
    if (predicate(node)) return node;
    for (const child of node.children || []) {
      const found = find(child, predicate);
      if (found) return found;
    }
    return null;
  }
  return { alerts, navigations, requests, effects, tree, find };
}

for (const provider of ['password', 'google']) {
  for (const hasVisitor of [false, true]) {
    test(provider + ': ' + (hasVisitor ? 'uses visitor profile returned by API' : 'shows API login failure'), async () => {
      const responses = hasVisitor ? [
        { ok: true, data: { status: 200, message: 'OK', data: { accessToken: 'jwt' } } },
        { ok: true, data: { status: 200, message: 'OK', data: { role: 'USER', email: 'same@gmail.com', username: 'traveler' } } },
      ] : [{ ok: false, data: { status: 401, message: 'Visitor account not found', data: null } }];
      const screen = renderScreen('LoginScreen', ['same@gmail.com', 'secret123'], responses,
        provider === 'google' ? { type: 'success', authentication: { accessToken: 'google-token' } } : null);
      if (provider === 'password') {
        const button = screen.find(screen.tree, node => node.type === 'TouchableOpacity' && node.props.onPress?.name === 'handleLogin');
        assert.ok(button);
        await button.props.onPress();
      } else {
        screen.effects.forEach(effect => effect());
        await new Promise(resolve => setImmediate(resolve));
      }
      assert.equal(screen.requests.length, hasVisitor ? 2 : 1);
      const body = JSON.parse(screen.requests[0].options.body);
      assert.equal(body.platform, 'mobile');
      assert.equal(body.role, 'USER');
      assert.equal(screen.navigations.length, hasVisitor ? 1 : 0);
      assert.equal(screen.alerts.length, hasVisitor ? 0 : 1);
      if (hasVisitor) {
        assert.equal(screen.navigations[0][0], 'Home');
        assert.equal(screen.navigations[0][1].user.role, 'USER');
        assert.equal(screen.navigations[0][1].token, 'jwt');
      }
    });
  }
}

for (const provider of ['password', 'google']) {
  test(`${provider}: HOST account opens the visitor Home screen`, async () => {
    const screen = renderScreen('LoginScreen', ['host@gmail.com', 'secret123'], [
      { ok: true, data: { status: 200, data: { accessToken: 'host-jwt' } } },
      { ok: true, data: { status: 200, data: { role: 'HOST', email: 'host@gmail.com' } } },
    ], provider === 'google' ? {
      type: 'success', authentication: { accessToken: 'google-token' },
    } : null);
    if (provider === 'password') {
      const button = screen.find(screen.tree, node => node.props.onPress?.name === 'handleLogin');
      await button.props.onPress();
    } else {
      screen.effects.forEach(effect => effect());
      await new Promise(resolve => setImmediate(resolve));
    }
    assert.equal(screen.alerts.length, 0);
    assert.equal(screen.navigations.length, 1);
    assert.equal(screen.navigations[0][0], 'Home');
    assert.equal(screen.navigations[0][1].user.role, 'HOST');
    assert.equal(screen.navigations[0][1].token, 'host-jwt');
  });
}

test('registration only sends USER and has no HOST selector', async () => {
  const screen = renderScreen('RegisterScreen', [
    'traveler', 'An', 'Nguyen', 'an@example.com', '0912345678', 'secret123',
  ], [{ ok: true, data: {} }]);
  const submit = screen.find(screen.tree, (node) =>
    node.type === 'TouchableOpacity' && node.props.onPress?.name === 'handleRegister');
  assert.ok(submit);
  await submit.props.onPress();
  assert.equal(screen.requests.length, 1);
  assert.equal(JSON.parse(screen.requests[0].options.body).role, 'USER');
  assert.equal(screen.find(screen.tree, (node) => node.children?.includes('Chủ phòng')), null);
});
