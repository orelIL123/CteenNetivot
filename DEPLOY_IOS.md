# בניית האפליקציה ל-iOS ו-TestFlight

## דרישות מקדימות

1. **חשבון Apple Developer** – נדרש מנוי שנתי ($99) מ-[developer.apple.com](https://developer.apple.com)
2. **EAS CLI** – `npm install -g eas-cli`
3. **התחברות ל-Expo** – `eas login`

---

## בנייה ראשונה (אינטראקטיבית)

בפעם הראשונה יש להריץ את הבנייה **במצב אינטראקטיבי** כדי להגדיר תעודות Apple:

```bash
eas build --platform ios --profile production
```

במהלך הריצה תתבקש:
- **iOS app uses standard encryption?** – בחר `Y` (כן) אם האפליקציה משתמשת רק ב-HTTPS רגיל
- **Credentials** – EAS יכול ליצור אוטומטית:
  - Distribution Certificate
  - Provisioning Profile
  - או לחבר למפתחות קיימים מ-Apple

---

## אחרי שהתעודות קיימות

```bash
eas build --platform ios --profile production --non-interactive
```

---

## שליחה ל-TestFlight

אחרי שהבנייה מסתיימת בהצלחה:

### אוטומטי (עם App Store Connect API Key)

1. ב-[App Store Connect](https://appstoreconnect.apple.com) → Users and Access → Keys:
   - צור **App Store Connect API Key**
   - הורד את הקובץ `.p8` ושמור כ־`AuthKey.p8`

2. עדכן ב-`eas.json`:
   ```json
   "submit": {
     "production": {
       "ios": {
         "ascAppId": "YOUR_APP_ID",
         "ascApiKeyIssuerId": "YOUR_ISSUER_ID",
         "ascApiKeyId": "YOUR_KEY_ID",
         "ascApiKeyPath": "./AuthKey.p8"
       }
     }
   }
   ```

3. הרץ:
   ```bash
   eas submit --platform ios --latest
   ```

### ידנית

1. היכנס ל-[expo.dev](https://expo.dev) → פרויקט CTeen → Builds
2. הורד את קובץ ה-`.ipa` מהבנייה האחרונה
3. העלה ל-TestFlight דרך [App Store Connect](https://appstoreconnect.apple.com) → TestFlight → הוסף בנייה

---

## פקודת בנייה מלאה

```bash
eas build --platform ios --profile production
```
