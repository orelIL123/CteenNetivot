# הרצת Seed ל-Firestore

הסקריפט יוצר את כל הקולקציות הרלוונטיות ומוסיף את הרב מנחם כמנהל.

## הכנה

1. הורד קובץ Service Account מ-Firebase Console:
   - Firebase Console → הגדרות פרויקט (⚙️) → חשבונות שירות
   - צור מפתח פרטי חדש (או השתמש בקיים)
   - שמור את הקובץ כ־`google-service-account.json` בתיקיית `functions/` או בתיקיית הפרויקט

2. (אופציונלי) הגדר משתנה סביבה:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./path/to/google-service-account.json"
   ```

   ⚠️ הוסף את הקובץ ל-.gitignore – אין להעלות מפתחות ל-Git!

## הרצה

```bash
cd functions
npm run seed
```

או:

```bash
cd functions
node seed.js
```

## מה נוצר

- **appConfig** – הגדרות ראשיות
- **notifications** – דוגמה להתראה
- **updates** – דוגמה לעדכון
- **shiurim** – דוגמה לשיעור
- **chavrutot** – דוגמה לחברותא
- **chabadHouses** – דוגמה לבית חב"ד
- **volunteerRequests** – דוגמה לבקשת מתנדבים
- **config/admins** – מסמך אדמינים

- **משתמש הרב מנחם** (מנהל):
  - טלפון: 054-5367770
  - סיסמה: ChabadNetivot24!
  - יש להחליף סיסמה בהתחברות הראשונה
