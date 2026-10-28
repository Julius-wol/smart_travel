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

// Mock and polyfills for Jest environment in Expo SDK 58
const { AssetRegistry } = require('react-native');
if (AssetRegistry) {
  const originalGet = AssetRegistry.getAssetByID;
  AssetRegistry.getAssetByID = (assetId) => {
    return originalGet?.(assetId) || {
      fileSystemLocation: '/full/path/to/directory',
      httpServerLocation: '/assets/full/path/to/directory',
      scales: [1],
      fileHashes: ['md5'],
      name: 'name',
      exists: true,
      type: 'type',
    };
  };
}
