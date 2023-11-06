module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // react-native-dotenv
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
  ],
};
