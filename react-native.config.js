module.exports = {
  project: {
    android: {
      packageName: 'com.roommate.expensecalculator',
    },
  },
  dependencies: {
    '@shopify/flash-list': {
      platforms: {
        android: {
          buildTypes: ['debug', 'release'],
        },
      },
    },
    'react-native-gesture-handler': {
      platforms: {
        android: {
          buildTypes: ['debug', 'release'],
        },
      },
    },
    'react-native-reanimated': {
      platforms: {
        android: {
          buildTypes: ['debug', 'release'],
        },
      },
    },
    'react-native-safe-area-context': {
      platforms: {
        android: {
          buildTypes: ['debug', 'release'],
        },
      },
    },
    'react-native-screens': {
      platforms: {
        android: {
          buildTypes: ['debug', 'release'],
        },
      },
    },
    'react-native-svg': {
      platforms: {
        android: {
          buildTypes: ['debug', 'release'],
        },
      },
    },
  },
};
