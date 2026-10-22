const { normalizeBackendUrl } = require('./src/config/backendUrl.cjs');

module.exports = ({ config }) => {
  const release = ['production', 'preview'].includes(process.env.APP_ENV);
  if (release) {
    normalizeBackendUrl(process.env.EXPO_PUBLIC_API_URL, false);
  }
  return {
    ...config,
    plugins: config.plugins.map((plugin) => {
      if (Array.isArray(plugin) && plugin[0] === 'expo-build-properties') {
        return [plugin[0], {
          ...plugin[1],
          android: { ...plugin[1].android, usesCleartextTraffic: !release },
        }];
      }
      return plugin;
    }),
    android: { ...config.android, usesCleartextTraffic: !release },
  };
};
