import {
  collection,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  DocumentData,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// ─── שמות האוספים ב-Firestore ─────────────────────────────────────────────
export const COLLECTIONS = {
  chavrutot: 'chavrutot',
  notifications: 'notifications',
  updates: 'updates',
  shiurim: 'shiurim',
  users: 'users',
  chabadHouses: 'chabadHouses',
  shiurComments: 'shiurComments',
  volunteerRequests: 'volunteerRequests',
  appConfig: 'appConfig',
  pushTokens: 'pushTokens',
} as const;

// ─── טיפוסים ─────────────────────────────────────────────────────────────────

export interface UserProfileDoc {
  uid: string;
  firstName: string;
  lastName: string;
  displayName: string;
  gender: 'male' | 'female';
  phone: string;
  email: string;
  avatar: string;
  createdAt: string;
  isAdmin?: boolean;
  expoPushToken?: string;
}

export interface ChavrutaDoc {
  id: string;
  name: string;
  age: number;
  level: 'מתחיל' | 'בינוני' | 'מתקדם';
  subjects: string[];
  availability: string[];
  avatar: string;
  bio: string;
  hours?: Record<string, string[]>;
}

export interface NotificationDoc {
  id: string;
  title: string;
  body?: string;
  time: string;
  date: string;
  createdAt: string;
}

export interface UpdateDoc {
  id: string;
  title: string;
  body?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface ShiurDoc {
  id: string;
  title: string;
  description?: string;
  teacher: string;
  day: string;
  time: string;
  location: string;
  category: 'tanya' | 'parasha' | 'halacha' | 'chassidut' | 'general';
  imageUrl?: string;
  rsvpUids: string[];
  likeUids: string[];
  createdAt: string;
  active: boolean;
}

export interface ShiurCommentDoc {
  id: string;
  shiurId: string;
  uid: string;
  displayName: string;
  text: string;
  createdAt: string;
}

export interface ChabadHouseDoc {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  location: string;
  logoUrl?: string;
  order?: number;
}

export interface VolunteerRequestDoc {
  id: string;
  title: string;
  body: string;
  spotsNeeded: number;
  volunteerUids: string[];
  anonymousCount: number;
  createdAt: string;
  active: boolean;
}

export interface AppConfigDoc {
  heroMediaType?: 'image' | 'video';
  heroImageUrl?: string | null;
  heroVideoUrl?: string | null;
  heroTitle?: string;
  heroSubtitle?: string;
  updatedAt?: string;
}

// ─── Utils ────────────────────────────────────────────────────────────────────

export function isFirestoreReady(): boolean {
  return db != null;
}

function safeTimestampToIso(ts: unknown): string {
  if (ts && typeof ts === 'object' && 'toDate' in ts && typeof (ts as Timestamp).toDate === 'function') {
    return (ts as Timestamp).toDate().toISOString();
  }
  if (typeof ts === 'string') return ts;
  return new Date().toISOString();
}

function docToData<T extends { id: string }>(doc: DocumentData, id: string): T {
  const data = doc as Omit<T, 'id'>;
  return { ...data, id } as T;
}

/** מסיר undefined מאובייקט – Firestore לא מקבל undefined */
function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

// ─── Push Tokens ──────────────────────────────────────────────────────────────

export async function savePushToken(uid: string, token: string): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, COLLECTIONS.pushTokens, uid), {
      token,
      uid,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    // Also save on user profile
    await setDoc(doc(db, COLLECTIONS.users, uid), {
      expoPushToken: token,
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore savePushToken:', e);
  }
}

export async function getAllPushTokens(): Promise<string[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.pushTokens));
    return snap.docs
      .map((d) => d.data().token as string)
      .filter(Boolean);
  } catch (e) {
    console.warn('Firestore getAllPushTokens:', e);
    return [];
  }
}

// ─── App Config (hero image) ──────────────────────────────────────────────────

export async function getAppConfig(): Promise<AppConfigDoc | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.appConfig, 'main'));
    if (!snap.exists()) return null;
    return snap.data() as AppConfigDoc;
  } catch (e) {
    console.warn('Firestore getAppConfig:', e);
    return null;
  }
}

export async function setAppConfig(data: Partial<AppConfigDoc>): Promise<boolean> {
  if (!db) return false;
  try {
    await setDoc(doc(db, COLLECTIONS.appConfig, 'main'), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (e) {
    console.warn('Firestore setAppConfig:', e);
    return false;
  }
}

export async function uploadHeroMedia(
  uri: string,
  type: NonNullable<AppConfigDoc['heroMediaType']>
): Promise<string | null> {
  if (!storage) return null;
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const extension = type === 'video' ? 'mp4' : 'jpg';
    const contentType = type === 'video' ? 'video/mp4' : 'image/jpeg';
    const heroRef = ref(storage, `hero/main.${extension}`);
    await uploadBytes(heroRef, blob, { contentType });
    return await getDownloadURL(heroRef);
  } catch (e) {
    console.warn('Storage uploadHeroMedia error:', e);
    return null;
  }
}

// ─── Volunteer Requests ───────────────────────────────────────────────────────

export async function getVolunteerRequests(): Promise<VolunteerRequestDoc[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.volunteerRequests),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title ?? '',
        body: data.body ?? '',
        spotsNeeded: data.spotsNeeded ?? 0,
        volunteerUids: data.volunteerUids ?? [],
        anonymousCount: data.anonymousCount ?? 0,
        createdAt: safeTimestampToIso(data.createdAt),
        active: data.active !== false,
      } as VolunteerRequestDoc;
    });
  } catch (e) {
    console.warn('Firestore getVolunteerRequests:', e);
    return [];
  }
}

export async function addVolunteerRequest(data: {
  title: string;
  body: string;
  spotsNeeded: number;
}): Promise<string | null> {
  if (!db) return null;
  try {
    const r = await addDoc(collection(db, COLLECTIONS.volunteerRequests), {
      ...data,
      volunteerUids: [],
      anonymousCount: 0,
      active: true,
      createdAt: serverTimestamp(),
    });
    return r.id;
  } catch (e) {
    console.warn('Firestore addVolunteerRequest:', e);
    return null;
  }
}

export async function deleteVolunteerRequest(id: string): Promise<boolean> {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.volunteerRequests, id));
    return true;
  } catch (e) {
    console.warn('Firestore deleteVolunteerRequest:', e);
    return false;
  }
}

export async function volunteerForRequest(
  requestId: string,
  uid: string,
  anonymous: boolean
): Promise<boolean> {
  if (!db) return false;
  try {
    if (anonymous) {
      await updateDoc(doc(db, COLLECTIONS.volunteerRequests, requestId), {
        anonymousCount: increment(1),
      });
    } else {
      await updateDoc(doc(db, COLLECTIONS.volunteerRequests, requestId), {
        volunteerUids: arrayUnion(uid),
      });
    }
    return true;
  } catch (e) {
    console.warn('Firestore volunteerForRequest:', e);
    return false;
  }
}

// ─── Chavrutot ────────────────────────────────────────────────────────────────

export async function getChavrutot(): Promise<ChavrutaDoc[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.chavrutot));
    return snap.docs.map((d) => docToData<ChavrutaDoc>(d.data(), d.id));
  } catch (e) {
    console.warn('Firestore getChavrutot:', e);
    return [];
  }
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(maxItems = 50): Promise<NotificationDoc[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.notifications),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title ?? '',
        body: data.body,
        time: data.time ?? '',
        date: data.date ?? '',
        createdAt: safeTimestampToIso(data.createdAt),
      } as NotificationDoc;
    });
  } catch (e) {
    console.warn('Firestore getNotifications:', e);
    return [];
  }
}

export async function addNotification(data: {
  title: string;
  body?: string;
  time: string;
  date: string;
}): Promise<string | null> {
  if (!db) return null;
  try {
    const r = await addDoc(collection(db, COLLECTIONS.notifications), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return r.id;
  } catch (e) {
    console.warn('Firestore addNotification:', e);
    return null;
  }
}

// ─── Updates ──────────────────────────────────────────────────────────────────

export async function getUpdates(maxItems = 50): Promise<UpdateDoc[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.updates),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title ?? '',
        body: data.body,
        imageUrl: data.imageUrl,
        createdAt: safeTimestampToIso(data.createdAt),
      } as UpdateDoc;
    });
  } catch (e) {
    console.warn('Firestore getUpdates:', e);
    return [];
  }
}

export async function addUpdate(data: {
  title: string;
  body?: string;
  imageUrl?: string;
}): Promise<string | null> {
  if (!db) return null;
  try {
    const r = await addDoc(collection(db, COLLECTIONS.updates), {
      ...omitUndefined({ title: data.title, body: data.body, imageUrl: data.imageUrl }),
      createdAt: serverTimestamp(),
    });
    return r.id;
  } catch (e) {
    console.warn('Firestore addUpdate:', e);
    return null;
  }
}

// ─── User Profiles ────────────────────────────────────────────────────────────

export async function createUserProfile(data: {
  uid: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  phone: string;
  email: string;
}): Promise<void> {
  if (!db) return;
  try {
    const displayName = `${data.firstName} ${data.lastName}`;
    await setDoc(doc(db, COLLECTIONS.users, data.uid), {
      uid: data.uid,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName,
      gender: data.gender,
      phone: data.phone,
      email: data.email,
      avatar: data.gender === 'female' ? '👧' : '👦',
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore createUserProfile:', e);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfileDoc | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      uid,
      firstName: d.firstName ?? '',
      lastName: d.lastName ?? '',
      displayName: d.displayName ?? '',
      gender: d.gender ?? 'male',
      phone: d.phone ?? '',
      email: d.email ?? '',
      avatar: d.avatar ?? '🧑',
      createdAt: safeTimestampToIso(d.createdAt),
      isAdmin: !!d.isAdmin,
      expoPushToken: d.expoPushToken,
    } as UserProfileDoc;
  } catch (e) {
    console.warn('Firestore getUserProfile:', e);
    return null;
  }
}

export async function setUserProfileFirestore(
  uid: string,
  data: { displayName: string; avatar?: string }
): Promise<void> {
  if (!db) return;
  try {
    await setDoc(
      doc(db, COLLECTIONS.users, uid),
      {
        displayName: data.displayName,
        avatar: data.avatar ?? '🧑',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Firestore setUserProfile:', e);
  }
}

export async function uploadUserAvatar(uid: string, uri: string): Promise<string | null> {
  if (!storage) return null;
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const avatarRef = ref(storage, `avatars/${uid}.jpg`);
    await uploadBytes(avatarRef, blob);
    return await getDownloadURL(avatarRef);
  } catch (e) {
    console.warn('Storage uploadUserAvatar error:', e);
    return null;
  }
}

export async function deleteUserAccountData(uid: string): Promise<void> {
  if (!db) return;

  try {
    const shiurimSnap = await getDocs(collection(db, COLLECTIONS.shiurim));
    for (const shiur of shiurimSnap.docs) {
      const shiurRef = doc(db, COLLECTIONS.shiurim, shiur.id);
      const data = shiur.data();
      const updates: Record<string, unknown> = {};

      if (Array.isArray(data.rsvpUids) && data.rsvpUids.includes(uid)) {
        updates.rsvpUids = arrayRemove(uid);
      }
      if (Array.isArray(data.likeUids) && data.likeUids.includes(uid)) {
        updates.likeUids = arrayRemove(uid);
      }
      if (Object.keys(updates).length > 0) {
        await updateDoc(shiurRef, updates);
      }

      const commentsSnap = await getDocs(collection(db, COLLECTIONS.shiurim, shiur.id, 'comments'));
      for (const comment of commentsSnap.docs) {
        if (comment.data().uid === uid) {
          await deleteDoc(doc(db, COLLECTIONS.shiurim, shiur.id, 'comments', comment.id));
        }
      }
    }

    const volunteerSnap = await getDocs(collection(db, COLLECTIONS.volunteerRequests));
    for (const volunteer of volunteerSnap.docs) {
      const data = volunteer.data();
      if (Array.isArray(data.volunteerUids) && data.volunteerUids.includes(uid)) {
        await updateDoc(doc(db, COLLECTIONS.volunteerRequests, volunteer.id), {
          volunteerUids: arrayRemove(uid),
        });
      }
    }

    await Promise.all([
      deleteDoc(doc(db, COLLECTIONS.users, uid)).catch(() => {}),
      deleteDoc(doc(db, COLLECTIONS.pushTokens, uid)).catch(() => {}),
    ]);
  } catch (e) {
    console.warn('Firestore deleteUserAccountData:', e);
    throw e;
  }

  if (!storage) return;
  try {
    await deleteObject(ref(storage, `avatars/${uid}.jpg`));
  } catch (e) {
    console.warn('Storage delete user avatar error:', e);
  }
}

// ─── Chabad Houses ────────────────────────────────────────────────────────────

export async function getChabadHouses(): Promise<ChabadHouseDoc[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, COLLECTIONS.chabadHouses), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<ChabadHouseDoc>(d.data(), d.id));
  } catch {
    try {
      const snap = await getDocs(collection(db!, COLLECTIONS.chabadHouses));
      return snap.docs.map((d) => docToData<ChabadHouseDoc>(d.data(), d.id));
    } catch (e2) {
      console.warn('Firestore getChabadHouses:', e2);
      return [];
    }
  }
}

export async function addChabadHouse(data: {
  name: string;
  contactName: string;
  phone: string;
  location: string;
  logoUrl?: string;
  order?: number;
}): Promise<string | null> {
  if (!db) return null;
  try {
    const payload = {
      name: data.name.trim(),
      contactName: data.contactName.trim(),
      phone: data.phone.trim(),
      location: data.location.trim(),
      logoUrl: data.logoUrl?.trim() || undefined,
      order: data.order ?? 0,
    };
    const r = await addDoc(collection(db, COLLECTIONS.chabadHouses), omitUndefined(payload));
    return r.id;
  } catch (e) {
    console.warn('Firestore addChabadHouse:', e);
    return null;
  }
}

// ─── Shiurim ──────────────────────────────────────────────────────────────────

export async function getShiurim(): Promise<ShiurDoc[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, COLLECTIONS.shiurim), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title ?? '',
        description: data.description,
        teacher: data.teacher ?? '',
        day: data.day ?? '',
        time: data.time ?? '',
        location: data.location ?? '',
        category: data.category ?? 'general',
        imageUrl: data.imageUrl,
        rsvpUids: data.rsvpUids ?? [],
        likeUids: data.likeUids ?? [],
        createdAt: safeTimestampToIso(data.createdAt),
        active: data.active !== false,
      } as ShiurDoc;
    });
  } catch (e) {
    console.warn('Firestore getShiurim:', e);
    return [];
  }
}

export async function addShiur(data: {
  title: string;
  description?: string;
  teacher: string;
  day: string;
  time: string;
  location: string;
  category: ShiurDoc['category'];
  imageUrl?: string;
}): Promise<string | null> {
  if (!db) return null;
  try {
    const r = await addDoc(collection(db, COLLECTIONS.shiurim), {
      ...omitUndefined({
        title: data.title,
        description: data.description,
        teacher: data.teacher,
        day: data.day,
        time: data.time,
        location: data.location,
        category: data.category,
        imageUrl: data.imageUrl,
      }),
      rsvpUids: [],
      likeUids: [],
      active: true,
      createdAt: serverTimestamp(),
    });
    return r.id;
  } catch (e) {
    console.warn('Firestore addShiur:', e);
    return null;
  }
}

export async function updateShiur(
  id: string,
  data: Partial<Omit<ShiurDoc, 'id' | 'rsvpUids' | 'likeUids' | 'createdAt'>>
): Promise<boolean> {
  if (!db) return false;
  try {
    await updateDoc(doc(db, COLLECTIONS.shiurim, id), omitUndefined(data as Record<string, unknown>) as DocumentData);
    return true;
  } catch (e) {
    console.warn('Firestore updateShiur:', e);
    return false;
  }
}

export async function deleteShiur(id: string): Promise<boolean> {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.shiurim, id));
    return true;
  } catch (e) {
    console.warn('Firestore deleteShiur:', e);
    return false;
  }
}

export async function toggleRsvp(shiurId: string, uid: string, isRsvped: boolean): Promise<boolean> {
  if (!db) return false;
  try {
    await updateDoc(doc(db, COLLECTIONS.shiurim, shiurId), {
      rsvpUids: isRsvped ? arrayRemove(uid) : arrayUnion(uid),
    });
    return true;
  } catch (e) {
    console.warn('Firestore toggleRsvp:', e);
    return false;
  }
}

export async function toggleLike(shiurId: string, uid: string, isLiked: boolean): Promise<boolean> {
  if (!db) return false;
  try {
    await updateDoc(doc(db, COLLECTIONS.shiurim, shiurId), {
      likeUids: isLiked ? arrayRemove(uid) : arrayUnion(uid),
    });
    return true;
  } catch (e) {
    console.warn('Firestore toggleLike:', e);
    return false;
  }
}

export async function getShiurComments(shiurId: string): Promise<ShiurCommentDoc[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, COLLECTIONS.shiurim, shiurId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        shiurId,
        uid: data.uid ?? '',
        displayName: data.displayName ?? 'אורח',
        text: data.text ?? '',
        createdAt: safeTimestampToIso(data.createdAt),
      } as ShiurCommentDoc;
    });
  } catch (e) {
    console.warn('Firestore getShiurComments:', e);
    return [];
  }
}

export async function addShiurComment(shiurId: string, data: {
  uid: string;
  displayName: string;
  text: string;
}): Promise<string | null> {
  if (!db) return null;
  try {
    const r = await addDoc(
      collection(db, COLLECTIONS.shiurim, shiurId, 'comments'),
      { ...data, createdAt: serverTimestamp() }
    );
    return r.id;
  } catch (e) {
    console.warn('Firestore addShiurComment:', e);
    return null;
  }
}

export async function deleteShiurComment(shiurId: string, commentId: string): Promise<boolean> {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, COLLECTIONS.shiurim, shiurId, 'comments', commentId));
    return true;
  } catch (e) {
    console.warn('Firestore deleteShiurComment:', e);
    return false;
  }
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

export async function uploadImage(path: string, uri: string): Promise<string | null> {
  if (!storage) return null;
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch (e) {
    console.warn(`Storage uploadImage (${path}) error:`, e);
    return null;
  }
}
