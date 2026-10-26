// SDK 58's expo-asset reads the new public AssetRegistry export. Share the
// registry mock provided by jest-expo for the secondary entry point.
const { AssetRegistry } = require('react-native');
const mockedRegistry = require('react-native/asset-registry');

jest.spyOn(AssetRegistry, 'getAssetByID').mockImplementation(mockedRegistry.getAssetByID);
jest.spyOn(AssetRegistry, 'registerAsset').mockImplementation(mockedRegistry.registerAsset);
