# מסמך מסודר למילוי פרטי האפליקציה ב־Google Play וב־App Store

מסמך זה הוכן לפי הפרויקט הקיים בתיקייה זו, ולכן הוא מותאם לאפליקציה:

- שם אפליקציה: `CTeen נתיבות`
- מזהה חבילה / Bundle ID: `com.cteenNetivot.app`
- פלטפורמה: Expo / React Native
- פונקציות עיקריות שזוהו בקוד:
  - הרשמה והתחברות
  - פרופיל משתמש
  - העלאת תמונת פרופיל מהגלריה
  - התראות פוש
  - שיעורים / לוח פעילות
  - חברותות
  - עדכונים והודעות
  - בתי חב"ד
  - התנדבות

חשוב: חלק מהשדות בחנויות הם הצהרתיים ומשפטיים. לכן את סעיפי הפרטיות, דירוג הגיל וכתובות ה־URL צריך לאשר סופית מול מי שמנהל את האפליקציה בפועל.

---

## 1. סיכום קצר של מה צריך להכין מראש

לפני פתיחת הפרסום בפועל, להכין:

- אייקון סופי של האפליקציה
- לפחות 5 צילומי מסך טובים מהאפליקציה
- עמוד `Privacy Policy` ציבורי עם URL
- עמוד `Support` ציבורי עם אימייל/טלפון/דרך יצירת קשר
- חשבון דמו לבדיקה עבור Apple ו־Google
- תיאור קצר ותיאור מלא
- פרטי איש קשר של המפתח / הארגון
- החלטה ברורה האם האפליקציה מיועדת לילדים או לא

---

## 2. מה האפליקציה אוספת בפועל לפי הקוד

לפי בדיקת הקוד בפרויקט, האפליקציה ככל הנראה אוספת או שומרת:

- שם פרטי
- שם משפחה
- מספר טלפון
- אימייל פנימי נגזר ממספר הטלפון
- מגדר
- תמונת פרופיל, אם המשתמש מעלה
- מזהה משתמש
- טוקן התראות פוש
- תוכן שהמשתמש מבצע באפליקציה, למשל הרשמה, תגובות, RSVP, התנדבות

לפי הקוד לא זוהו כרגע:

- מעקב פרסומי
- SDK של פרסום
- איסוף מיקום GPS
- גישה לאנשי קשר
- תשלומים בתוך האפליקציה
- מעקב Cross-App

הרשאות/יכולות שזוהו:

- התראות פוש
- גישה לגלריית תמונות לצורך תמונת פרופיל
- שימוש ב־Firebase Auth / Firestore / Storage

הערה חשובה:
אם הופעלו מחוץ לקוד המוצג גם Firebase Analytics, Crashlytics, SDK פרסומי, Hotjar, Sentry, AppsFlyer, OneSignal או כל כלי צד ג' אחר, צריך להוסיף אותם להצהרות הפרטיות.

---

## 3. Google Play: מה למלא

### 3.1 פרטי אפליקציה בסיסיים

למלא:

- `App name`
  - הצעה: `CTeen נתיבות`
- `Default language`
  - הצעה: `Hebrew - he-IL`
- `App or Game`
  - `App`
- `Category`
  - הצעה: `Lifestyle`
  - חלופה סבירה: `Education`
- `Contact details`
  - אימייל תמיכה
  - מספר טלפון תמיכה
  - אתר / עמוד תמיכה
- `Privacy Policy`
  - URL ציבורי מלא

### 3.2 טקסטים לחנות Google Play

מגבלות אורך חשובות:

- `App title`: עד `30` תווים
- `Short description`: עד `80` תווים
- `Full description`: עד `4000` תווים

#### App name

`CTeen נתיבות`

#### Short description

הצעה להדבקה:

`אפליקציית חב"ד לנוער נתיבות: שיעורים, עדכונים, חברותות והתראות`

#### Full description

הצעה להדבקה:

`CTeen נתיבות היא האפליקציה הרשמית של חב"ד לנוער נתיבות.

באפליקציה תוכלו להישאר מחוברים לכל מה שקורה בקהילה במקום אחד, בצורה נוחה, פשוטה ומותאמת לנוער.

מה מחכה לכם באפליקציה:
- שיעורים קבועים ועדכניים
- לוח פעילות שבועי
- עדכונים והודעות חשובות
- התראות פוש על תוכן חדש ואירועים
- מציאת חברותות ללימוד
- מידע על בתי חב"ד
- אזור פרופיל אישי
- אפשרות להשתתף ביוזמות התנדבות

האפליקציה נועדה לחזק את הקשר לקהילה, ללימוד ולפעילות השוטפת של CTeen נתיבות, ולאפשר גישה נוחה למידע חשוב בכל זמן.

האפליקציה מיועדת למשתמשי קהילת חב"ד לנוער נתיבות ולכל מי שמעוניין להישאר מעודכן בשיעורים, בפעילויות ובתוכן הערכי של הקהילה.`

### 3.3 גרפיקה ונכסים ל־Google Play

להכין:

- אייקון אפליקציה
- `Feature graphic`
  - גודל רשמי: `1024x500`
- לפחות 2 צילומי מסך
  - בפועל מומלץ 5 עד 8
- סרטון תצוגה, לא חובה

מומלץ שסדר צילומי המסך יהיה:

1. מסך הבית
2. מסך שיעורים
3. מסך חברותות
4. מסך עדכונים / התראות
5. מסך פרופיל / התנדבות

### 3.4 Data safety ב־Google Play

להלן טיוטת עבודה. צריך לעבור עליה ידנית לפני שליחה:

#### Does your app collect or share any of the required user data types?

הצעה: `Yes`

#### Is all of the user data collected by your app encrypted in transit?

הצעה: `Yes`

#### Do you provide a way for users to request that their data is deleted?

הצעה:

- `Yes`, רק אם קיימת בפועל מחיקה דרך האפליקציה או דרך עמוד/מייל מסודר
- אחרת `No`

#### סוגי נתונים שסביר שצריך לסמן כ־Collected

- `Personal info`
  - Name
  - Phone number
  - Email address
- `Photos and videos`
  - Photos
  - רק אם תמונת פרופיל מועלת לשרת
- `App activity`
  - In-app interactions
  - אם אתם שומרים RSVP, תגובות, התנדבות, הפעלת התראות וכדומה
- `Device or other IDs`
  - Push token / app instance token

#### מטרות שימוש סבירות לפי הקוד

- `App functionality`
- `Account management`
- `Communications`
- `Personalization`, רק אם בפועל אתם מתאימים תוכן למשתמש

#### סוגי נתונים שסביר שלא צריך לסמן כרגע

- מיקום מדויק
- אנשי קשר
- הודעות SMS
- אודיו
- תשלומים
- בריאות וכושר
- פרסום

### 3.5 Content rating ב־Google Play

צריך למלא את שאלון דירוג התוכן בתוך Play Console.

המלצה מעשית:

- אם אין תוכן אלים, מיני, הימורים או שפה בוטה, הדירוג כנראה יהיה נמוך
- בגלל שיש תוכן משתמשים מסוים כמו פרופילים/תגובות/אינטראקציות, לא למלא סתם "מיועד לילדים" בלי בדיקה

### 3.6 App access / Review

מאחר שיש הרשמה והתחברות, להכין לגוגל:

- חשבון דמו פעיל לבדיקה
- שם משתמש
- סיסמה
- הסבר קצר איך להגיע למסכים המרכזיים

טקסט מוצע לשדה ההערות לבדיקה:

`לצורך בדיקה ניתן להתחבר עם חשבון הדמו המצורף. לאחר התחברות ניתן לגשת למסכי שיעורים, עדכונים, חברותות, פרופיל והתנדבות. אם נדרשת עזרה נוספת בבדיקת האפליקציה, ניתן לפנות לאיש הקשר המצוין בפרטי התמיכה.`

### 3.7 שאלות נוספות ב־Play Console שכדאי להכין להן תשובה

- האם יש פרסומות?  
  הצעה: `No`
- האם יש רכישות בתוך האפליקציה?  
  הצעה: `No`
- האם האפליקציה מיועדת לילדים?  
  לבדוק היטב לפני סימון
- האם יש גישה לחשבון מוגבל / תוכן מאחורי התחברות?  
  הצעה: `Yes`

---

## 4. App Store: מה למלא

### 4.1 App Information

#### Name

הצעה:

`CTeen נתיבות`

מגבלת אורך: עד `30` תווים

#### Subtitle

הצעה:

`שיעורים, עדכונים וחברותות`

מגבלת אורך: עד `30` תווים

#### Bundle ID

`com.cteenNetivot.app`

#### SKU

הצעה:

`cteen-netivot-ios`

#### Primary language

הצעה:

`Hebrew`

#### Category

הצעה:

- ראשית: `Lifestyle`
- משנית: `Education`

#### Age Rating

למלא לפי השאלון ב־App Store Connect.

הערה:
אם יש תגובות משתמשים, פרופילים או תוכן שנוצר על ידי משתמשים, לענות בזהירות ולא לסמן אוטומטית דירוג נמוך בלי לבדוק.

### 4.2 גרסת האפליקציה ב־App Store

#### Promotional Text

הצעה:

`כל העדכונים, השיעורים והפעילות של CTeen נתיבות במקום אחד.`

מגבלת אורך: עד `170` תווים

#### Description

הצעה להדבקה:

`CTeen נתיבות היא האפליקציה הרשמית של חב"ד לנוער נתיבות.

האפליקציה מרכזת במקום אחד את כל התוכן, הפעילויות והעדכונים של הקהילה, כדי לאפשר גישה נוחה, מהירה וברורה לכל מה שחשוב.

באפליקציה תוכלו למצוא:

- שיעורים ותוכן תורני מעודכן
- לוח פעילות שבועי
- עדכונים והודעות שוטפות
- התראות פוש
- אזור חברותות ללימוד
- מידע על בתי חב"ד
- פרופיל אישי
- אפשרות להשתתף בפעילויות והתנדבות

האפליקציה מיועדת לחברי קהילת CTeen נתיבות ולכל מי שרוצה להישאר מחובר לפעילות, ללימוד ולקשר הקהילתי.`

#### Keywords

הצעה:

`חבד,נוער,נתיבות,שיעורים,חברותא,קהילה,תניא,חסידות,cteen`

מגבלת אורך: עד `100 bytes`

#### Support URL

למלא URL ציבורי אמיתי, למשל:

`https://your-domain.com/support`

#### Marketing URL

אם יש אתר/דף נחיתה:

`https://your-domain.com`

#### Privacy Policy URL

חובה למלא URL ציבורי אמיתי, למשל:

`https://your-domain.com/privacy`

### 4.3 App Review Information

למלא:

- איש קשר לבדיקה
- טלפון
- אימייל
- חשבון דמו
- סיסמת דמו
- Notes for Review

טקסט מוצע ל־Notes for Review:

`This app is the official app of CTeen Netivot. Reviewers can use the demo account provided in App Review Information to access the main features. After login, the app includes lessons, updates, chavruta matching, notifications, volunteer content, and a personal profile area. Photo library access is used only if the reviewer chooses to upload a profile image. Push notifications are optional and require user permission.`

### 4.4 App Privacy ב־Apple

להלן טיוטת עבודה, לפי הקוד שנסרק:

#### Data Types שסביר שצריך לדווח

- `Contact Info`
  - Name
  - Phone Number
  - Email Address
- `User Content`
  - Photos
  - Other User Content, רק אם תגובות/טקסטים של משתמש נשמרים
- `Identifiers`
  - User ID
  - Device token / Push token

#### Purposes שסביר שצריך לסמן

- `App Functionality`
- `Product Personalization`, רק אם באמת יש התאמה אישית

#### Tracking

הצעה: `No`

#### Data Linked to User

ברוב הסיכויים: `Yes`

כי הפרטים נשמרים יחד עם חשבון המשתמש.

### 4.5 צילומי מסך ל־App Store

להכין:

- לפחות צילום מסך אחד ל־iPhone
- אם האפליקציה תומכת iPad, להכין גם ל־iPad

בפועל מומלץ:

- 5 עד 10 צילומי מסך
- סדר מסכים:
  1. בית
  2. שיעורים
  3. חברותות
  4. עדכונים / התראות
  5. פרופיל
  6. התנדבות

הערה מעודכנת:
נכון ל־11 במרץ 2026, לפי תיעוד App Store Connect של Apple, נדרשת לפחות תמונת מסך אחת ולכל היותר 10 לכל סוג מכשיר נתמך. אם האפליקציה רצה גם על iPad, יש להכין גם נכסים מתאימים ל־iPad. שיווקית עדיף להעלות סט מלא.

---

## 5. מה חסר לכם כרגע לפני עלייה לחנויות

לפי הקבצים שנסרקו, הדברים הבאים עדיין צריכים הכנה/אימות:

- URL אמיתי ל־Privacy Policy
- URL אמיתי ל־Support
- אתר / Marketing URL אם רוצים
- חשבון דמו אמיתי לבדיקה
- החלטה סופית על קטגוריה ראשית
- החלטה סופית על דירוג גיל
- אימות סופי של הצהרות הפרטיות מול כל שירותי הצד השלישי
- סט צילומי מסך שיווקיים

---

## 6. נוסח קצר לפרטיות שאפשר לבסס עליו Privacy Policy

אפשר לבנות עמוד פרטיות סביב הנקודות הבאות:

- אילו פרטים נאספים: שם, טלפון, אימייל, מגדר, תמונת פרופיל, טוקן התראות
- למה הנתונים נאספים: פתיחת חשבון, תפעול האפליקציה, התאמה בסיסית של חוויית משתמש, שליחת התראות
- היכן הנתונים נשמרים: Firebase
- מתי ניגשים לתמונות: רק כשהמשתמש בוחר להעלות תמונת פרופיל
- מתי נשלחות התראות: רק לאחר אישור המשתמש
- איך מבקשים מחיקה/עדכון נתונים
- פרטי יצירת קשר בנושא פרטיות

---

## 7. המלצה מעשית למילוי מהיר

אם המטרה היא לעלות מהר לחנויות, זה הסדר המומלץ:

1. להעלות עמוד `Privacy Policy`
2. להעלות עמוד `Support`
3. להכין חשבון דמו
4. להכין צילומי מסך
5. להשתמש בטקסטים המוצעים במסמך הזה
6. למלא Data safety / App Privacy רק אחרי מעבר סופי על כל ה־SDKs

---

## 8. מקורות רשמיים שנבדקו

- Google Play Console Help: [Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152)
- Google Play Console Help: [Add preview assets to showcase your app](https://support.google.com/googleplay/android-developer/answer/1078870)
- Google Play Console Help: [Provide information for Google Play's Data safety section](https://support.google.com/googleplay/android-developer/answer/10787469)
- Google Play Console Help: [Developer Program Policy](https://support.google.com/googleplay/android-developer/answer/16329168)
- Apple App Store Connect Help: [App information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information)
- Apple App Store Connect Help: [Platform version information](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information)
- Apple Developer: [App privacy details](https://developer.apple.com/app-store/app-privacy-details/)
- Apple App Store Connect Help: [Upload app previews and screenshots](https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots/)
- Apple App Store Connect Help: [Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications)
- Apple Developer: [App Review](https://developer.apple.com/app-store/review/)
