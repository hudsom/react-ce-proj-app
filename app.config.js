export default {
  expo: {
    name: "CE Manager",
    slug: "ce-manager",
    owner: process.env.EXPO_OWNER || "hudsommariano",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/images/icon.png",
    scheme: "starterkitexpo",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: process.env.EXPO_ANDROID_PACKAGE || "com.cemanager.app",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.CAMERA",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.VIBRATE",
        "android.permission.RECORD_AUDIO"
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-screen-orientation",
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.png",
          color: "#ffffff"
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "A aplicação precisa acessar suas fotos para selecionar imagens das comunidades."
        }
      ],
      [
        "expo-updates",
        {
          username: process.env.EXPO_USERNAME || "hudsommariano"
        }
      ],
      "./plugins/withFirebaseManifestFix.js"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: process.env.EXPO_PROJECT_ID || "88511621-eaf5-47c6-873a-7c680ed2a6be"
      }
    }
  }
};