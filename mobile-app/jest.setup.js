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
