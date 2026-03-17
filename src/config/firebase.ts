import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import Constants from 'expo-constants';

type FirebaseRuntimeConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

function getExpoExtraFirebaseConfig(): FirebaseRuntimeConfig | undefined {
  const extra =
    (Constants.expoConfig?.extra as Record<string, unknown> | undefined)
    ?? ((Constants as any).manifest2?.extra as Record<string, unknown> | undefined)
    ?? ((Constants as any).manifest?.extra as Record<string, unknown> | undefined);

  return extra?.firebase as FirebaseRuntimeConfig | undefined;
}

const extraFirebaseConfig = getExpoExtraFirebaseConfig();
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || extraFirebaseConfig?.apiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || extraFirebaseConfig?.authDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || extraFirebaseConfig?.projectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || extraFirebaseConfig?.storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || extraFirebaseConfig?.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || extraFirebaseConfig?.appId,
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    try {
      authInstance = initializeAuth(app);
    } catch {
      authInstance = getAuth(app);
    }
  } else {
    app = getApp();
    // App already initialized — get existing auth instance
    try {
      authInstance = getAuth(app);
    } catch {
      authInstance = null;
    }
  }
} else {
  console.warn('Firebase configuration is missing. Check Expo extra.firebase or EXPO_PUBLIC_FIREBASE_* values.');
}

export const auth: Auth | null = authInstance;
export const db: Firestore | null = app ? getFirestore(app) : null;
export const storage: FirebaseStorage | null = app ? getStorage(app) : null;
export default app;
