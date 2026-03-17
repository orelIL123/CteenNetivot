/**
 * הופך משתמש קיים לאדמין לפי טלפון (או uid).
 * הרץ: node set-admin.js 0545367770
 * או:  node set-admin.js <uid>
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
  admin.initializeApp({ projectId: 'cteennetivot-216e7' });
}

async function main() {
  const arg = process.argv[2];
  initAdmin();
  const db = admin.firestore();
  const auth = admin.auth();

  if (arg === '--list' || arg === '-l') {
    const snap = await db.collection('users').get();
    console.log('משתמשים רשומים (' + snap.size + '):\n');
    snap.docs.forEach((d) => {
      const data = d.data();
      console.log('  uid:', d.id);
      console.log('    שם:', data.displayName || data.firstName, data.lastName);
      console.log('    טלפון:', data.phone, '| אימייל:', data.email);
      console.log('    אדמין:', !!data.isAdmin);
      console.log('');
    });
    return;
  }

  if (!arg) {
    console.log('שימוש: node set-admin.js <טלפון> | <uid> | --list');
    console.log('דוגמאות:');
    console.log('  node set-admin.js 0545367770    – לפי טלפון');
    console.log('  node set-admin.js --list       – רשימת כל המשתמשים');
    process.exit(1);
  }

  let uid;
  if (arg.length > 25) {
    uid = arg;
  } else {
    const digits = arg.replace(/\D/g, '');
    const emails = [digits + '@cteen-netivot.app'];
    if (digits.startsWith('0')) {
      emails.push('972' + digits.slice(1) + '@cteen-netivot.app');
    } else if (digits.startsWith('972')) {
      emails.push('0' + digits.slice(3) + '@cteen-netivot.app');
    }
    let found = false;
    for (const email of emails) {
      const snap = await db.collection('users').where('email', '==', email).limit(1).get();
      if (!snap.empty) {
        uid = snap.docs[0].id;
        found = true;
        break;
      }
    }
    if (!found) {
      try {
        const user = await auth.getUserByEmail(emails[0]);
        uid = user.uid;
      } catch {
        console.error('לא נמצא משתמש עם הטלפון', arg);
        console.log('הרץ: node set-admin.js --list  כדי לראות משתמשים רשומים');
        process.exit(1);
      }
    }
  }

  await db.doc(`users/${uid}`).set({ isAdmin: true }, { merge: true });
  console.log('✔ המשתמש', uid, 'הוגדר כמנהל');
}

main().catch((e) => {
  console.error('שגיאה:', e);
  process.exit(1);
});
