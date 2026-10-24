// Mock @expo/vector-icons để tránh lỗi tải font ttf qua expo-asset trong Jest (Expo SDK 58)
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = ({ name, testID, ...props }) => (
    <Text testID={testID || `icon-${name}`} {...props}>{name}</Text>
  );
  return new Proxy({}, {
    get: () => MockIcon,
  });
});
