const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle module resolution issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add source map configuration
config.serializer.getModulesRunBeforeMainModule = () => [];

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
