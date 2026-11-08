const { withAppBuildGradle, withProjectBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

// Agrega el classpath de Google Services al build.gradle raíz
const withGoogleServicesClasspath = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('com.google.gms:google-services')) {
      config.modResults.contents = config.modResults.contents.replace(
        /classpath\('com\.facebook\.react:react-native-gradle-plugin'\)/,
        `classpath('com.facebook.react:react-native-gradle-plugin')\n        classpath('com.google.gms:google-services:4.4.2')`
      );
    }
    return config;
  });
};

// Agrega el apply plugin al app/build.gradle
const withGoogleServicesPlugin = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('com.google.gms.google-services')) {
      config.modResults.contents = config.modResults.contents.replace(
        /apply plugin: "com\.facebook\.react"/,
        `apply plugin: "com.facebook.react"\napply plugin: "com.google.gms.google-services"`
      );
    }
    return config;
  });
};

// Copia el google-services.json a android/app/
const withCopyGoogleServices = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const src = path.join(config.modRequest.projectRoot, 'google-services.json');
      const dest = path.join(config.modRequest.platformProjectRoot, 'app', 'google-services.json');
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
      return config;
    },
  ]);
};

module.exports = (config) => {
  config = withGoogleServicesClasspath(config);
  config = withGoogleServicesPlugin(config);
  config = withCopyGoogleServices(config);
  return config;
};
