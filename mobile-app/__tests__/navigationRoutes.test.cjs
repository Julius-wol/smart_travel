const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

function loadNavigator(bottomInset = 0, fontScale = 1) {
  const react = { createElement: (type, props, ...children) => ({ type, props: props || {}, children }) };
  const mocks = {
    react,
    'react-native': { View: 'View', Text: 'Text', StyleSheet: { create: value => value }, useWindowDimensions: () => ({ fontScale }) },
    '@expo/vector-icons': { Ionicons: 'Ionicons' },
    '@react-navigation/native': { NavigationContainer: 'NavigationContainer' },
    '@react-navigation/native-stack': { createNativeStackNavigator: () => ({ Navigator: 'Stack.Navigator', Screen: 'Stack.Screen' }) },
    '@react-navigation/bottom-tabs': { createBottomTabNavigator: () => ({ Navigator: 'Tab.Navigator', Screen: 'Tab.Screen' }) },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ bottom: bottomInset }) },
    '../constants/theme': { COLORS: {}, TYPOGRAPHY: { sizes: {}, weights: {} } },
  };
  const filename = path.join(__dirname, '../src/navigation/AppNavigator.js');
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    configFile: false, babelrc: false,
    plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'],
  });
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: id => mocks[id] || { __esModule: true, default: `${id}:screen` },
  });
  const root = exports.default({ initialRouteName: 'Login' });
  return root.children[0].children;
}

for (const [entry, active] of [['Home', 'Discovery'], ['Profile', 'Account'], ['BookingDiscovery', 'Booking']]) {
  test(`${entry} enters the shared four-tab navigator with its session`, () => {
    const screens = loadNavigator(34);
    const route = screens.find(screen => screen.props.name === entry);
    const session = { user: { _id: 'current-user', role: 'HOST' }, token: 'current-token' };
    let tree = route.props.component({ route: { params: session } });
    while (typeof tree.type === 'function') tree = tree.type(tree.props);
    assert.equal(tree.type, 'Tab.Navigator');
    assert.equal(tree.props.initialRouteName, active);
    assert.equal(tree.children.length, 4);
    assert.deepEqual(Array.from(tree.children, screen => screen.props.name), ['Discovery', 'Booking', 'Itinerary', 'Account']);
    for (const screen of tree.children.filter(screen => screen.props.name !== 'Itinerary')) {
      assert.equal(screen.props.initialParams.token, session.token);
      assert.equal(screen.props.initialParams.user, session.user);
    }
    const options = tree.props.screenOptions({ route: { name: active } });
    assert.equal(options.tabBarStyle.height, 106);
    assert.equal(options.tabBarStyle.paddingBottom, 40);
  });
}

test('room details and checkout remain available on the root stack', () => {
  const screens = loadNavigator();
  for (const name of ['HomeDetails', 'RoomDetail', 'Checkout', 'BookingSuccess']) {
    assert.ok(screens.some(screen => screen.props.name === name));
  }
});
