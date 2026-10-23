const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
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
    'KeyboardAvoidingView', 'ScrollView', 'ActivityIndicator',
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
  for (const role of ['HOST', 'USER']) {
    test(`${provider}: ${role === 'HOST' ? 'rejects HOST' : 'allows USER'}`, async () => {
      const screen = renderScreen('LoginScreen', ['traveler', 'secret123'], [
        { ok: true, data: { accessToken: 'jwt' } },
        { ok: true, data: { role, username: 'traveler' } },
      ], provider === 'google' ? {
        type: 'success', authentication: { accessToken: 'google-token' },
      } : null);
      if (provider === 'password') {
        const button = screen.find(screen.tree, (node) =>
          node.type === 'TouchableOpacity' && node.props.onPress?.name === 'handleLogin');
        assert.ok(button);
        await button.props.onPress();
      } else {
        screen.effects.forEach((effect) => effect());
        await new Promise((resolve) => setImmediate(resolve));
      }
      assert.equal(screen.requests.length, 2);
      assert.ok(screen.requests[0].url.endsWith(provider === 'google' ? '/auth/google' : '/auth/signin'));
      assert.equal(screen.navigations.length, role === 'HOST' ? 0 : 1);
      assert.equal(screen.alerts.length, role === 'HOST' ? 1 : 0);
      if (role === 'HOST') assert.match(screen.alerts[0][1], /Chủ phòng/);
      else assert.equal(screen.navigations[0][0], 'Profile');
    });
  }
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
