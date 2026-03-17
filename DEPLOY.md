# פריסת Firebase (דיפלוי)

## דרישות מקדימות

1. **פרויקט Firebase** – כבר קיים (למשל `cteennetivot-216e7`).
2. **קובץ `.env`** – העתק מ-`.env.example` והכנס ערכים מ-Firebase Console → Project settings.
3. **Firebase CLI** – אם עדיין לא: `npm install -g firebase-tools` ואז `firebase login`.

---

## 1. הפעלת אימות (Authentication)

- ב-Firebase Console: **Authentication** → **Sign-in method**.
- הפעל **Anonymous** (אימות אנונימי).
- (אופציונלי להמשך: Email/Password אם תרצה התחברות עם אימייל לרב.)

בלי הפעלת Anonymous האפליקציה לא תצליח להתחבר ל-Firestore (הכללים דורשים `request.auth != null`).

---

## 2. פריסת כללי Firestore ואינדקסים

משורש הפרויקט:

```bash
firebase deploy --only firestore
```

זה יעלה:
- **firestore.rules** – קריאה/כתיבה לפי ההרשאות שהוגדרו.
- **firestore.indexes.json** – אינדקסים ל־`notifications` ו־`updates` (מיון לפי `createdAt`).

אם הפרויקט שלך לא ברירת המחדל:

```bash
firebase use cteennetivot-216e7
firebase deploy --only firestore
```

(המזהה ב-`.firebaserc` כבר מוגדר ל־`cteennetivot-216e7`.)

---

## 3. אוסף אדמינים (אופציונלי להמשך)

כרגע כל משתמש מחובר (כולל Anonymous) יכול לכתוב ל־`notifications` ו־`updates`. אם תרצה להגביל כתיבה רק לרב:

- צור ב-Firestore מסמך: **config** (אוסף) → **admins** (מסמך).
- בשדה `uids` (מערך) הוסף את ה־UID של הרב (אחרי שיתחבר עם אימייל/סיסמה או שתעתיק מ-Console).
- עדכן את **firestore.rules** כך שכתיבה ל־notifications/updates תתאפשר רק אם `request.auth.uid` ב־`config/admins.uids` (ניתן להוסיף בהמשך).

---

## 4. סיכום

| פעולה | פקודה / מקום |
|--------|----------------|
| התחברות ל-Firebase CLI | `firebase login` |
| בחירת פרויקט | `firebase use cteennetivot-216e7` |
| פריסת Firestore (rules + indexes) | `firebase deploy --only firestore` |
| הפעלת Anonymous | Console → Authentication → Sign-in method |

אחרי דיפלוי והפעלת Anonymous, האפליקציה תתחבר באימות אנונימי ותוכל לקרוא/לכתוב ל-Firestore לפי הכללים שנפרסו.
