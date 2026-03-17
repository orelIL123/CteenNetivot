import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  deleteUser as firebaseDeleteUser,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { deleteUserAccountData, getUserProfile, savePushToken, type UserProfileDoc } from '../services/firestore';

type AuthState = {
  user: User | null;
  profile: UserProfileDoc | null;
  loading: boolean;
  isReady: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signInAnonymously: () => Promise<User>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  isReady: false,
  signUp: async () => { throw new Error('not ready'); },
  signIn: async () => { throw new Error('not ready'); },
  signInAnonymously: async () => { throw new Error('not ready'); },
  signOut: async () => {},
  deleteAccount: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  // Track the current uid to detect user switching
  const currentUidRef = useRef<string | null>(null);

  const loadProfile = async (u: User): Promise<UserProfileDoc | null> => {
    const p = await getUserProfile(u.uid);
    return p;
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setIsReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      // Detect user switch — clear profile immediately
      if (u?.uid !== currentUidRef.current) {
        setProfile(null);
        currentUidRef.current = u?.uid ?? null;
      }

      setUser(u);

      if (u && !u.isAnonymous) {
        const p = await loadProfile(u);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
      setIsReady(true);
    });
    return () => unsub();
  }, []);

  const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
    if (!auth) throw new Error('Firebase not initialized');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    setUser(cred.user);
    currentUidRef.current = cred.user.uid;
    return cred.user;
  };

  const signIn = async (email: string, password: string): Promise<User> => {
    if (!auth) throw new Error('Firebase not initialized');
    // Clear previous profile immediately on sign-in attempt
    setProfile(null);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    setUser(cred.user);
    currentUidRef.current = cred.user.uid;
    const p = await loadProfile(cred.user);
    setProfile(p);
    return cred.user;
  };

  const signInAnon = async (): Promise<User> => {
    if (!auth) throw new Error('Firebase not initialized');
    setProfile(null);
    const cred = await firebaseSignInAnonymously(auth);
    setUser(cred.user);
    currentUidRef.current = cred.user.uid;
    setProfile(null);
    return cred.user;
  };

  const signOut = async () => {
    if (!auth) return;
    setProfile(null);
    setUser(null);
    currentUidRef.current = null;
    await firebaseSignOut(auth);
  };

  const deleteAccount = async () => {
    if (!auth?.currentUser) throw new Error('User not authenticated');
    const currentUser = auth.currentUser;

    await deleteUserAccountData(currentUser.uid);
    await firebaseDeleteUser(currentUser);

    setProfile(null);
    setUser(null);
    currentUidRef.current = null;
  };

  const refreshProfile = async () => {
    if (user && !user.isAnonymous) {
      const p = await loadProfile(user);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isReady,
      signUp,
      signIn,
      signInAnonymously: signInAnon,
      signOut,
      deleteAccount,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
