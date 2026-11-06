module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@react-navigation/.*|react-native-safe-area-context|react-native-screens))"
  ],
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
};
