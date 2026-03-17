const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const projectRoot = __dirname;
const androidGoogleServicesPath = path.join(projectRoot, 'google-services.json');
const androidGoogleServicesEnv = process.env.GOOGLE_SERVICES_JSON?.trim();
const iosGoogleServicesPath = path.join(projectRoot, 'GoogleService-Info.plist');

if (androidGoogleServicesEnv && !fs.existsSync(androidGoogleServicesPath)) {
  fs.writeFileSync(androidGoogleServicesPath, `${androidGoogleServicesEnv}\n`, 'utf8');
}

const hasAndroidGoogleServices = fs.existsSync(androidGoogleServicesPath);

function readIosFirebaseConfig() {
  if (!fs.existsSync(iosGoogleServicesPath)) {
    return null;
  }

  try {
    const raw = execFileSync('plutil', ['-convert', 'json', '-o', '-', iosGoogleServicesPath], {
      encoding: 'utf8',
    });
    const plist = JSON.parse(raw);

    if (!plist.API_KEY || !plist.PROJECT_ID || !plist.GOOGLE_APP_ID) {
      return null;
    }

    return {
      apiKey: plist.API_KEY,
      authDomain: `${plist.PROJECT_ID}.firebaseapp.com`,
      projectId: plist.PROJECT_ID,
      storageBucket: plist.STORAGE_BUCKET,
      messagingSenderId: plist.GCM_SENDER_ID,
      appId: plist.GOOGLE_APP_ID,
    };
  } catch {
    return null;
  }
}

module.exports = ({ config }) => {
  const { googleServicesFile, ...androidConfig } = config.android ?? {};
  const basePlugins = config.plugins ?? [];
  const plugins = basePlugins.includes('expo-video') ? basePlugins : [...basePlugins, 'expo-video'];
  const iosFirebaseConfig = readIosFirebaseConfig();
  const firebaseFromEnv = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  const firebase = {
    apiKey: firebaseFromEnv.apiKey || iosFirebaseConfig?.apiKey,
    authDomain: firebaseFromEnv.authDomain || iosFirebaseConfig?.authDomain,
    projectId: firebaseFromEnv.projectId || iosFirebaseConfig?.projectId,
    storageBucket: firebaseFromEnv.storageBucket || iosFirebaseConfig?.storageBucket,
    messagingSenderId: firebaseFromEnv.messagingSenderId || iosFirebaseConfig?.messagingSenderId,
    appId: firebaseFromEnv.appId || iosFirebaseConfig?.appId,
  };

  return {
    ...config,
    android: {
      ...androidConfig,
      ...(hasAndroidGoogleServices ? { googleServicesFile: './google-services.json' } : {}),
    },
    plugins,
    extra: {
      ...(config.extra ?? {}),
      firebase,
    },
  };
};
