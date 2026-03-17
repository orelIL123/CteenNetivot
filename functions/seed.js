/**
 * סקריפט Seed ל-Firestore – יוצר את כל הקולקציות ומוסיף את הרב מנחם כמנהל.
 * הרץ: cd functions && npm run seed
 *
 * נדרש: קובץ Service Account. שים google-service-account.json בתיקיית functions או הפרויקט,
 * או: export GOOGLE_APPLICATION_CREDENTIALS=./path/to/sa.json
 */
import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function initAdmin() {
  if (admin.apps.length) return;
  const paths = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    join(__dirname, 'google-service-account.json'),
    join(__dirname, '..', 'google-service-account.json'),
  ].filter(Boolean);
  for (const p of paths) {
    if (p && existsSync(p)) {
      const svc = JSON.parse(readFileSync(p, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(svc), projectId: 'cteennetivot-216e7' });
      return;
    }
  }
  console.error('לא נמצא קובץ Service Account. הורד מ-Firebase Console והנח כ־google-service-account.json');
  admin.initializeApp({ projectId: 'cteennetivot-216e7' });
}

// 054-5367770 = +972 54-5367770
const RABBI_PHONE = '054-5367770';
const RABBI_EMAIL = '0545367770@cteen-netivot.app';
const RABBI_DISPLAY_NAME = 'הרב מנחם';
const RABBI_PASSWORD = 'ChabadNetivot24!';

async function main() {
  initAdmin();
  const db = admin.firestore();
  const auth = admin.auth();

  console.log('🌱 מתחיל seed...\n');

  // ─── 1. יצירת מסמכי התחלה בכל קולקציה ────────────────────────────────────────
  const now = admin.firestore.FieldValue.serverTimestamp();

  // appConfig
  await db.doc('appConfig/main').set({
    heroTitle: 'חב"ד לנוער נתיבות',
    heroSubtitle: 'ברוכים הבאים',
    updatedAt: now,
  }, { merge: true });
  console.log('✔ appConfig/main');

  // config/admins (רק למעקב – האדמין נקבע ב-isAdmin בדוקומנט users)
  await db.doc('config/admins').set({
    uids: [],
    updatedAt: now,
  }, { merge: true });
  console.log('✔ config/admins');

  // דוגמה להתראה (לא חובה)
  await db.collection('notifications').doc('_seed').set({
    title: 'ברוכים הבאים!',
    body: 'האפליקציה של חב"ד לנוער נתיבות מוכנה.',
    time: '09:00',
    date: new Date().toISOString().split('T')[0],
    createdAt: now,
  }, { merge: true });
  console.log('✔ notifications (דוגמה)');

  // דוגמה לעדכון
  await db.collection('updates').doc('_seed').set({
    title: 'עדכון ראשון',
    body: 'זהו עדכון לדוגמה. ניתן למחוק מהאפליקציה.',
    createdAt: now,
  }, { merge: true });
  console.log('✔ updates (דוגמה)');

  // דוגמה לשיעור
  await db.collection('shiurim').doc('_seed').set({
    title: 'שיעור לדוגמה',
    description: 'שיעור טסט',
    teacher: 'הרב מנחם',
    day: 'רביעי',
    time: '20:00',
    location: 'בית חב"ד נתיבות',
    category: 'chassidut',
    rsvpUids: [],
    likeUids: [],
    active: true,
    createdAt: now,
  }, { merge: true });
  console.log('✔ shiurim (דוגמה)');

  // דוגמה לחברותא
  await db.collection('chavrutot').doc('_seed').set({
    name: 'דוגמה',
    age: 16,
    level: 'מתחיל',
    subjects: ['חומש'],
    availability: ['ראשון', 'שלישי'],
    avatar: '👦',
    bio: 'חברותא לדוגמה',
    createdAt: now,
  }, { merge: true });
  console.log('✔ chavrutot (דוגמה)');

  // בתי חב"ד
  await db.collection('chabadHouses').doc('_seed').set({
    name: 'בית חב"ד נתיבות',
    contactName: 'הרב מנחם',
    phone: '054-5367770',
    location: 'נתיבות',
    order: 0,
    createdAt: now,
  }, { merge: true });
  console.log('✔ chabadHouses (דוגמה)');

  // Volunteer requests (דוגמה)
  await db.collection('volunteerRequests').doc('_seed').set({
    title: 'צריך מתנדבים',
    body: 'פעילות ראשונה – מתנדבים יתקבלו בברכה',
    spotsNeeded: 5,
    volunteerUids: [],
    anonymousCount: 0,
    active: true,
    createdAt: now,
  }, { merge: true });
  console.log('✔ volunteerRequests (דוגמה)');

  // ─── 2. הרב מנחם – משתמש ומנהל ─────────────────────────────────────────────
  let rabbiUid;
  try {
    const existing = await auth.getUserByEmail(RABBI_EMAIL);
    rabbiUid = existing.uid;
    console.log(`\n✔ הרב מנחם כבר קיים (uid: ${rabbiUid})`);
  } catch (e1) {
    try {
      const user = await auth.createUser({
        email: RABBI_EMAIL,
        password: RABBI_PASSWORD,
        displayName: RABBI_DISPLAY_NAME,
      });
      rabbiUid = user.uid;
      console.log(`\n✔ נוצר משתמש לרב מנחם (uid: ${rabbiUid})`);
    } catch (e2) {
      console.log('\n⚠️  לא ניתן ליצור משתמש (חסרות הרשאות Auth ל-Service Account).');
      console.log('   הרב מנחם צריך להירשם דרך האפליקציה (054-5367770), ואז הרץ:');
      console.log('   node set-admin.js 0545367770');
      console.log('');
      return;
    }
  }

  await db.doc(`users/${rabbiUid}`).set({
    uid: rabbiUid,
    firstName: 'מנחם',
    lastName: 'הרב',
    displayName: RABBI_DISPLAY_NAME,
    gender: 'male',
    phone: RABBI_PHONE,
    email: RABBI_EMAIL,
    avatar: '👨',
    isAdmin: true,
    createdAt: now,
  }, { merge: true });
  console.log('✔ הרב מנחם הוגדר כמנהל (users/' + rabbiUid + ')');

  console.log('\n✅ ה-seed הושלם בהצלחה!\n');
  console.log('הרב מנחם יכול להתחבר עם:');
  console.log('  טלפון: 054-5367770');
  console.log('  סיסמה: ' + RABBI_PASSWORD);
  console.log('\nמומלץ להחליף סיסמה בהתחברות הראשונה.\n');
}

main().catch((e) => {
  console.error('שגיאה:', e);
  process.exit(1);
});
