export const RABBI = {
  name: 'הרב מנחם ידגר',
  role: 'מנהל בית חב"ד לנוער',
  phone: '+972545367770',
  photo: require('../../assets/rabbi-yadgar.png'),
} as const;

export interface Shiur {
  id: string;
  title: string;
  teacher: string;
  day: string;
  time: string;
  location: string;
  description: string;
  category: 'tanya' | 'parasha' | 'halacha' | 'chassidut' | 'general';
}

export interface DailyStudy {
  date: string;
  hebrewDate: string;
  chitas: {
    chumash: { portion: string; text: string };
    tehillim: { chapter: string; text: string };
    tanya: { section: string; text: string };
  };
  rambam: { chapter: string; text: string };
  hayomYom: { text: string };
}

export interface Chavruta {
  id: string;
  name: string;
  age: number;
  level: 'מתחיל' | 'בינוני' | 'מתקדם';
  subjects: string[];
  availability: string[];
  avatar: string;
  bio: string;
}

export const shiurim = [
  { id: '1', title: 'שיעור תניא שבועי', teacher: 'הרב מנחם ידגר', day: 'ראשון', time: '20:00', location: 'בית חב"ד נתיבות', description: 'לימוד ספר התניא — ספר של בינונים. שיעור מעמיק עם דיון חופשי.', category: 'tanya' as const },
  { id: '2', title: 'פרשת השבוע', teacher: 'הרב מנחם ידגר', day: 'שישי', time: '18:30', location: 'בית חב"ד נתיבות', description: 'עיון בפרשת השבוע עם פירוש רש"י וביאורי החסידות.', category: 'parasha' as const },
  { id: '3', title: 'הלכה יומית', teacher: 'הרב מנחם ידגר', day: 'שני-חמישי', time: '07:30', location: 'בית חב"ד נתיבות', description: 'שיעור הלכה קצר בשולחן ערוך — 15 דקות לפני תפילת שחרית.', category: 'halacha' as const },
  { id: '4', title: 'שיעור חסידות לנוער', teacher: 'הרב מנחם ידגר', day: 'שבת', time: '17:00', location: 'בית חב"ד נתיבות', description: 'שיעור חסידות מיוחד לנוער — שאלות ותשובות, ניגונים ועוד.', category: 'chassidut' as const },
  { id: '5', title: 'לימוד גמרא', teacher: 'הרב מנחם ידגר', day: 'שלישי', time: '19:30', location: 'בית חב"ד נתיבות', description: 'לימוד מסכת ברכות עם פירוש רש"י ותוספות.', category: 'general' as const },
];

export const todayStudy: DailyStudy = {
  date: new Date().toLocaleDateString('he-IL'),
  hebrewDate: 'י״ח אדר תשפ״ו',
  chitas: {
    chumash: { portion: 'ויקרא א׳-ב׳', text: 'וַיִּקְרָא אֶל-מֹשֶׁה...' },
    tehillim: { chapter: 'פרק פ״ח-פ״ט', text: 'שִׁיר מִזְמוֹר לִבְנֵי-קֹרַח...' },
    tanya: { section: 'אגרת הקודש, סימן ז׳', text: 'לְהָבִין מַה שֶּׁכָּתַב הָרַמְבַּ"ם...' },
  },
  rambam: { chapter: 'הלכות תפילה, פרק ד׳', text: 'כֵּיצַד מְכַוְּנִים אֶת הַלֵּב?' },
  hayomYom: { text: 'הַנְּשָׁמָה הִיא נֵר ה׳. כְּשֵׁם שֶׁהַנֵּר מֵאִיר אֶת הַחֶדֶר, כָּךְ הַנְּשָׁמָה מֵאִירָה אֶת הַגּוּף.' },
};

export const chavrutot: Chavruta[] = [
  { id: '1', name: 'יוסף לוי', age: 17, level: 'בינוני', subjects: ['תניא', 'גמרא', 'פרשת השבוע'], availability: ['ראשון', 'שלישי', 'שישי'], avatar: '👦', bio: 'אוהב ללמוד תניא ורוצה חברותא קבועה לשיעורי ערב.' },
  { id: '2', name: 'דוד כהן', age: 16, level: 'מתחיל', subjects: ['פרשת השבוע', 'הלכה', 'חסידות'], availability: ['שני', 'רביעי', 'שבת'], avatar: '🧑', bio: 'מתחיל את הדרך בלימוד חסידות חב"ד, מחפש חברותא סבלנית.' },
  { id: '3', name: 'מנחם שפירא', age: 18, level: 'מתקדם', subjects: ['תניא', 'גמרא', 'רמב"ם'], availability: ['ראשון', 'שני', 'שלישי', 'רביעי'], avatar: '👨', bio: 'לומד בישיבה ורוצה חברותא לחזרה על חומר. זמין רוב הימים.' },
  { id: '4', name: 'אריה גולדברג', age: 15, level: 'מתחיל', subjects: ['פרשת השבוע', 'חסידות'], availability: ['חמישי', 'שישי', 'שבת'], avatar: '🧒', bio: 'בן 15, מחפש חברותא לפרשת השבוע עם ביאורי חסידות.' },
  { id: '5', name: 'שמואל ברגר', age: 17, level: 'בינוני', subjects: ['גמרא', 'הלכה', 'תניא'], availability: ['ראשון', 'שלישי', 'חמישי'], avatar: '👦', bio: 'לומד גמרא ברמה בינונית, מחפש חברותא לחזרה ועיון.' },
];

export const categoryColors: Record<string, string> = {
  tanya: '#E8A96A', parasha: '#4BBFCF', halacha: '#7C9E87', chassidut: '#9B7EC8', general: '#E07B7B',
};

export const categoryLabels: Record<string, string> = {
  tanya: 'תניא', parasha: 'פרשה', halacha: 'הלכה', chassidut: 'חסידות', general: 'כללי',
};
