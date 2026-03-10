import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// ערכים מ-GoogleService-Info.plist (פרויקט cteennetivot-216e7)
const firebaseConfig = {
  apiKey: 'AIzaSyCbRg5hXiE8rePNBxddZGjEuN-YTAOWXfc',
  authDomain: 'cteennetivot-216e7.firebaseapp.com',
  projectId: 'cteennetivot-216e7',
  storageBucket: 'cteennetivot-216e7.firebasestorage.app',
  messagingSenderId: '1092504252242',
  appId: '1:1092504252242:ios:1bce1c4dea5b07a314148b',
};

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0] as FirebaseApp;
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
